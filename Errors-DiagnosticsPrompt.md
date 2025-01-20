I'm getting [ERROR_MESSAGE] when trying to [ACTION]. 
This is related to a recent backend reorganization where we:
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

## Backend Organization:
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