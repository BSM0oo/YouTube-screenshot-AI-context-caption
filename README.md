# YouTube Notes App

A web application for taking structured notes while watching YouTube videos, with features for capturing screenshots, generating AI-powered captions, and creating comprehensive study materials.
# YouTube Notes App

A professional web application for taking structured notes while watching YouTube videos. Features include screenshot capture, AI-powered captions, comprehensive transcript analysis, and polished export options for creating study materials and documentation.

## Project Structure

```
youtube-notes-app/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── YouTubePlayer.jsx      # Video player component
│   │   │   ├── ScreenshotManager.jsx  # Screenshot capture handling
│   │   │   ├── TranscriptViewer.jsx   # Transcript display and navigation
│   │   │   ├── NotesManager.jsx       # Notes and export management
│   │   │   ├── ScreenshotGallery.jsx  # Screenshot display and organization
│   │   │   ├── VideoInfoViewer.jsx    # Video metadata display
│   │   │   └── FullTranscriptViewer.jsx # Full transcript display
│   │   ├── styles/        # Styling
│   │   │   └── ExportStyles.css       # Export and print styling
│   │   ├── utils/         # Utility functions
│   │   │   └── exportUtils.js         # Export generation utilities
│   │   ├── App.jsx        # Main application component
│   │   ├── config.js      # Configuration settings
│   │   └── main.jsx       # Application entry point
├── main.py                 # Python backend server
└── README.md              # Documentation

```

## Features - see below for more info on files

## Improvements roadmap and prompts:
** 1/6/25 ** :
DONE -Use VideoInfoViewer.jsx to get the title of the video and then display the title 

DONE -Append full transcript (I'd like you to focus on creating the option to append full transcript of the video to the bottom of the page (right now we just have the scrolling box w little pieces of it, or user can copy the transcript, but they can't have it appended to bottom of page so that when printing or exporting as md or html its there with the summary and screenshot information.)

DONE -Improve the export options. The export to md and html aren't displaying anything except headings, and we need a full analysis and major improvment / redesign of the print / pdf option. b/c as of now the pdf option (which is just print to pdf) just does terrible job formatting the captions and screenshots and images are split up between pages, and so are sections that shouldn't be (like 1 of the 3 captions split onto a separate page etc).

- Issue: Losing state on mobile when the screen turns off for a second. Can state persist from one comp to another or on the same comp for a while until cleared?

**1/6/25:** 
1/6/25 DONE
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


## Known Issues and Limitations

- Local storage size limitations may affect large numbers of screenshots
- Backend must be running for screenshot and transcript features
- PDF export requires system print dialog
- YouTube API quotas may affect video availability

## Future Improvements

- [ ] Database integration for persistent storage
- [ ] User authentication system
- [ ] Cloud storage for screenshots
- [ ] Additional export formats
- [ ] Custom PDF generation
- [ ] Collaborative features
- [ ] Mobile optimization
- [ ] Offline support




### Core Functionality
- YouTube video playback with timestamp-based navigation
- Screenshot capture with AI-generated captions
- Real-time transcript display and navigation
- Global notes management
- Video information display

### Export Options
- Markdown export with formatted content
- HTML export with styled layout
- Professional PDF export via print dialog
- Properly formatted transcripts
- Screenshot organization with captions
- Comprehensive transcript analysis

## Component Architecture

1. **App.jsx** (Parent Component)
   - Global state management
   - Component coordination
   - Video loading and metadata handling

2. **NotesManager.jsx**
   - Notes management
   - Export functionality (MD, HTML, PDF)
   - Professional document generation

3. **YouTubePlayer.jsx**
   - Video playback control
   - Timestamp management
   - Player API integration

4. **ScreenshotManager.jsx**
   - Screenshot capture
   - Burst mode support
   - Caption generation

5. **TranscriptViewer.jsx**
   - Transcript navigation
   - Analysis generation
   - Timestamp synchronization

6. **VideoInfoViewer.jsx**
   - Video metadata display
   - Description formatting
   - Link handling

7. **FullTranscriptViewer.jsx**
   - Complete transcript display
   - Copy functionality
   - Timestamp formatting

## Export Formats

### Markdown Export
- Clean, structured format
- Embedded screenshots
- Formatted transcript
- Proper heading hierarchy
- Link preservation

### HTML Export
- Styled layout
- Responsive design
- Print-optimized CSS
- Interactive elements
- Clean typography

### PDF Export (via Print)
- Professional layout
- Proper page breaks
- Optimized image placement
- Consistent typography
- Header/footer support

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
1. Configure backend to listen on `0.0.0.0`
2. Update frontend config.js with local IP
3. Configure firewall accordingly





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