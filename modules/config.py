from pathlib import Path
import os
from dotenv import load_dotenv
from anthropic import Anthropic
from googleapiclient.discovery import build
from modules.gif_capture import GifCapture
from modules.content_saver import ContentSaver
from modules.screenshot_manager import ScreenshotManager
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create data directory structure
DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)
SCREENSHOTS_DIR = DATA_DIR / 'screenshots'
SCREENSHOTS_DIR.mkdir(exist_ok=True)
STATIC_DIR = Path(__file__).parent.parent / "static"

# Initialize components
anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
gif_capture = GifCapture()
content_saver = ContentSaver(DATA_DIR)
screenshot_manager = ScreenshotManager(DATA_DIR)

# YouTube API setup
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
youtube_client = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Constants
MAX_SCREENSHOT_AGE_DAYS = 7
MAX_SCREENSHOTS_PER_VIDEO = 50

# Model configuration
CLAUDE_MODEL = "claude-3-haiku-20240307"
CLAUDE_SONNET_MODEL = "claude-3-5-sonnet-latest"
MAX_TOKENS_DEFAULT = 150
MAX_TOKENS_ANALYSIS = 1000
