# YouTube Notes App

A web application for taking structured notes while watching YouTube videos. Features include:
- Screenshot capture with AI-generated captions
- Single screenshot, burst mode, and mark mode capture options
- GIF capture with customizable duration
- Image labeling with customizable text and font size
- Comprehensive transcript analysis
- Export to multiple formats (MD, HTML, PDF)


## Frontend detailed structure:
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

### Backend structure:
/modules/
  /models/
    __init__.py         - All Pydantic models (VideoRequest, CaptionRequest, etc.)
  /routes/
    __init__.py         - Router management and imports
    content_routes.py   - Save content endpoints
    gif_routes.py       - GIF capture functionality
    screenshot_routes.py - Screenshot and caption endpoints
    state_routes.py     - App state management
    transcript_routes.py - Transcript and analysis endpoints
    video_info_routes.py - YouTube video info endpoints
  /config.py            - Central configuration and service initialization

### Key Functionality Locations:
Screenshot Capture: screenshot_routes.py + screenshot_manager
Captions: screenshot_routes.py (generate-caption endpoint)
State Management: state_routes.py
File Saving: content_routes.py
Video Info: video_info_routes.py
GIF Creation: gif_routes.py

### Recent Structural Changes
The backend has been reorganized for better maintainability:

1. **Modular Route Structure**
   - Routes are split by feature (screenshots, transcripts, etc.)
   - Each route file is focused on specific functionality
   - Improved error handling and logging per route

2. **Centralized Models**
   - All Pydantic models moved to models/__init__.py
   - Shared between different route modules
   - Better type validation and consistency

3. **Configuration Management**
   - Central config.py for all settings
   - Service initialization (Claude, YouTube API)
   - Directory structure setup
   - Constants and environment variables

4. **Enhanced Frontend Organization**
   - Custom hooks for reusable logic
   - Feature-based component structure
   - Improved state management
   - Better separation of concerns

5. **API Integration**
   - Frontend API calls centralized in utils/apiUtils.js
   - Consistent error handling
   - Better type safety with backend models
   - Improved response processing


### Error troubleshooting related to backend prompt:
I'm getting [ERROR_MESSAGE] when trying to [ACTION]. 
This may related to a recent backend reorganization where we:
- Split main.py into modules (models, routes, config)
- Routes are in /modules/routes/
- Models are in /modules/models/__init__.py
- Configuration is in /modules/config.py

Relevant files that might be involved:
- Frontend: /frontend/src/components/[COMPONENT].jsx
- API calls: /frontend/src/utils/apiUtils.js
- Backend routes: /modules/routes/[FEATURE]_routes.py
- Backend models: /modules/models/__init__.py

Can you:
1. Check if the API route exists in the correct route file
2. Verify the model is defined in models/__init__.py
3. Confirm the frontend is using the correct endpoint
4. Look for any import/dependency issues



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

1/17/25:
NEW: add a feature during mark mode that allows the user to capture screenshot and add large font text onto the image or in front of the image so it appears part of the image. so there could be a toggle box next to generate captions box called "Label Image". When selected a text box appears that allows the user to enter text to overlay on the image so that the user can quickly understand the video's point. Font size should be 3-4x the size of a typical title heading aka taking up about 25% of the vertical area of the image. Maybe there could be a sample overlay that shows the text size with an input box where the user can enter the font size. 


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
DONE: Add ability to delete cards from the screenshot gallery
- 


1/8/25:
DONE: Add a box for interacting with the anthropic API with the entire transcript used as context. so the user can ask for specific questions to be answered about the transcript content, and those answers will then populate in the grid just like the new screenshot boxes do.

Adding a new feature: Think about how to Add a box for interacting with the anthropic API with the entire transcript used as context. so the user can ask for specific questions to be answered about the transcript content, and those answers will then populate in the grid just like the new screenshot boxes do. 

"Ask a question about this video!"

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

### Updates on 1/20/25:
- Fixed storage and API handling issues:
  - Added robust storage management system with quota monitoring and cleanup
  - Improved API response handling for transcript queries
  - Added fallback handling for different response formats
  - Enhanced error message extraction and display
  - Implemented type checking and validation
  - Added automatic cleanup of old data when storage is near capacity
  - Improved error handling across API calls

[Rest of the changelog section from paste.txt]

### Updates on 1/20/25:
- Added GIF mode to screenshot button disabling:
  - Button is now disabled in GIF mode
  - Added "Use GIF Controls" text when in GIF mode
  - Consistent behavior with mark mode disabling

### Previous Updates on 1/20/25:
- Fixed Take Screenshot button behavior in different modes:
  - Button is now properly disabled in mark mode
  - Fixed incorrect burst mode text showing in other modes
  - Added "Use Mark Controls" text when in mark mode
  - Improved button state management across modes
  - Added better visual feedback for disabled state

### Previous Updates on 1/20/25:
- Fixed button state issue when switching modes:
  - Added proper state reset when changing modes
  - Reset all capture-related states on mode switch
  - Improved mode change handling
  - Fixed Take Screenshot button remaining disabled
  - Added error state cleanup

### Previous Updates on 1/20/25:
- Fixed multiple screenshot-related issues:
  - Fixed Take Screenshot button incorrectly being disabled
  - Fixed mark mode not preserving screenshots without captions
  - Improved screenshot state management in mark mode
  - Added proper state cleanup after capturing
  - Fixed issue with screenshots being overwritten

### Previous Updates on 1/20/25:
- Fixed caption error message showing incorrectly in mark mode:
  - Added captionDisabled flag to properly track when captions are intentionally disabled
  - Updated ScreenshotGallery to not show caption UI for caption-disabled screenshots
  - Fixed error message showing up when captions were intentionally disabled
  - Improved caption error handling and display logic

### Previous Updates on 1/20/25:
- Fixed screenshot ordering and display issues:
  - Added timestamp-based sorting for consistent screenshot order
  - Improved screenshot state management in single capture mode
  - Fixed issue with screenshots not displaying properly in gallery
  - Ensured consistent behavior between mark mode and single captures
  - Added proper screenshot timestamp sorting in handlers

### Previous Updates on 1/20/25:
- Fixed issue with screenshots not displaying in mark mode when taken without captions:
  - Modified ScreenshotGallery to only show caption section when content exists
  - Removed empty caption property from screenshot data when captions are disabled
  - Improved caption rendering to filter out empty lines
  - Added proper content type handling for caption-less screenshots

### Updates on 1/20/25:
- Major backend refactoring:
  - Split main.py into smaller, focused modules
  - Created new module structure for better organization
  - Moved models to dedicated module
  - Created config module for centralized configuration
  - Split routes into separate modules:
    - content_routes.py for saving content
    - gif_routes.py for GIF capture
    - screenshot_routes.py for screenshots and captions
    - state_routes.py for app state management
    - transcript_routes.py for transcript operations
    - video_info_routes.py for YouTube info
  - Improved error handling and logging
  - Better separation of concerns

- Created new custom hook useNearBottom.js:
  - Moved scroll detection logic from App.jsx to dedicated hook
  - Improved code organization and reusability
  - Better separation of concerns
  - Cleaner App.jsx file structure

- Created new handlers.js utility file:
  - Moved all event handlers from App.jsx to dedicated file
  - Implemented factory functions for handler creation
  - Improved dependency injection through parameters
  - Better state management in handlers
  - Reduced App.jsx complexity

- Added save content functionality:
  - New /api/save-content endpoint in backend
  - Dedicated directory for saved content
  - Enhanced error handling
  - Better user feedback with file paths
  - Fixed HTML content generation




### Updates on 1/19/25:
- Refactored App.jsx for better organization:
  - Split App.jsx into smaller components
  - Created new styles directory for CSS
  - Added layouts directory with MainLayout component
  - Created utils directory for helper functions
  - Added features directory with module-specific components
  - Improved state management and code organization
  - Added VideoSection component
  - Created reusable hooks
  - Improved code maintainability

## Changelog
## take a look at the VideoControls.jsx that was created and maybe use that. I created a backup called Enhanced_VideoControl.jsx
### Updates on 1/19/25:
- Added Save Content feature:
  - New SaveContentButton component for saving all content
  - Generates clean HTML output with proper formatting
  - Saves screenshots, captions, and notes
  - Includes video description and transcript
  - Responsive layout that works on all devices
  - Print-friendly styling
  - Automatic filename generation
  - Error handling and loading states
  - Fixed position at bottom of page
  - Gradient background effect
  - Backend support for file saving

### Previous Updates on 1/19/25:
- Fixed GIF capture functionality:
  - Added retry mechanism for video downloads
  - Improved error handling and user feedback
  - Added detailed status messages during capture
  - Enhanced input validation
  - Added better cleanup of temporary files
  - Fixed 403 Forbidden error with YouTube downloads
  - Added recommendations for duration and FPS
  - Improved error messages and status updates

### Previous Updates on 1/19/25:
- Removed duplicate controls:
  - Consolidated video controls into VideoControls component
  - Removed redundant full-width toggle
  - Removed duplicate file erase checkbox
  - Removed duplicate clear data button
  - Simplified header layout

### Previous Updates on 1/19/25:
- Improved mobile responsiveness:
  - Better padding and spacing for small screens
  - Vertical stacking of controls on mobile
  - Improved button layout and sizing
  - Grid layout optimization for small screens
  - Added responsive padding based on screen size
  - Fixed overflow issues on mobile devices
  - Enhanced readability on small screens

### Previous Updates on 1/19/25:
- Improved screenshot controls layout:
  - Combined screenshot buttons onto single line
  - Added vertical separator between controls
  - Improved spacing and alignment
  - Made buttons more compact while maintaining usability
  - Enhanced visual hierarchy of controls

### Previous Updates on 1/19/25:
- Improved video controls UI:
  - Created new VideoControls component for better organization
  - Combined URL input and control buttons into single cohesive bar
  - Improved responsive design for different screen sizes
  - Added consistent styling using shadcn/ui components
  - Enhanced visual hierarchy and component separation

### Updates on 1/17/25:
- Added image labeling feature:
  - New "Label Image" toggle in screenshot controls
  - Customizable font size for labels
  - Live preview of label appearance
  - White text with black outline for visibility
  - Labels are centered in upper portion of images
  - Custom font support with fallback option
- More updates 1/17/25:
  The label feature allows users to add text overlays to screenshots with:
Toggle switch to enable/disable labeling
Input field for the label text
Font size control
Live preview of how the label will look
White text with black outline for visibility on any background

The backend processing:
Adds the text overlay to the screenshot before optimization
Centers the text in the upper portion of the image
Handles font loading with fallback options
Maintains image quality while adding the tex

The implementation follows best practices:
Proper state management
Clear separation of concerns
Error handling
Responsive design
Accessibility support through shadcn/ui components


### Updates on 1/17/25:
- Improved UI visibility control:
  - Preserved video title and controls when main content is hidden
  - Separated always-visible elements from hideable content
  - Enhanced UI clarity and consistency
  - Maintained key information during content toggling

### Previous Updates on 1/17/25:
- Consolidated transcript controls:
  - Removed redundant transcript visibility controls
  - Unified transcript visibility under the main controls box
  - Improved overall UI consistency
  - Removed redundant gray hide/show transcript button

### Previous Updates on 1/17/25:
- Fixed transcript outline generation:
  - Fixed transcript formatting in controls box outline generation
  - Removed duplicate outline generation button
  - Consolidated outline generation to a single button
  - Fixed 422 Unprocessable Content error in outline generation

### Previous Updates on 1/17/25:
- Improved transcript controls:
  - Moved 'Generate Outline' button into transcript controls box
  - Removed duplicate transcript outline button
  - Improved control layout and consistency
  - Streamlined button placement for better UX

### Previous Updates on 1/17/25:
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




## Core Features

### Screenshot Modes
- **Single Screenshot**: Take individual screenshots with optional captions
- **Burst Mode**: Capture multiple screenshots at specified intervals
- **Mark Mode**: Mark points in video for later batch capture
- **GIF Mode**: Create animated GIFs with custom duration

### Caption and Labeling
- AI-powered captions using Claude API
- Custom image labels with adjustable text size
- Optional caption generation per screenshot
- Support for caption regeneration

### Video Controls
- Full-width toggle for video player
- Timestamp-based navigation
- Adaptive controls for each screenshot mode
- Real-time transcript display

### Organization
- Screenshot gallery with pagination
- Chronological timestamp sorting
- Content type categorization
- Screenshot state persistence

### Export Options
- Markdown export with formatting
- HTML export with styling
- PDF export via system print
- Full transcript export

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

### Core Components
- **App.jsx**: Global state management and component coordination
- **VideoSection.jsx**: Video player and core video controls
- **NotesManager.jsx**: Notes management and export functionality
- **TranscriptViewer.jsx**: Transcript display and navigation

### Screenshot Components
- **EnhancedScreenshotManager.jsx**: Main screenshot management
- **ScreenshotGallery.jsx**: Gallery display and organization
- **ScreenshotModeSelector.jsx**: Mode selection interface
- **CaptureControls.jsx**: Mode-specific control buttons
- **LabelControls.jsx**: Image label customization
- **GifCaptureManager.jsx**: GIF capture and customization

### Helper Components
- **SaveContentButton.jsx**: Content export functionality
- **VideoInfoViewer.jsx**: Video metadata display
- **FullTranscriptViewer.jsx**: Complete transcript view

### Configuration and Utils
- **config.js**: API endpoints and global settings
- **apiUtils.js**: API interaction helpers
- **handlers.js**: Event handler factories
- **useNearBottom.js**: Scroll detection hook

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