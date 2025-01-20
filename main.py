from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging

from modules.config import logger, STATIC_DIR
from modules.routes import router

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(router)

# SPA route handler
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
    
    logger.error("Could not find index.html")
    raise HTTPException(status_code=404, detail="Not found")

# Mount static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
