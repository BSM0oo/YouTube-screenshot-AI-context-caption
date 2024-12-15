# YouTube Notes App

A web application for taking contextual screenshots of YouTube videos with automatic caption generation and note-taking capabilities. The app uses the YouTube IFrame API for video playback, Claude API for caption generation, and provides export options in both Markdown and PDF formats.

## Future directions:
- add a button that captures a gif of screenshots instead of just one. 
- capture multiple screenshots 1 sec apart (or can change that variable)

## Directory Structure
```
youtube-notes-app/
├── .env                    # Environment variables configuration
├── requirements.txt        # Python dependencies
├── main.py                # FastAPI backend server
└── frontend/
    ├── package.json       # Node.js dependencies
    ├── vite.config.js     # Vite configuration
    ├── src/
    │   ├── App.jsx       # Main React component
    │   ├── main.jsx      # React entry point
    │   ├── index.html    # HTML template
    │   └── index.css     # Global styles (Tailwind CSS)
    └── node_modules/      # Frontend dependencies (generated)
```

## Features

- **YouTube Video Integration**: Embed and control YouTube video playback
- **Screenshot Capture**: Take screenshots of video frames at specific timestamps
- **Contextual Captions**: Automatically generate captions using the Claude API based on video transcript
- **Note Taking**: Add global notes and per-screenshot annotations
- **Export Options**: Export notes and screenshots as Markdown or PDF
- **Transcript Integration**: Access video transcripts for context

## Installation

### Prerequisites
- Python
- Node.js
- npm
- Anthropic API key

### Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key:
     ```
     ANTHROPIC_API_KEY=your_api_key_here
     ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   # In the root directory with venv activated
   python main.py
   ```
   The backend will run on http://localhost:8000

2. Start the frontend development server:
   ```bash
   # In the frontend directory
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## How It Works

### Backend (FastAPI)
- Handles YouTube transcript retrieval
- Integrates with Claude API for caption generation
- Manages PDF and Markdown export functionality
- Provides RESTful API endpoints for frontend communication

### Frontend (React)
- Embeds YouTube player using IFrame API
- Manages application state and user interface
- Handles screenshot capture using html2canvas
- Provides note-taking interface
- Manages export functionality

### Key Workflows
1. **Video Loading**:
   - User enters YouTube URL or video ID
   - Frontend extracts video ID and initializes player
   - Backend fetches video transcript

2. **Screenshot Capture**:
   - User clicks "Take Screenshot"
   - Frontend captures current frame
   - Backend generates caption using transcript context and Claude API
   - Screenshot, caption, and timestamp are stored in application state

3. **Note Taking**:
   - Users can add global notes about the video
   - Each screenshot can have individual notes
   - Notes are stored in application state

4. **Export**:
   - User selects export format (Markdown/PDF)
   - Frontend generates structured content
   - Backend handles file generation and download

## Future Improvements

1. **Enhanced Features**:
   - Add user authentication
   - Implement cloud storage for screenshots and notes
   - Add video playlist support
   - Include video chapter detection
   - Enable sharing and collaboration features

2. **Technical Improvements**:
   - Add error handling and loading states
   - Implement caching for transcripts
   - Add unit and integration tests
   - Optimize screenshot storage
   - Add support for different video platforms

3. **UI Enhancements**:
   - Add dark mode support
   - Improve mobile responsiveness
   - Add keyboard shortcuts
   - Implement drag-and-drop organization
   - Add search functionality for notes

4. **Integration Options**:
   - Add support for other LLMs
   - Integrate with note-taking apps (Notion, Evernote)
   - Add support for automatic translation
   - Enable direct social media sharing

## Getting Help
If you encounter any dependency-related errors, try removing the virtual environment and node_modules folder, then reinstalling dependencies:

```bash
# Backend
deactivate  # If venv is active
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules
npm install
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.


# MORE DETAILS ON STRUCTURE 
# YouTube Notes Application Guide

## Overview
This application allows users to take smart notes while watching YouTube videos. It combines video playback, automatic transcription, screenshot capture, and AI-powered caption generation to create comprehensive study materials.

## Core Features
- YouTube video playback with synchronized transcript
- Screenshot capture with context
- AI-powered caption generation using Claude
- Note-taking for both screenshots and global context
- Export to multiple formats (Markdown, PDF, RTF)

## Technical Architecture

### Frontend (React)
- `App.jsx`: Main application component handling state and user interactions
- `YouTubePlayer.jsx`: Custom YouTube player component using YouTube IFrame API

### Backend (FastAPI)
- Python-based API server handling various functionalities
- Key endpoints:
  ```
  GET  /api/transcript/{video_id}  - Fetches video transcript
  POST /api/capture-screenshot     - Captures video screenshots
  POST /api/generate-caption       - Generates AI captions
  POST /api/export-rtf            - Exports notes to RTF
  POST /api/export-pdf            - Exports notes to PDF
  ```

### External Services Integration
1. **YouTube Data**
   - Uses `youtube-transcript-api` for transcript fetching
   - YouTube IFrame API for video playback

2. **Anthropic Claude API**
   - Integrates with Claude 3 Sonnet for caption generation
   - Uses context-aware prompting for relevant captions

## Data Flow
1. User enters YouTube URL
2. Application extracts video ID and loads:
   - Video player
   - Video transcript
   - Synchronized transcript highlighting

3. Screenshot Workflow:
   - User captures screenshot
   - Backend processes video frame
   - Gets surrounding transcript context
   - Sends to Claude for caption generation
   - Returns combined data to frontend

4. Notes Management:
   - Global notes for entire video
   - Per-screenshot notes
   - Context-aware transcript segments
   - Custom AI prompting options

## Export Functionality
Supports multiple export formats:
- Markdown: Direct text export
- PDF: Converted using pypandoc
- RTF: Formatted rich text export

## Technical Requirements
- Frontend: React with Tailwind CSS
- Backend: Python 3.x with FastAPI
- APIs: Anthropic API key
- Dependencies: youtube-transcript-api, playwright, pypandoc

## Communication Flow
```
Frontend <-> FastAPI Backend <-> External Services
           |                  |
           |- YouTube API     |- Anthropic API
           |- Transcript API  |- File Conversion
```