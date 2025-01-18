# 1) make executabel: chmod +x deploy.sh
# then deploy using the script: 
#  ./deploy.sh

# Navigate to your project directory
cd '/Users/williamsmith/Library/CloudStorage/OneDrive-Personal/Coding OneDrive/youtube-notes-app-clean-Claude-OneDrive-011025-gcloud'

# Configuration
PROJECT_ID="webapps-426717"
REGION="us-west1"  # or your preferred region
SERVICE_NAME="youtube-notes-app"

# Build the container
echo "Building container..."

docker build --platform linux/amd64 -t youtube-notes-app .

echo "Container built..."
echo "Attempting to run container..."

docker run youtube-notes-app -p 8080:8080

echo "Container running..."
