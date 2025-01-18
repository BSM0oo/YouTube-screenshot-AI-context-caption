from fastapi import HTTPException
from moviepy.video.io.VideoFileClip import VideoFileClip
from pytube import YouTube
import os
import tempfile
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class GifCapture:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        
    async def capture_gif(self, 
                         video_id: str, 
                         start_time: float, 
                         duration: float, 
                         fps: Optional[int] = 10,
                         width: Optional[int] = 480) -> str:
        """
        Captures a GIF from a YouTube video.
        
        Args:
            video_id: YouTube video ID
            start_time: Start time in seconds
            duration: Duration of GIF in seconds
            fps: Frames per second (default: 10)
            width: Width of the GIF in pixels (default: 480)
            
        Returns:
            str: Base64 encoded GIF data
        """
        try:
            # Get video URL
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Download video segment
            yt = YouTube(video_url)
            video_stream = yt.streams.filter(progressive=True, file_extension='mp4').first()
            
            if not video_stream:
                raise HTTPException(status_code=400, detail="No suitable video stream found")
            
            # Download to temp file
            temp_video_path = os.path.join(self.temp_dir, "temp_video.mp4")
            video_stream.download(output_path=self.temp_dir, filename="temp_video.mp4")
            
            # Load video and extract GIF
            video = VideoFileClip(temp_video_path)
            
            # Handle case where start_time + duration exceeds video length
            if start_time + duration > video.duration:
                duration = video.duration - start_time
            
            # Extract and resize the clip
            clip = video.subclip(start_time, start_time + duration)
            if width:
                clip = clip.resize(width=width)
            
            # Create GIF
            gif_path = os.path.join(self.temp_dir, "output.gif")
            clip.write_gif(gif_path, fps=fps)
            
            # Clean up
            video.close()
            clip.close()
            
            # Read and encode GIF
            with open(gif_path, "rb") as f:
                gif_data = f.read()
            
            # Clean up temporary files
            os.remove(temp_video_path)
            os.remove(gif_path)
            
            return gif_data
            
        except Exception as e:
            logger.error(f"Error capturing GIF: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error capturing GIF: {str(e)}")
        
    def __del__(self):
        """Cleanup temporary directory on object destruction"""
        try:
            if os.path.exists(self.temp_dir):
                for file in os.listdir(self.temp_dir):
                    os.remove(os.path.join(self.temp_dir, file))
                os.rmdir(self.temp_dir)
        except Exception as e:
            logger.error(f"Error cleaning up temp directory: {str(e)}")
