from fastapi import HTTPException
from pydantic import BaseModel
from pathlib import Path


class SaveContentRequest(BaseModel):
    content: str
    filename: str


class ContentSaver:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.saved_content_dir = data_dir / 'saved_content'
        self.saved_content_dir.mkdir(exist_ok=True)

    async def save_content(self, request: SaveContentRequest):
        """Save HTML content to a file"""
        try:
            # Create file path
            file_path = self.saved_content_dir / request.filename
            
            # Write content to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(request.content)
                
            return {"message": "Content saved successfully", "path": str(file_path)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
