from fastapi import APIRouter, HTTPException
from modules.models import GifCaptureRequest
from modules.config import gif_capture, SCREENSHOTS_DIR
import base64

router = APIRouter()

@router.post("/capture-gif")
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
