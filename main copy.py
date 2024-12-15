from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import anthropic
import os
from dotenv import load_dotenv
from datetime import datetime
from playwright.async_api import async_playwright
import base64
import asyncio
from fastapi.responses import FileResponse
import pypandoc
import tempfile

from app.export_utils import export_to_pdf

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
client = anthropic.Client(api_key=os.getenv("ANTHROPIC_API_KEY"))

class Screenshot(BaseModel):
    timestamp: float
    image_data: str
    transcript_context: str
    notes: Optional[str] = None
    caption: Optional[str] = None
    prompt: Optional[str] = None  # Add this field

class ExportRequest(BaseModel):
    content: str

class ScreenshotRequest(BaseModel):
    video_id: str
    timestamp: float
    wait_for_play_button: bool = True

@app.get("/api/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/generate-caption")
async def generate_caption(screenshot: Screenshot):
    try:
        # Format the transcript context
        transcript_text = screenshot.transcript_context.strip()
        if not transcript_text:
            raise HTTPException(status_code=400, detail="No transcript context provided")

        # Use the custom prompt if provided, or the default
        base_prompt = screenshot.prompt if screenshot.prompt else """Generate a concise and informative caption for this moment in the video.
            The caption should be a direct statement about the key point, without referring to the video or transcript."""

        # Construct the full prompt
        prompt = f"""Here is the transcript context around timestamp {screenshot.timestamp}:

{transcript_text}

{base_prompt}

Generate a caption that:
1. Makes a direct, actionable statement about the key point
2. Uses relevant technical terms or concepts
3. Avoids phrases like "The video shows...", "In this screenshot...", "The speaker explains..."
4. Avoids quoting directly from the transcript

Examples:
❌ "The video demonstrates proper golf swing technique"
✅ "Maintain a firm grip while keeping wrists relaxed during the backswing"

❌ "The speaker explains the importance of data structures"
✅ "Hash tables provide O(1) average time complexity for lookups"

Caption:"""

        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=150,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        caption = response.content[0].text.strip()
        return {"caption": caption}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export-rtf")
async def export_rtf(request: ExportRequest):
    try:
        # Convert Markdown content to RTF using pypandoc
        with tempfile.NamedTemporaryFile(delete=False, suffix=".rtf") as tmp_file:
            output_file = tmp_file.name
            pypandoc.convert_text(request.content, 'rtf', format='md', outputfile=output_file)
            return FileResponse(output_file, filename='notes.rtf', media_type='application/rtf')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export-pdf")
async def export_pdf(request: ExportRequest):
    try:
        # Ensure the export_to_pdf function works correctly or replace it with pypandoc
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            output_file = tmp_file.name
            pypandoc.convert_text(request.content, 'pdf', format='md', outputfile=output_file)
            return FileResponse(output_file, filename='notes.pdf', media_type='application/pdf')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/capture-screenshot")
async def capture_screenshot(request: ScreenshotRequest):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            # Load video and wait for it to be ready
            await page.goto(f"https://www.youtube.com/embed/{request.video_id}?start={int(request.timestamp)}&autoplay=1")
            await page.wait_for_load_state('networkidle')
            
            # Wait for video player and inject script to control video
            await page.wait_for_selector('video')
            
            # Inject script to handle video seeking and playback
            await page.evaluate("""
                const video = document.querySelector('video');
                video.currentTime = parseInt(new URL(window.location.href).searchParams.get('start'));
                video.play();
            """)
            
            # Wait for video to seek and play briefly
            await asyncio.sleep(1.5)
            
            # Pause the video before screenshot
            await page.evaluate("document.querySelector('video').pause()")
            
            # Hide player controls and play button
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
            
            await browser.close()
            
            base64_screenshot = base64.b64encode(screenshot_bytes).decode()
            return {"image_data": f"data:image/png;base64,{base64_screenshot}"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screenshot failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)