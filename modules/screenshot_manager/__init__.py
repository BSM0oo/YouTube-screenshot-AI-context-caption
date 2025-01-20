from fastapi import HTTPException
from pathlib import Path
import base64
import io
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timedelta
import re
import logging

logger = logging.getLogger(__name__)

class ScreenshotManager:
    def __init__(self, data_dir: Path, max_age_days: int = 7, max_per_video: int = 50):
        self.screenshots_dir = data_dir / 'screenshots'
        self.screenshots_dir.mkdir(exist_ok=True)
        self.max_age_days = max_age_days
        self.max_per_video = max_per_video

    def cleanup_old_screenshots(self):
        """Clean up old screenshots based on age and count limits"""
        try:
            now = datetime.now()
            cleanup_threshold = now - timedelta(days=self.max_age_days)
            
            video_files = {}
            for file_path in self.screenshots_dir.glob("yt_*"):
                if not file_path.is_file():
                    continue
                    
                match = re.match(r"yt_([^_]+)_", file_path.name)
                if not match:
                    continue
                    
                video_id = match.group(1)
                file_stat = file_path.stat()
                file_time = datetime.fromtimestamp(file_stat.st_mtime)
                
                if file_time < cleanup_threshold:
                    file_path.unlink()
                    continue
                    
                if video_id not in video_files:
                    video_files[video_id] = []
                video_files[video_id].append((file_path, file_time))
            
            for video_id, files in video_files.items():
                if len(files) > self.max_per_video:
                    sorted_files = sorted(files, key=lambda x: x[1], reverse=True)
                    for file_path, _ in sorted_files[self.max_per_video:]:
                        file_path.unlink()
                        
            return {"message": "Cleanup completed successfully"}
        except Exception as e:
            logger.error(f"Error during screenshot cleanup: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def optimize_and_save_screenshot(self, image_bytes: bytes, video_id: str, timestamp: int, 
                                   label_text: str = None, font_size: int = None, 
                                   label_color: str = 'white'):
        """Optimize screenshot and save to disk"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            if label_text:
                draw = ImageDraw.Draw(image)
                try:
                    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
                except:
                    font = ImageFont.load_default()
                
                bbox = draw.textbbox((0, 0), label_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                x = (image.width - text_width) // 2
                y = image.height // 4 - text_height // 2
                
                outline_width = max(1, font_size // 25)
                for adj in range(-outline_width, outline_width + 1):
                    for offy in range(-outline_width, outline_width + 1):
                        if adj == 0 and offy == 0:
                            continue
                        draw.text((x + adj, y + offy), label_text, font=font, fill='black')
                draw.text((x, y), label_text, font=font, fill=label_color)
            
            webp_buffer = io.BytesIO()
            image.save(webp_buffer, 'WEBP', quality=80, method=6)
            optimized_bytes = webp_buffer.getvalue()
            
            file_path = self.screenshots_dir / f"yt_{video_id}_{timestamp}.webp"
            with open(file_path, "wb") as f:
                f.write(optimized_bytes)
            
            return base64.b64encode(optimized_bytes).decode()
            
        except Exception as e:
            logger.error(f"Error optimizing/saving screenshot: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
