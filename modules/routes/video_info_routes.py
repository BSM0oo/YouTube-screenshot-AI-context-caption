from fastapi import APIRouter, HTTPException
from modules.config import youtube_client
from googleapiclient.errors import HttpError
import re
from urllib.parse import urlparse
from typing import List, Optional
from modules.models import VideoInfo

router = APIRouter()

def is_valid_youtube_url(url: str) -> bool:
    """Validate if the provided URL is a valid YouTube URL."""
    parsed = urlparse(url)
    return bool(parsed.netloc) and parsed.netloc.endswith(('youtube.com', 'youtu.be'))

def extract_links_from_description(description: str) -> List[str]:
    """Extract all URLs from the video description using regex."""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(url_pattern, description)

def get_video_info(video_id: str) -> Optional[VideoInfo]:
    """Extract information from a YouTube video using the YouTube Data API."""
    try:
        # Get video details
        video_response = youtube_client.videos().list(
            part='snippet,contentDetails',
            id=video_id
        ).execute()

        if not video_response['items']:
            return None

        video_data = video_response['items'][0]
        description = video_data['snippet']['description']
        title = video_data['snippet']['title']
        
        # Extract chapters from description (YouTube stores chapters in description)
        chapters = []
        lines = description.split('\n')
        for line in lines:
            # Look for timestamp patterns like "0:00" or "00:00" or "0:00:00"
            match = re.search(r'^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s*[-–]\s*(.+)$', line.strip())
            if match:
                groups = match.groups()
                if len(groups) == 4:
                    hours = int(groups[0]) if groups[0] else 0
                    minutes = int(groups[1])
                    seconds = int(groups[2])
                    title = groups[3].strip()
                    time_seconds = hours * 3600 + minutes * 60 + seconds
                    chapters.append({
                        'start_time': time_seconds,
                        'title': title
                    })

        links = extract_links_from_description(description)
        
        return VideoInfo(
            title=title,
            description=description,
            chapters=chapters,
            links=links
        )

    except HttpError as e:
        print(f"An HTTP error occurred: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@router.get("/video-info/{video_id}")
async def get_video_information(video_id: str):
    """Get detailed information about a YouTube video using the YouTube API"""
    try:
        video_info = get_video_info(video_id)
        
        if video_info:
            return {
                "title": video_info.title,
                "description": video_info.description,
                "chapters": video_info.chapters,
                "links": video_info.links
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Could not retrieve video information"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting video information: {str(e)}"
        )
