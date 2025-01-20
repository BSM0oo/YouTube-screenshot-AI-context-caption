from typing import Optional, List, Dict
from pydantic import BaseModel
from dataclasses import dataclass

@dataclass
class VideoInfo:
    """Class to store video information in a structured format"""
    title: str
    description: str
    chapters: List[Dict[str, str]]
    links: List[str]

class LabelConfig(BaseModel):
    text: str
    fontSize: int
    color: str = 'white'  # Default to white text

class VideoRequest(BaseModel):
    video_id: str
    timestamp: float 
    generate_caption: bool = True
    label: Optional[LabelConfig] = None

class CaptionRequest(BaseModel):
    timestamp: float
    image_data: str
    transcript_context: str
    prompt: Optional[str] = None

class VideoFrameAnalysisRequest(BaseModel):
    video_id: str
    start_time: float
    duration: float = 30.0  # Default to 30 seconds

class GifCaptureRequest(BaseModel):
    video_id: str
    start_time: float
    duration: float = 3.0  # Default to 3 seconds
    fps: Optional[int] = 10
    width: Optional[int] = 480

class QuestionRequest(BaseModel):
    transcript: str
    question: str
    timestamp: float

class TranscriptAnalysisRequest(BaseModel):
    transcript: str

class TranscriptQueryRequest(BaseModel):
    transcript: list
    prompt: str

class SaveContentRequest(BaseModel):
    content: str
    filename: str

