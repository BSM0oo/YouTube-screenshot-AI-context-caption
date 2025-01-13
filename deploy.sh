# Navigate to your project directory
cd '/Users/williamsmith/Library/CloudStorage/OneDrive-Personal/Coding OneDrive/youtube-notes-app-clean-Claude-OneDrive-011025-gcloud'

# Submit the build to Cloud Build
gcloud builds submit --tag gcr.io/webapps-426717/youtube-notes-app

# Deploy to Cloud Run
gcloud run deploy youtube-notes-app \
  --image gcr.io/webapps-426717/youtube-notes-app \
  --platform managed \
  --region us-west1 \
  --project webapps-426717 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1