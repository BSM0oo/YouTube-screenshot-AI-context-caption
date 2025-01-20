from fastapi import APIRouter, HTTPException
import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import base64
import io
from modules.models import VideoRequest, CaptionRequest
from modules.config import (
    screenshot_manager, anthropic_client,
    CLAUDE_MODEL, MAX_TOKENS_DEFAULT
)

router = APIRouter()

@router.post("/capture-screenshot")
async def capture_screenshot(request: VideoRequest):
    """Capture a screenshot from a YouTube video using Playwright"""
    max_retries = 3
    current_try = 0
    
    # Run cleanup before capturing new screenshot
    try:
        screenshot_manager.cleanup_old_screenshots()
    except Exception as e:
        print(f"Cleanup failed but continuing with capture: {str(e)}")
    
    # Extract whether to generate captions
    generate_caption = getattr(request, 'generate_caption', True)
    
    while current_try < max_retries:
        try:
            current_try += 1
            print(f"Screenshot attempt {current_try} of {max_retries}")
            
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                
                # Set a user agent for authenticity
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
                
                label_config = request.label.dict() if request.label else None
                base64_screenshot = screenshot_manager.optimize_and_save_screenshot(
                    screenshot_bytes,
                    request.video_id,
                    int(request.timestamp),
                    label_text=label_config['text'] if label_config else None,
                    font_size=label_config['fontSize'] if label_config else None,
                    label_color=label_config['color'] if label_config else 'white'
                )
                
                print("Screenshot captured and saved successfully")
                if not generate_caption:
                    return {"image_data": f"data:image/webp;base64,{base64_screenshot}"}
                    
                return {
                    "image_data": f"data:image/webp;base64,{base64_screenshot}",
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

@router.post("/generate-caption")
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

        response = anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=MAX_TOKENS_DEFAULT,
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

@router.post("/cleanup-screenshots")
async def cleanup_screenshots():
    """Manually trigger screenshot cleanup"""
    try:
        return screenshot_manager.cleanup_old_screenshots()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-structured-caption")
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

        response = anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=MAX_TOKENS_DEFAULT,
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
        raise HTTPException(status_code=500, detail=str(e))
