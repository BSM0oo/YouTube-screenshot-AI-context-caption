from fastapi import APIRouter, HTTPException
from modules.config import (
    anthropic_client, gif_capture, content_saver, screenshot_manager,
    youtube_client, CLAUDE_MODEL, CLAUDE_SONNET_MODEL,
    MAX_TOKENS_DEFAULT, MAX_TOKENS_ANALYSIS
)
from modules.models import *

router = APIRouter()

# Import all route modules
from . import (
    screenshot_routes,
    transcript_routes,
    gif_routes,
    content_routes,
    state_routes,
    video_info_routes
)

# Include all routers
router.include_router(screenshot_routes.router, prefix="/api")
router.include_router(transcript_routes.router, prefix="/api")
router.include_router(gif_routes.router, prefix="/api")
router.include_router(content_routes.router, prefix="/api")
router.include_router(state_routes.router, prefix="/api")
router.include_router(video_info_routes.router, prefix="/api")
