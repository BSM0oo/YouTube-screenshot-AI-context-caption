from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from modules.gif_capture import GifCapture
import os
import json
from datetime import datetime
from pathlib import Path

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create saved_content directory if it doesn't exist
SAVED_CONTENT_DIR = Path("saved_content")
SAVED_CONTENT_DIR.mkdir(exist_ok=True)

@app.post("/api/save-content")
async def save_content(data: dict):
    try:
        content = data.get("content")
        filename = data.get("filename")
        
        if not content or not filename:
            raise HTTPException(status_code=400, detail="Content and filename are required")
        
        # Ensure filename is safe
        safe_filename = ''.join(c for c in filename if c.isalnum() or c in ('_', '-', '.'))
        if not safe_filename.endswith('.html'):
            safe_filename += '.html'
            
        # Create filepath
        filepath = SAVED_CONTENT_DIR / safe_filename
        
        # Save content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return {"status": "success", "message": f"Content saved to {safe_filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
