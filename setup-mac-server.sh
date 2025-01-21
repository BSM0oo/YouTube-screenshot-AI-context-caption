#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Print with color
print_color() {
    color=$1
    message=$2
    printf "${color}${message}${NC}\n"
}

# Welcome message
print_color $GREEN "YouTube Notes App - Mac Server Setup Script"
print_color $GREEN "=========================================="
echo

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    print_color $YELLOW "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install required packages
print_color $GREEN "Installing required packages..."
brew install nginx certbot ddclient node python@3.11
npm install -g pm2

# Get configuration values
read -p "Enter your domain name (e.g., myapp.duckdns.org): " DOMAIN
read -p "Enter your desired backend port (default: 8000): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-8000}

# Create nginx configuration
print_color $GREEN "Creating nginx configuration..."
sudo tee /usr/local/etc/nginx/servers/youtube-notes.conf << EOL
server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'";

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=one:10m rate=30r/m;
    limit_req zone=one burst=10 nodelay;

    location / {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Additional security
        proxy_hide_header X-Powered-By;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
    }
}

server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOL

# Configure SSL
print_color $GREEN "Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN

# Start nginx
print_color $GREEN "Starting nginx..."
brew services start nginx

# Create PM2 ecosystem file
print_color $GREEN "Creating PM2 configuration..."
cat > ecosystem.config.js << EOL
module.exports = {
  apps : [{
    name: "youtube-notes-backend",
    script: "python",
    args: "main.py",
    env: {
      PORT: "$BACKEND_PORT",
      NODE_ENV: "production"
    },
    watch: false,
    max_memory_restart: '1G',
    error_file: "logs/error.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true
  }]
}
EOL

# Create logs directory
mkdir -p logs

# Start backend with PM2
pm2 start ecosystem.config.js
pm2 save

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)

print_color $GREEN "\nSetup completed successfully!"
echo
print_color $YELLOW "Next steps:"
echo "1. Configure port forwarding on your router:"
echo "   - Forward port 80 to $LOCAL_IP:80"
echo "   - Forward port 443 to $LOCAL_IP:443"
echo
echo "2. Update your frontend configuration:"
echo "   API_BASE_URL = 'https://$DOMAIN'"
echo
print_color $YELLOW "To monitor your application:"
echo "- View PM2 status: pm2 status"
echo "- View backend logs: pm2 logs youtube-notes-backend"
echo "- View nginx logs: tail -f /usr/local/var/log/nginx/error.log"
echo
print_color $YELLOW "To stop the server:"
echo "pm2 stop youtube-notes-backend"
echo "brew services stop nginx"