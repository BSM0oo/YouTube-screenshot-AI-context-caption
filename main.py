from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List, Dict
import base64
import json
import os
import asyncio
from playwright.async_api import async_playwright
from anthropic import Anthropic
from dotenv import load_dotenv
from transcript_retriever import EnhancedTranscriptRetriever
from modules.gif_capture import GifCapture
import yt_dlp
import re
from urllib.parse import urlparse
from dataclasses import dataclass
import cv2
import numpy as np
from PIL import Image
import pytesseract
import io
import traceback
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
from fastapi.responses import HTMLResponse
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# Load environment variables
load_dotenv()

# Initialize Anthropic client
anthropic = Anthropic(
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

# Initialize GIF capture
gif_capture = GifCapture()

YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create data directory if it doesn't exist
DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)
SCREENSHOTS_DIR = DATA_DIR / 'screenshots'
SCREENSHOTS_DIR.mkdir(exist_ok=True)
STATIC_DIR = Path(__file__).parent / "static"


@dataclass
class VideoInfo:
    """Class to store video information in a structured format"""
    title: str
    description: str
    chapters: List[Dict[str, str]]
    links: List[str]

class VideoRequest(BaseModel):
    video_id: str
    timestamp: float 
    generate_caption: bool = True

class CaptionRequest(BaseModel):
    timestamp: float
    image_data: str
    transcript_context: str
    prompt: Optional[str] = None

class VideoFrameAnalysisRequest(BaseModel):
    video_id: str
    start_time: float
    duration: float = 30.0  # Default to 30 seconds

class GifCaptureRequest(BaseModel):
    video_id: str
    start_time: float
    duration: float = 3.0  # Default to 3 seconds
    fps: Optional[int] = 10
    width: Optional[int] = 480

class QuestionRequest(BaseModel):
    transcript: str
    question: str
    timestamp: float

class TranscriptAnalysisRequest(BaseModel):
    transcript: str

# Add this class with the existing BaseModel classes
class TranscriptQueryRequest(BaseModel):
    transcript: list
    prompt: str


class SceneDetector:
    def __init__(self):
        self.threshold = 30.0  # Scene change threshold
        
    def detect_scene_change(self, frame1, frame2):
        """Detect if there's a significant scene change between frames"""
        if frame1 is None or frame2 is None:
            return False
            
        # Convert frames to grayscale
        gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
        
        # Calculate difference
        diff = cv2.absdiff(gray1, gray2)
        mean_diff = np.mean(diff)
        return mean_diff > self.threshold
        
    def detect_text_presence(self, frame):
        """Detect if frame contains significant text"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Enhance contrast
        enhanced = cv2.equalizeHist(gray)
        
        # Convert to PIL Image for Tesseract
        pil_image = Image.fromarray(enhanced)
        
        # Extract text
        text = pytesseract.image_to_string(pil_image)
        return len(text.strip()) > 20
        
    def is_slide_frame(self, frame):
        """Detect if frame likely contains a presentation slide"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold
        _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        
        # Look for rectangular shapes
        edges = cv2.Canny(thresh, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            # Approximate the contour
            epsilon = 0.04 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Check if it's rectangular
            if len(approx) == 4:
                # Get area of the rectangle
                area = cv2.contourArea(contour)
                image_area = frame.shape[0] * frame.shape[1]
                
                # Check if rectangle is large enough (>20% of frame)
                if area > 0.2 * image_area:
                    return True
        return False

def is_valid_youtube_url(url: str) -> bool:
    """Validate if the provided URL is a valid YouTube URL."""
    parsed = urlparse(url)
    return bool(parsed.netloc) and parsed.netloc.endswith(('youtube.com', 'youtu.be'))

def extract_links_from_description(description: str) -> List[str]:
    """Extract all URLs from the video description using regex."""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(url_pattern, description)

def get_video_info(video_id: str) -> Optional[VideoInfo]:
    """Extract information from a YouTube video using the YouTube Data API."""
    try:
        # Get video details
        video_response = youtube.videos().list(
            part='snippet,contentDetails',
            id=video_id
        ).execute()

        if not video_response['items']:
            return None

        video_data = video_response['items'][0]
        description = video_data['snippet']['description']
        title = video_data['snippet']['title']
        
        # Extract chapters from description (YouTube stores chapters in description)
        chapters = []
        lines = description.split('\n')
        for line in lines:
            # Look for timestamp patterns like "0:00" or "00:00" or "0:00:00"
            match = re.search(r'^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s*[-–]\s*(.+)$', line.strip())
            if match:
                groups = match.groups()
                if len(groups) == 4:
                    hours = int(groups[0]) if groups[0] else 0
                    minutes = int(groups[1])
                    seconds = int(groups[2])
                    title = groups[3].strip()
                    time_seconds = hours * 3600 + minutes * 60 + seconds
                    chapters.append({
                        'start_time': time_seconds,
                        'title': title
                    })

        links = extract_links_from_description(description)
        
        return VideoInfo(
            title=title,
            description=description,
            chapters=chapters,
            links=links
        )

    except HttpError as e:
        print(f"An HTTP error occurred: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@app.get("/api/transcript/{video_id}")
async def get_transcript(video_id: str):
    """Get transcript for a YouTube video using enhanced retrieval system"""
    try:
        print(f"Attempting to get transcript for video ID: {video_id}")
        
        transcript_retriever = EnhancedTranscriptRetriever()
        transcript = await transcript_retriever.get_transcript(video_id)
        
        if transcript:
            return {"transcript": transcript}
        else:
            raise HTTPException(
                status_code=404,
                detail="No transcript could be retrieved"
            )
            
    except Exception as e:
        print(f"Transcript error: {str(e)}")
        error_msg = f"Could not get transcript: {str(e)}"
        if "No transcript found" in str(e):
            error_msg = "No transcript/captions available for this video"
        raise HTTPException(status_code=404, detail=error_msg)

@app.post("/api/capture-screenshot")
async def capture_screenshot(request: VideoRequest):
    """Capture a screenshot from a YouTube video using Playwright"""
    max_retries = 3
    current_try = 0
    
    # Extract whether to generate captions
    generate_caption = getattr(request, 'generate_caption', True)
    
    while current_try < max_retries:
        try:
            current_try += 1
            print(f"Screenshot attempt {current_try} of {max_retries}")
            
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                
                # Set a user agent to appear more like a regular browser
                await page.set_extra_http_headers({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                })

                # Try embedding with modest branding and origin parameters
                embed_url = f"https://www.youtube.com/embed/{request.video_id}?start={int(request.timestamp)}&autoplay=1&modestbranding=1&origin=http://localhost"
                await page.goto(embed_url)
                
                await page.wait_for_load_state('networkidle')
                
                # Wait for and handle video element
                await page.wait_for_selector('video')
                await page.evaluate("""
                    const video = document.querySelector('video');
                    video.currentTime = parseInt(new URL(window.location.href).searchParams.get('start'));
                    video.play();
                """)
                
                # Wait for frame to load
                await asyncio.sleep(1.5)
                
                # Pause video and remove controls
                await page.evaluate("document.querySelector('video').pause()")
                await page.add_style_tag(content="""
                    .ytp-chrome-bottom { display: none !important; }
                    .ytp-large-play-button { display: none !important; }
                    .ytp-gradient-bottom { display: none !important; }
                """)
                
                # Take screenshot
                screenshot_bytes = await page.screenshot(
                    type='png',
                    clip={'x': 0, 'y': 0, 'width': 1280, 'height': 720}
                )
                
                # Save to data directory
                timestamp_str = f"{int(request.timestamp)}"
                file_path = SCREENSHOTS_DIR / f"yt_{request.video_id}_{timestamp_str}.png"
                
                with open(file_path, "wb") as f:
                    f.write(screenshot_bytes)
                
                # Convert to base64 for response
                base64_screenshot = base64.b64encode(screenshot_bytes).decode()
                
                print("Screenshot captured and saved successfully")
                if not generate_caption:
                    return {"image_data": f"data:image/png;base64,{base64_screenshot}"}
                    
                return {
                    "image_data": f"data:image/png;base64,{base64_screenshot}",
                    "generate_caption": True
                }
                
        except Exception as e:
            print(f"Screenshot attempt {current_try} failed: {str(e)}")
            if current_try >= max_retries:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to capture screenshot after {max_retries} attempts: {str(e)}"
                )
            await asyncio.sleep(2)  # Wait before retry


@app.get("/api/state/load")
async def load_state():
    """Load application state from file system"""
    try:
        state_file = DATA_DIR / "app_state.json"
        if not state_file.exists():
            return {"state": None}

        with open(state_file, "r") as f:
            state = json.load(f)

        if "screenshots" in state:
            screenshots_dir = DATA_DIR / "screenshots"
            for screenshot in state["screenshots"]:
                if "image" in screenshot and isinstance(screenshot["image"], str):
                    image_path = screenshots_dir / screenshot["image"]
                    if image_path.exists():
                        try:
                            with open(image_path, "rb") as f:
                                image_data = base64.b64encode(f.read()).decode()
                                screenshot["image"] = f"data:image/png;base64,{image_data}"
                        except Exception as e:
                            print(f"Error loading screenshot: {e}")

        return {"state": state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/capture-gif")
async def capture_gif(request: GifCaptureRequest):
    """Capture a GIF from a YouTube video"""
    try:
        gif_data = await gif_capture.capture_gif(
            video_id=request.video_id,
            start_time=request.start_time,
            duration=request.duration,
            fps=request.fps,
            width=request.width
        )
        
        # Save GIF to disk
        timestamp_str = f"{int(request.start_time)}"
        file_path = SCREENSHOTS_DIR / f"yt_{request.video_id}_{timestamp_str}.gif"
        
        with open(file_path, "wb") as f:
            f.write(gif_data)
        
        # Convert to base64 for response
        base64_gif = base64.b64encode(gif_data).decode()
        
        return {
            "gif_data": f"data:image/gif;base64,{base64_gif}"
        }
        
    except Exception as e:
        print(f"GIF capture error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/state/clear")
async def clear_state(eraseFiles: bool = Query(False)):
    """Clear all saved state and optionally delete files"""
    try:
        print(f"Clearing state with eraseFiles={eraseFiles}")
        
        screenshots_dir = DATA_DIR / "screenshots"
        if screenshots_dir.exists():
            if eraseFiles:
                print("Deleting screenshots directory")
                for file in screenshots_dir.glob("*"):
                    try:
                        file.unlink()
                    except Exception as e:
                        print(f"Error deleting file {file}: {e}")
                try:
                    screenshots_dir.rmdir()
                except Exception as e:
                    print(f"Error removing screenshots directory: {e}")
            else:
                print("Keeping screenshot files")

        state_file = DATA_DIR / "app_state.json"
        if state_file.exists():
            if eraseFiles:
                print("Deleting state file")
                state_file.unlink()
            else:
                print("Clearing state file contents")
                with open(state_file, "w") as f:
                    json.dump({}, f)

        if eraseFiles:
            print("Recreating directories")
            DATA_DIR.mkdir(exist_ok=True)
            screenshots_dir.mkdir(exist_ok=True)

        return {"message": "State cleared successfully"}
    except Exception as e:
        print(f"Error in clear_state: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-caption")
async def generate_caption(screenshot: CaptionRequest):
    """Generate AI caption for screenshot with improved context handling"""
    try:
        transcript_text = screenshot.transcript_context.strip()
        if not transcript_text:
            raise HTTPException(status_code=400, detail="No transcript context provided")

        base_prompt = screenshot.prompt if screenshot.prompt else """Generate a concise and informative caption for this moment in the video.
            The caption should be a direct statement about the key point, without referring to the video or transcript."""

        prompt = f"""Here is the transcript context around timestamp {screenshot.timestamp}:

{transcript_text}

{base_prompt}

Generate a caption consisting of 3 bullet points that AVOIDS using introductory statements like here is a caption consisting of 3 bullet points that meet the specified criteria:
1. Makes direct, actionable statements about each of the 3 key points
2. Uses relevant technical terms or concepts
3. Avoids phrases like "The video shows...", "In this screenshot...", "The speaker explains..."


Examples:
❌ "The video demonstrates proper golf swing technique"
✅ "Maintain a firm grip while keeping wrists relaxed during the backswing"

❌ "The speaker explains the importance of data structures"
✅ "Hash tables provide O(1) average time complexity for lookups"

Caption:"""

        response = anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=150,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        caption = response.content[0].text.strip()
        return {"caption": caption}
    except Exception as e:
        print(f"Caption error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-transcript")
async def analyze_transcript(request: TranscriptAnalysisRequest):
    """Analyze video transcript for structure and key points"""
    try:
        response = anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": f"""Analyze this video transcript and provide:
                
                1. A high-level summary of the main topics in bullet points
                2. Key points and takeaways, comprehensive (bullet points)
                3. Any important technical terms or concepts mentioned, with accompanying definitions and context. "Term/Concept: Definition. Context of its mention.
                4. Suggested sections/timestamps for review and bullet point rationale for this recommendation. 
                - Review your output before finalizing to ensure you have followed these instructions exactly.
                - Generate a title for the video and begin your output with the title in bold

                Transcript:
                {request.transcript}
                """
            }]
        )
        
        analysis = response.content[0].text.strip()
        return {"analysis": analysis}
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask-question")
async def ask_question(request: QuestionRequest):
    """Answer questions about the video content"""
    try:
        prompt = f"""Based on the following video transcript, please answer this question: {request.question}

Transcript:
{request.transcript}

Please provide a clear, concise answer that:
1. Directly addresses the question
2. Uses specific information from the transcript
3. Maintains technical accuracy
4. Is formatted in a clear, readable way

Answer:"""

        response = anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        answer = response.content[0].text.strip()
        return {
            "answer": answer,
            "timestamp": request.timestamp,
            "question": request.question
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query-transcript")
async def query_transcript(request: TranscriptQueryRequest):
    """Process a query about the transcript using Claude 3.5 Sonnet with streamlined timestamp references"""
    try:
        # Add validation logging
        print(f"Received request with transcript type: {type(request.transcript)}")
        print(f"Transcript length: {len(request.transcript) if request.transcript else 'None'}")
        print(f"Prompt: {request.prompt}")

        # Ensure transcript is a list and has required structure
        if not isinstance(request.transcript, list):
            raise HTTPException(
                status_code=422,
                detail="Transcript must be a list of transcript entries"
            )

        if not request.transcript:
            raise HTTPException(
                status_code=422,
                detail="Transcript cannot be empty"
            )

        # Validate transcript structure
        for idx, item in enumerate(request.transcript):
            if not isinstance(item, dict) or 'start' not in item or 'text' not in item:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid transcript entry at index {idx}. Each entry must have 'start' and 'text' fields"
                )

        # Format transcript with human-readable timestamps
        formatted_transcript = []
        for item in request.transcript:
            timestamp = item['start']
            # Convert timestamp to HH:MM:SS format
            hours = int(timestamp // 3600)
            minutes = int((timestamp % 3600) // 60)
            seconds = int(timestamp % 60)
            time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            formatted_transcript.append(f"[{time_str}] {item['text']}")
            
        transcript_text = "\n".join(formatted_transcript)

        prompt = f"""Based on this video transcript, answer the following question or respond to this request: {request.prompt}

Transcript:
{transcript_text}

Provide your response following these exact rules:

1. Avoid using introductory statements or phrases like "The video shows...", "In this screenshot...", "The speaker explains..." Generate response as if you are the author of the transcript but don't refer to yourself in the first person. 
2. Never refer to "the video", "the transcript", or use phrases like "they mention" or "the speaker explains"
3. Format timestamps like this: [HH:MM:SS]
4. Only add timestamps in parentheses at the end of key points
5. If multiple consecutive points come from the same timestamp, only include the timestamp once at the end of the last related point
6. Use markdown formatting with headings and bullet points
7. Be direct and concise - no meta-commentary about the response itself

Example of desired format:

**Topic Heading:**
* I previously covered this concept in several videos about X
* This technique is particularly important for beginners [00:05:20]

**Second Topic:**
* The first step involves positioning your hands correctly
* You'll want to maintain this position throughout the movement
* This creates the optimal angle for power generation [00:08:45]

Response:"""

        response = anthropic.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        answer = response.content[0].text.strip()
        return {
            "response": answer,
            "prompt": request.prompt,
        }
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Error processing transcript query: {str(e)}")
        print(f"Request data: {request}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing transcript query: {str(e)}")
    
    

@app.get("/api/video-info/{video_id}")
async def get_video_information(video_id: str):
    """Get detailed information about a YouTube video using the YouTube API"""
    try:
        video_info = get_video_info(video_id)
        
        if video_info:
            return {
                "title": video_info.title,
                "description": video_info.description,
                "chapters": video_info.chapters,
                "links": video_info.links
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Could not retrieve video information"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting video information: {str(e)}"
        )

@app.post("/api/generate-structured-caption")
async def generate_structured_caption(screenshot: CaptionRequest):
    """Generate AI caption for screenshot with improved structured format"""
    try:
        transcript_text = screenshot.transcript_context.strip()
        if not transcript_text:
            raise HTTPException(status_code=400, detail="No transcript context provided")

        base_prompt = screenshot.prompt if screenshot.prompt else """Generate a structured caption for this moment in the video."""

        prompt = f"""After you're done, 
        Double check that you have always:
        1) Keep each bullet point concise and actionable.
        2) Avoid phrases like "In this video" or "The speaker explains" or "The speaker is discussing". 
        3) Generate the content as if you are the person who created the content in the video and you are explaining the key points to someone else. Never refer to the video or transcript directly.
        Follow these rules at all costs.
        
        Here is the transcript context around timestamp {screenshot.timestamp}:

{transcript_text}

{base_prompt}

Generate a structured caption in this exact format:
TOPIC HEADING: A clear, concise topic title

CONTEXT: A brief sentence providing context

KEY POINTS:
• First key point
• Second key point
• Third key point

Double check that you have always:
1) Keep each bullet point concise and actionable.
2) Avoid phrases like "In this video" or "The speaker explains" or "The speaker is discussing". 
3) Speak as if you are the person who created the content in the video and you are explaining the key points to someone else. Never refer to the video or transcript directly.
Follow these rules at all costs.

"""

        response = anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=150,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        caption = response.content[0].text.strip()
        print("Generated caption:", caption)  # Add debugging
        
        # Determine content type based on caption
        content_type = "text"  # default type
        if "slide" in caption.lower() or "presentation" in caption.lower():
            content_type = "slide"
        elif any(term in caption.lower() for term in ["demo", "demonstration", "showing", "example"]):
            content_type = "demo"
        
        result = {
            "structured_caption": caption,
            "content_type": content_type
        }
        print("Returning:", result)  # Add debugging
        return result
        
    except Exception as e:
        print(f"Caption error: {str(e)}")
        traceback.print_exc()  # Add full traceback
        raise HTTPException(status_code=500, detail=str(e))

# Add this near the top of main.py
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    logger.info(f"Received request for path: {full_path}")
    
    # Skip API routes
    if full_path.startswith("api/"):
        logger.info("Skipping API route")
        raise HTTPException(status_code=404)
    
    # Handle root path
    if not full_path or full_path == "/":
        index_path = STATIC_DIR / "index.html"
        logger.info(f"Serving root index.html from {index_path}")
        if index_path.exists():
            return FileResponse(index_path)
    
    # Check for static files
    static_file = STATIC_DIR / full_path
    if static_file.exists() and static_file.is_file():
        logger.info(f"Serving static file: {static_file}")
        return FileResponse(static_file)
    
    # Fallback to index.html for client-side routing
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        logger.info("Falling back to index.html")
        return FileResponse(index_path)
        
    # If we get here, something is wrong
    logger.error("Could not find index.html")
    raise HTTPException(status_code=404, detail="Not found")

# Keep at the bottom of your file
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,       # Port number
        reload=True
    )

