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
import yt_dlp
import re
from urllib.parse import urlparse
from dataclasses import dataclass
import cv2
import numpy as np
from PIL import Image
import pytesseract
import io

# Load environment variables
load_dotenv()

# Initialize Anthropic client
anthropic = Anthropic(
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

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

class CaptionRequest(BaseModel):
    timestamp: float
    image_data: str
    transcript_context: str
    prompt: Optional[str] = None

class VideoFrameAnalysisRequest(BaseModel):
    video_id: str
    start_time: float
    duration: float = 30.0  # Default to 30 seconds

class QuestionRequest(BaseModel):
    transcript: str
    question: str
    timestamp: float

class TranscriptAnalysisRequest(BaseModel):
    transcript: str

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

def get_video_info(url: str) -> Optional[VideoInfo]:
    """Extract information from a YouTube video including chapters, description, and links."""
    if not is_valid_youtube_url(url):
        raise ValueError("Invalid YouTube URL provided")

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            chapters = info.get('chapters', [])
            description = info.get('description', '')
            links = extract_links_from_description(description)
            
            return VideoInfo(
                title=info.get('title', ''),
                description=description,
                chapters=chapters,
                links=links
            )
    except Exception as e:
        print(f"Error extracting video information: {str(e)}")
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

@app.post("/api/analyze-video-frames")
async def analyze_video_frames(request: VideoFrameAnalysisRequest):
    """Analyze video frames for scenes, text, and content type"""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            frames = []
            frame_data = []
            
            # Navigate to video
            await page.goto(f"https://www.youtube.com/embed/{request.video_id}?start={int(request.start_time)}")
            await page.wait_for_load_state('networkidle')
            
            # Setup video element
            await page.wait_for_selector('video')
            
            detector = SceneDetector()
            current_time = request.start_time
            end_time = request.start_time + request.duration
            
            while current_time < end_time:
                # Seek to current time
                await page.evaluate(f"document.querySelector('video').currentTime = {current_time}")
                await asyncio.sleep(0.5)  # Wait for frame to load
                
                # Capture frame
                screenshot = await page.screenshot(type='png')
                frame = cv2.imdecode(
                    np.frombuffer(screenshot, np.uint8),
                    cv2.IMREAD_COLOR
                )
                frames.append(frame)
                
                # Analyze frame
                frame_info = {
                    "timestamp": current_time,
                    "scene_change": len(frames) > 1 and detector.detect_scene_change(frames[-2], frame),
                    "contains_text": detector.detect_text_presence(frame),
                    "is_slide": detector.is_slide_frame(frame)
                }
                frame_data.append(frame_info)
                
                current_time += 0.5  # Half second intervals
            
            await browser.close()
            return {"frame_analysis": frame_data}
            
    except Exception as e:
        print(f"Frame analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Frame analysis failed: {str(e)}")

@app.post("/api/capture-screenshot")
async def capture_screenshot(request: VideoRequest):
    """Capture a screenshot from a YouTube video using Playwright"""
    max_retries = 3
    current_try = 0
    
    while current_try < max_retries:
        try:
            current_try += 1
            print(f"Screenshot attempt {current_try} of {max_retries}")
            
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                
                await page.goto(f"https://www.youtube.com/embed/{request.video_id}?start={int(request.timestamp)}&autoplay=1")
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
                return {"image_data": f"data:image/png;base64,{base64_screenshot}"}
                
        except Exception as e:
            print(f"Screenshot attempt {current_try} failed: {str(e)}")
            if current_try >= max_retries:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to capture screenshot after {max_retries} attempts: {str(e)}"
                )
            await asyncio.sleep(2)  # Wait before retry

@app.post("/api/state/save")
async def save_state(data: dict):
    """Save application state to file system"""
    try:
        # Save screenshots as individual files
        screenshots_dir = DATA_DIR / "screenshots"
        screenshots_dir.mkdir(exist_ok=True)
        
        if "screenshots" in data:
            for idx, screenshot in enumerate(data["screenshots"]):
                image_data = screenshot.get("image")
                if image_data and isinstance(image_data, str):
                    image_path = screenshots_dir / f"screenshot_{idx}.png"
                    if "," in image_data:
                        image_data = image_data.split(",")[1]
                    try:
                        image_bytes = base64.b64decode(image_data)
                        with open(image_path, "wb") as f:
                            f.write(image_bytes)
                        screenshot["image"] = f"screenshot_{idx}.png"
                    except Exception as e:
                        print(f"Error saving screenshot {idx}: {e}")

        state_file = DATA_DIR / "app_state.json"
        with open(state_file, "w") as f:
            json.dump(data, f)

        return {"message": "State saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@app.get("/api/video-info/{video_id}")
async def get_video_information(video_id: str):
    """Get detailed information about a YouTube video"""
    try:
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        video_info = get_video_info(video_url)
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,       # Port number
        reload=True
    )