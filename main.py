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
    allow_origins=["*"],  # Allow all origins for local development
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
    # Remove wait_for_play_button field

# Add this new class after your existing BaseModel classes
class TranscriptAnalysisRequest(BaseModel):
    transcript: str

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
        # Create a temporary file for the markdown content
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as md_file:
            md_file.write(request.content)
            md_path = md_file.name

        # Create a temporary file for the RTF output
        with tempfile.NamedTemporaryFile(suffix='.rtf', delete=False) as rtf_file:
            rtf_path = rtf_file.name

        # Convert markdown to RTF
        pypandoc.convert_file(
            md_path,
            'rtf',
            outputfile=rtf_path,
            format='markdown'
        )

        # Clean up the markdown temp file
        os.unlink(md_path)

        # Return the RTF file
        return FileResponse(
            rtf_path,
            media_type='application/rtf',
            filename='notes.rtf',
            background=BackgroundTask(lambda: os.unlink(rtf_path))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RTF export failed: {str(e)}")

@app.post("/api/export-pdf")
async def export_pdf(request: ExportRequest):
    try:
        # Create temporary files for both markdown and PDF
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as md_file:
            md_file.write(request.content)
            md_path = md_file.name

        pdf_path = md_path.replace('.md', '.pdf')
        
        try:
            # Convert markdown to PDF using pypandoc with weasyprint
            pypandoc.convert_file(
                md_path,
                'pdf',
                outputfile=pdf_path,
                format='markdown',
                extra_args=[
                    '--pdf-engine=weasyprint',
                    '--standalone'
                ]
            )

            # Return the PDF file
            return FileResponse(
                pdf_path,
                media_type='application/pdf',
                filename='notes.pdf',
                background=BackgroundTask(lambda: cleanup_files(md_path, pdf_path))
            )

        except Exception as e:
            # Clean up any temporary files
            cleanup_files(md_path, pdf_path)
            raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")

    except Exception as e:
        if 'md_path' in locals():
            cleanup_files(md_path)
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")

# Add this helper function for file cleanup
def cleanup_files(*files):
    for file in files:
        try:
            os.unlink(file)
        except:
            pass

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

# Add this new endpoint after your existing endpoints
@app.post("/api/analyze-transcript")
async def analyze_transcript(request: TranscriptAnalysisRequest):
    try:
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": f"""Analyze this video transcript and provide:
                1. A high-level summary of the main topics (2-3 sentences)
                2. Key points and takeaways, comprehensive (bullet points)
                3. Any important technical terms or concepts mentioned
                4. Suggested sections/timestamps for review

                Transcript:
                {request.transcript}
                """
            }]
        )
        
        analysis = response.content[0].text.strip()
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)