# YouTube Notes App

A web application for taking structured notes while watching YouTube videos, with features for capturing screenshots, generating AI-powered captions, and creating comprehensive study materials.

## Project Structure

```
youtube-notes-app/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── YouTubePlayer.jsx      # YouTube video player component
│   │   │   ├── ScreenshotManager.jsx  # Handles screenshot capture
│   │   │   ├── TranscriptViewer.jsx   # Displays video transcript
│   │   │   ├── NotesManager.jsx       # Manages notes and exports
│   │   │   └── ScreenshotGallery.jsx  # Displays captured screenshots
│   │   ├── App.jsx        # Main application component
│   │   ├── config.js      # Configuration settings
│   │   └── main.jsx       # Application entry point
├── main.py                 # Python backend server
└── README.md              # This file
```

## Improvements roadmap and prompts:
**1/6/25:** 
i want you to use the tools in the youtube_info_extractor.py in PythonExamples folder to improve the web app by adding a section that appends all these details about the video to the bottom of the page, below the generated trasncript outline. I also want a button to hide/show it. We may want to create or modify a component to do this. The components directory currently has NotesManager, ScreenshotGallery, ScreenshotManager, YoutubePlayer, and TranscriptViewer.



### Updates on 12/19/24:
Here's what has been implemented:

Created new transcript_retriever.py with enhanced transcript retrieval functionality:

Multiple fallback methods for getting transcripts
Better error handling
Direct YouTube data API integration
Support for auto-generated captions


Updated main.py to:

Use the new EnhancedTranscriptRetriever
Maintain all existing functionality
Improve error handling and logging


Updated requirements.txt with all necessary dependencies

To test these changes:


## Component Architecture

The application is built using a modular component architecture:

1. **App.jsx** (Parent Component)
   - Manages global state (video ID, screenshots, notes, transcript)
   - Handles localStorage persistence
   - Coordinates communication between components

2. **YouTubePlayer**
   - Embeds and controls YouTube video playback
   - Provides player controls API to other components
   - Manages YouTube IFrame API integration

3. **ScreenshotManager**
   - Handles single and burst screenshot capture
   - Manages screenshot capture settings
   - Communicates with backend for image processing

4. **TranscriptViewer**
   - Displays and manages video transcript
   - Provides timestamp-based navigation
   - Handles transcript analysis generation

5. **NotesManager**
   - Manages global notes
   - Handles note export (Markdown, HTML, PDF)
   - Manages print functionality

6. **ScreenshotGallery**
   - Displays captured screenshots
   - Manages screenshot captions and notes
   - Handles caption regeneration

## State Management

The application uses React's useState for state management, with localStorage for persistence. Key state elements:

- videoId: Current YouTube video identifier
- screenshots: Array of captured screenshots and metadata
- notes: Global notes text
- transcript: Video transcript data
- transcriptAnalysis: Generated transcript outline
- customPrompt: AI caption generation prompt

## Backend Integration

The Python backend (main.py) provides several API endpoints:

- `/api/transcript/{video_id}`: Fetches video transcript
- `/api/capture-screenshot`: Captures video screenshots
- `/api/generate-caption`: Generates AI captions
- `/api/analyze-transcript`: Creates transcript analysis
- `/api/export-pdf`: Handles PDF export
- `/api/export-rtf`: Handles RTF export

## Setup and Development

1. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

2. Backend Setup:
```bash
pip install -r requirements.txt
python main.py
```

3. Access the application at `http://localhost:5173`

## Network Access

For local network access:
1. Configure your backend to listen on `0.0.0.0` instead of `localhost`
2. Update frontend config.js to use your machine's local IP address
3. Ensure your firewall allows connections on the required ports

## Known Issues and Limitations

- Local storage limitations may affect performance with many screenshots
- Backend must be running for screenshot and transcript features
- YouTube API limitations may affect video availability

## Future Improvements

- Implement proper database storage for persistence
- Add user authentication for multi-user support
- Optimize image storage and processing
- Add cloud deployment support