#!/bin/bash

# KidsTube-PE Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting KidsTube-PE Deployment..."

# Set production environment
export NODE_ENV=production

# Backend deployment
echo "📦 Deploying Backend..."
cd backend

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install --production

# Create uploads directory if it doesn't exist
mkdir -p uploads/videos uploads/images

# Set permissions
sudo chmod 755 uploads
sudo chmod 755 uploads/videos
sudo chmod 755 uploads/images

# Start backend server (you might want to use PM2 or similar for production)
echo "🔧 Starting backend server..."
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

cd ..

# Frontend deployment
echo "📦 Deploying Frontend..."
cd frontend

# Install dependencies
echo "📥 Installing frontend dependencies..."
sudo npm install

# Build for production
echo "🔨 Building frontend for production..."
sudo npm run build

# Copy build to web server directory (adjust path as needed)
echo "📋 Copying build files to web server..."
sudo cp -r build/* /var/www/html/ 2>/dev/null || echo "⚠️  Could not copy to /var/www/html - you may need to configure your web server manually"

cd ..

echo "✅ Deployment completed!"
echo "🌐 Backend running on: http://kidstubepe.andrew.cmu.edu:5000"
echo "🌐 Frontend should be accessible on: http://kidstubepe.andrew.cmu.edu"
echo "📝 Backend logs: backend.log"
echo "🔄 To restart backend: kill $BACKEND_PID && cd backend && nohup node server.js > ../backend.log 2>&1 &" 