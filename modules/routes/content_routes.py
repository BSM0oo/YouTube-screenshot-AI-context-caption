from fastapi import APIRouter
from modules.models import SaveContentRequest
from modules.config import content_saver

router = APIRouter()

@router.post("/save-content")
async def save_content(request: SaveContentRequest):
    return await content_saver.save_content(request)
