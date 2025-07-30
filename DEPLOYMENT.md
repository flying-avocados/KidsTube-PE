# 🚀 KidsTube-PE Deployment Guide

## 📋 Prerequisites

### Server Requirements:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Nginx** or **Apache** (for serving frontend)
- **SSH access** to your server

### Domain Setup:
- Your domain `http://kidstubepe.andrew.cmu.edu` should point to your server
- Port 5000 should be open for the backend API

## 🔧 Step 1: Server Preparation

### 1.1 Connect to Your Server
```bash
ssh your-username@kidstubepe.andrew.cmu.edu
```

### 1.2 Install Dependencies
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (if not already installed)
sudo apt-get install -y mongodb

# Install Nginx (for serving frontend)
sudo apt-get install -y nginx
```

### 1.3 Create Application Directory
```bash
mkdir -p /var/www/kidstube
cd /var/www/kidstube
```

## 📦 Step 2: Upload Your Code

### 2.1 Upload Files
Upload your KidsTube-PE project files to the server:
```bash
# From your local machine
scp -r ./KidsTube-PE/* your-username@kidstubepe.andrew.cmu.edu:/var/www/kidstube/
```

### 2.2 Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/kidstube
sudo chmod -R 755 /var/www/kidstube
```

## ⚙️ Step 3: Backend Configuration

### 3.1 Create Environment File
```bash
cd /var/www/kidstube/backend
nano .env
```

Add the following content:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kidstube
JWT_SECRET=your-super-secure-jwt-secret-key-here
FRONTEND_URL=http://kidstubepe.andrew.cmu.edu
BACKEND_URL=http://kidstubepe.andrew.cmu.edu:5000
```

### 3.2 Install Backend Dependencies
```bash
cd /var/www/kidstube/backend
npm install --production
```

### 3.3 Create Upload Directories
```bash
mkdir -p uploads/videos uploads/images
chmod 755 uploads uploads/videos uploads/images
```

### 3.4 Start Backend Server
```bash
# Using PM2 (recommended for production)
sudo npm install -g pm2
pm2 start server.js --name "kidstube-backend"
pm2 startup
pm2 save

# Or using nohup (alternative)
nohup node server.js > backend.log 2>&1 &
```

## 🌐 Step 4: Frontend Configuration

### 4.1 Install Frontend Dependencies
```bash
cd /var/www/kidstube/frontend
npm install
```

### 4.2 Build for Production
```bash
npm run build
```

### 4.3 Configure Web Server (Nginx)

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/kidstube
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name kidstubepe.andrew.cmu.edu;

    # Serve frontend
    location / {
        root /var/www/kidstube/frontend/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/kidstube/backend/uploads/;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kidstube /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Step 5: Security Configuration

### 5.1 Configure Firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw enable
```

### 5.2 Set Up SSL (Optional but Recommended)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d kidstubepe.andrew.cmu.edu
```

## 🚀 Step 6: Test Deployment

### 6.1 Test Backend
```bash
curl http://kidstubepe.andrew.cmu.edu:5000/
# Should return: "KidsTube-PE backend is running!"
```

### 6.2 Test Frontend
Visit `http://kidstubepe.andrew.cmu.edu` in your browser

### 6.3 Test API
```bash
curl http://kidstubepe.andrew.cmu.edu/api/auth
# Should return authentication-related response
```

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Check Logs
```bash
# Backend logs (if using PM2)
pm2 logs kidstube-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7.2 Restart Services
```bash
# Restart backend
pm2 restart kidstube-backend

# Restart Nginx
sudo systemctl restart nginx
```

### 7.3 Update Application
```bash
# Pull new code
cd /var/www/kidstube
git pull origin main

# Restart backend
cd backend
pm2 restart kidstube-backend

# Rebuild and deploy frontend
cd ../frontend
npm run build
sudo cp -r build/* /var/www/html/
```

## 🆘 Troubleshooting

### Common Issues:

1. **Port 5000 not accessible**
   - Check firewall: `sudo ufw status`
   - Check if backend is running: `pm2 status`

2. **CORS errors**
   - Verify CORS configuration in `backend/server.js`
   - Check allowed origins match your domain

3. **MongoDB connection issues**
   - Check MongoDB status: `sudo systemctl status mongodb`
   - Verify connection string in `.env` file

4. **File upload issues**
   - Check upload directory permissions
   - Verify disk space: `df -h`

### Useful Commands:
```bash
# Check running processes
ps aux | grep node

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn | grep :5000
```

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Ensure proper permissions are set
4. Test each component individually

Your KidsTube platform should now be live at `http://kidstubepe.andrew.cmu.edu`! 🎉 