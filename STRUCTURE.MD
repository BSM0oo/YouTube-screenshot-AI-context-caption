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