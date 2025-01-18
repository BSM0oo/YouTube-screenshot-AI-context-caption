# YouTube Notes App

A web application for taking structured notes while watching YouTube videos. Features include screenshot capture, AI-powered captions, comprehensive transcript analysis, and polished export options for creating study materials and documentation.




## Project Structure

youtube-notes-app/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── YouTubePlayer.jsx            # Video player component
│   │   │   ├── EnhancedScreenshotManager.jsx # Screenshot capture handling
│   │   │   ├── TranscriptViewer.jsx         # Transcript display and navigation
│   │   │   ├── NotesManager.jsx             # Notes and export management
│   │   │   ├── GifCaptureManager.jsx        # GIF capture functionality
│   │   │   ├── DraggableGalleryGrid.jsx     # Draggable grid layout
│   │   │   ├── EnhancedScreenshotGallery.jsx # Screenshot organization
│   │   │   ├── GalleryControls.jsx          # Gallery control buttons
│   │   │   ├── GalleryGrid.jsx              # Grid layout component
│   │   │   ├── PromptResponseCard.jsx       # AI response display
│   │   │   ├── ScreenshotCard.jsx           # Screenshot display card
│   │   │   ├── TranscriptPrompt.jsx         # Transcript interaction
│   │   │   ├── VideoInfoViewer.jsx          # Video metadata display
│   │   │   └── FullTranscriptViewer.jsx     # Full transcript display
│   │   ├── components/ui/  # Shadcn UI components
│   │   │   ├── button.jsx  # Button component
│   │   │   ├── card.jsx    # Card component
│   │   │   ├── input.jsx   # Input component
│   │   │   └── label.jsx   # Label component
│   │   ├── styles/         # Styling
│   │   │   ├── globals.css # Global styles and Tailwind
│   │   │   └── ExportStyles.css # Export and print styling
│   │   ├── utils/          # Utility functions
│   │   │   └── exportUtils.js # Export generation utilities
│   │   ├── App.jsx         # Main application component
│   │   ├── config.js       # Configuration settings
│   │   └── main.jsx        # Application entry point
├── modules/                # Backend modules
│   └── gif_capture.py      # GIF capture functionality
├── main.py                 # Python backend server
└── README.md              # Documentation




## Features - see below for more info on files


## Claude instructions:
1) Use sequential reasoning
2) Files are found here: 
'/Users/williamsmith/Library/CloudStorage/OneDrive-Personal/Coding OneDrive/youtube-notes-app-clean-Claude-OneDrive-011025-gcloud'
frontend is in the frontend folder
backend is main.py
checkout README.md for info on how the files and components are structured
3) Determine best way to fix each item in the task list and generate an overall plan
4) Execute the changes for the first change. prefer edit file over write file unless completely redoing the majority of the file. after performing multiple edits on a file, always review the modified file to confirm the changes are as we expect.
5) Review any files with multiple edits from this run.
6) Test the change by running npm run dev in the frontend folder
7) Fix any issues found in the test
8) add the changes you made to the changelog in the readme.md file
9) Let me know status of change and then ask permission to move to the next one. 
10) also ask me if you should push your latest changes to the github repo. push to branch below if appropriate. Suggest a new branch if appropriate. Suggest reverting to main branch where appropriate. 
Repo info: git push origin claude_fixes_and_marked_functionality
origin  https://github.com/BSM0oo/YouTube-screenshot-AI-context-caption.git (fetch)
origin  https://github.com/BSM0oo/YouTube-screenshot-AI-context-caption.git (push)
current branch = claude_fixes_and_marked_functionality

## Improvements roadmap and prompts. Fix one by one and ask for approval before going to the next one.

- FIX: I can't edit the captions. Edit buton sets up the edit box but I can't actually type into the box. 
- NEW: Add a toggle to process single screenshots without captions vs. with captions. When marked for caption, process the screenshots / context for captions, or when marked for screenshot alone just screenshot them without processing so that just the screenshots are added to the gallery without any further processing. 
- REMOVE: Get rid of the smart detection and its related code.
- NEW: Add the ability to capture a GIF (user can determine length). Create this as a new component for the frontend, and a new module for the backend (main.py getting too long otherwise i think).
- 
1/13/25:
Features to add or fix:
- Mark mode: Add a new option for taking screenshots called Mark Mode. When selected, the user gets two new buttons: Mark for Screenshot, Mark for Screenshot + Caption. Each time user clicks mark for Screenshot it records the time stamp of the portion of video. When all video parts are selected, user clicks "Capture marked", and all the marked screenshots are processed for screenshot or screenshot + caption, and then displayed in the gallery. 
- When marked for caption, process the screenshots / context for captions, or when marked for screenshot alone just screenshot them without processing so that just the screenshots are added to the gallery without any further processing. 
- NEW FUNCTION: Add a toggle that increases the size of the video to full width of the page borders (not as wide in constarined mode and all the way to the edge of the window in the full width view)

 each time there's a portion of the video they want to have a screenshot. there's something about this file that makes the screenshot functionality work perfectly so that it captures at the exact correct time and gets all the information including text on the time point in the video. in my project, one of the components seems to have messed this up so its not always getting the perfect time point, not always getting the image, and sometimes has weird overlays, or is missing the important text overlay that has relevant information for my video.  attached is the correct implementation  here's my frontend directory of my project. review it and the components to figure out what the issue is. /Users/williamsmith/Library/CloudStorage/OneDrive-Personal/Coding OneDrive/youtube-notes-app-clean-Claude-OneDrive-011025-gcloud/frontend  save copies of the incorrect files in an archived folder  insert the changes needed or replace the incorrect files * test the revised version stop at any point if one of your tools doesn't work. use multistep reasoning.

1/12/25:
- Add ability to delete cards from the screenshot gallery
- 


1/8/25:
Add a box for interacting with the anthropic API with the entire transcript used as context. so the user can ask for specific questions to be answered about the transcript content, and those answers will then populate in the grid just like the new screenshot boxes do.

Adding a new feature: Think about how to Add a box for interacting with the anthropic API with the entire transcript used as context. so the user can ask for specific questions to be answered about the transcript content, and those answers will then populate in the grid just like the new screenshot boxes do. 

"Ask a question about this video!"

User asks for example:  "What types of grips are used for the golf swing?"

Output goes into the grid alongside the screenshots, rich formatting, and nice looking card. 

If video contains information on it, it cites an approximate time stamp in the video (future feature - dont implement yet)

If going to use information outside the transcript, it prompts the user to say ok (future feature - dont implement yet)

1/8/25:
add a button that expands the size of the video player to fill the screen horizontally (and increases to whatever proportionate height that is.). Same button should also reverse it.

1/8/25:
The video information box has rich formatting with headings displayed appropriately etc. - the Generated transcript outline box does not. I think its b/c the generated transcript outline box is markdown that hasn't been rendered.

## More Future features and improvements: ideas for features and improvements for this app? 

1) Sometimes it provides captions of the screenshots that aren't so useful and need more context and a unifying topic heading (analogous to a slide title). 

Maybe expanding the context and focusing on the topic that's fully captured in the context would be best (for example if it contains all of topic B and a little of topic A and C, it should caption a headline indicating topic B and the three bullet points explaining it. 

2) It would also be cool if it user could click a button to have it automatically generate screenshots in parts of videos with a scene change or where there was a change in topic or where letters were shown on screen.

3) it would also be cool to screenshot any parts of video with text if the user clicks a button to have it do this. So if i was watching a video and saw some text pop up in a few scenes, i'd click the button and it would screenshot all the parts of video with differnt text. 

**Enhanced Screenshot and Caption System:**
Implement topic-based contextual analysis for better captions
Add hierarchical caption structure (main topic → subtopics → details)
Allow manual editing/refinement of AI-generated captions
Generate topic headings based on transcript context before and after screenshot
Option to group related screenshots under common topics

**Automatic Scene and Content Detection:** 
Scene change detection using computer vision
Text detection in video frames (OCR)
Whiteboard/slide detection
Graph/chart detection
Auto-screenshot options:

Scene changes
Text appearances
Presentation slides
Key visual elements (diagrams, charts)


Preview strip showing detected scenes/content


### Completed:
** 1/6/25 ** :
DONE -Use VideoInfoViewer.jsx to get the title of the video and then display the title 

DONE -Append full transcript (I'd like you to focus on creating the option to append full transcript of the video to the bottom of the page (right now we just have the scrolling box w little pieces of it, or user can copy the transcript, but they can't have it appended to bottom of page so that when printing or exporting as md or html its there with the summary and screenshot information.)

DONE -Improve the export options. The export to md and html aren't displaying anything except headings, and we need a full analysis and major improvment / redesign of the print / pdf option. b/c as of now the pdf option (which is just print to pdf) just does terrible job formatting the captions and screenshots and images are split up between pages, and so are sections that shouldn't be (like 1 of the 3 captions split onto a separate page etc).

- Issue: Losing state on mobile when the screen turns off for a second. Can state persist from one comp to another or on the same comp for a while until cleared?

**1/6/25:** 
1/6/25 DONE
i want you to use the tools in the youtube_info_extractor.py in PythonExamples folder to improve the web app by adding a section that appends all these details about the video to the bottom of the page, below the generated trasncript outline. I also want a button to hide/show it. We may want to create or modify a component to do this. The components directory currently has NotesManager, ScreenshotGallery, ScreenshotManager, YoutubePlayer, and TranscriptViewer.

## Changelog

### Updates on 1/17/25:
- Improved Mark Mode stability and caption handling:
  - Added 15-second timeout for caption generation
  - Screenshots now save even if captions timeout
  - Added 5-second delay between captures
  - Added visual indicator for failed captions
  - Added ability to regenerate failed captions later
  - Improved error messages and state management

### Previous Updates on 1/17/25:
- Added screenshot optimization features:
  - Added WebP image compression (80% quality) to reduce file sizes
  - Added automatic cleanup of screenshots older than 7 days
  - Limited maximum screenshots per video to 50
  - Added screenshot pagination with 12 screenshots per page
  - Added loading states and error handling
  - Added periodic cleanup (every 5 minutes)

### Previous Updates on 1/17/25:
- Refactored screenshot functionality:
  - Split EnhancedScreenshotManager into smaller, focused components
  - Created new /components/screenshot directory
  - Added screenshotService.js for API and utility functions
  - Improved component organization and reusability
  - Created separate components for each screenshot mode
  - Added proper component interfaces and prop types
  - Moved business logic to service layer
- Added new dependencies:
  - Installed tailwindcss-animate for UI animations
  - Added @radix-ui/react-slot for component composition
  - Updated shadcn/ui component integration

- Added Mark Mode for screenshots:
  - New screenshot mode for marking multiple timestamps
  - Added UI for marking timestamps and capturing all marked points
  - Integrated with existing caption toggle functionality
  - Added clear functionality for marked timestamps
  - Improved state management for marked screenshots

- Fixed shadcn/ui component integration:
  - Added path alias configuration in vite.config.js
  - Created UI components directory with card, button, input, and label components
  - Added Tailwind CSS configuration and globals.css
  - Updated GifCaptureManager to use proper component imports
  - Simplified toast notifications to use window.alert temporarily
- Fixed backend GIF capture functionality:
  - Updated moviepy import statement in gif_capture.py
  - Cleaned up duplicate requirements in requirements.txt
  - Fixed module import path for better compatibility

- Added GIF capture functionality:
  - Created new backend module gif_capture.py for GIF creation
  - Added new GifCaptureManager.jsx component for frontend
  - Integrated with existing screenshot gallery
  - Support for customizable duration and FPS
  - GIF preview in gallery
- Added toggle for caption generation when taking screenshots
  - Added `processWithCaptions` state to EnhancedScreenshotManager
  - Modified `captureScreenshot` function to skip caption API calls when disabled
  - Added UI toggle next to screenshot mode selection
- Modified VideoRequest model in backend to include `generate_caption` parameter

### Updates on 1/18/25:
- Removed smart detection functionality:
  - Removed smart detection UI option and related code from EnhancedScreenshotManager
  - Removed SceneDetector class and analyze-video-frames endpoint from backend
  - Removed OpenCV and computer vision related dependencies
  - Streamlined screenshot interface to focus on single and burst modes

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

# How to build the docker images and deploy to gcloud 
## to test locally we added static folder and from root directory u can use:
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
(python main.py i think)

### Docker Instructions:

**Start with:** docker build --platform linux/amd64 -t youtube-notes-app .

Terminal:
docker exec -it <container_id> ls -la /app/static

Docker build:
docker build -t youtube-notes-app .

Docker Run:
docker run -p 8000:8000 youtube-notes-app

# Docker commands (u can do as script if u want)
## create your app service accounts and give them privileges:
# Create a service account for Cloud Run
gcloud iam service-accounts create youtube-notes-app-sa \
    --display-name="YouTube Notes App Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding webapps-426717 \
    --member="serviceAccount:youtube-notes-app-sa@webapps-426717.iam.gserviceaccount.com" \
    --role="roles/run.invoker"

# Navigate to your project directory
cd '/Users/williamsmith/Library/CloudStorage/OneDrive-Personal/Coding OneDrive/youtube-notes-app-clean-Claude-OneDrive-011025-gcloud'

# Submit the build to Cloud Build
gcloud builds submit --tag gcr.io/webapps-426717/youtube-notes-app

# Deploy to Cloud Run
gcloud run deploy youtube-notes-app \
  --image gcr.io/webapps-426717/youtube-notes-app \
  --platform managed \
  --region us-central1 \
  --project webapps-426717 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1

# after deployment monitor your app:
After deployment:

Monitor your application:
bashCopy# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=youtube-notes-app" --limit 50

Check service status:
bashCopygcloud run services describe youtube-notes-app --region us-central1

View URL and other details:
bashCopygcloud run services list
