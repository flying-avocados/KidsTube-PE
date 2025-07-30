# 🚀 Quick Deployment Guide

## ⚡ Fast Deployment (5 minutes)

### 1. Upload Your Code
```bash
# From your local machine, upload the project
scp -r ./KidsTube-PE/* your-username@kidstubepe.andrew.cmu.edu:/var/www/kidstube/
```

### 2. SSH into Your Server
```bash
ssh your-username@kidstubepe.andrew.cmu.edu
cd /var/www/kidstube
```

### 3. Run the Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Configure Web Server (Nginx)
```bash
sudo nano /etc/nginx/sites-available/kidstube
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name kidstubepe.andrew.cmu.edu;

    location / {
        root /var/www/kidstube/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        alias /var/www/kidstube/backend/uploads/;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kidstube /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### 5. Test Your Deployment
- Visit: `http://kidstubepe.andrew.cmu.edu`
- Backend API: `http://kidstubepe.andrew.cmu.edu:5000`

## 🔧 Manual Steps (if script fails)

### Backend Setup:
```bash
cd backend
npm install
mkdir -p uploads/videos uploads/images
nohup node server.js > ../backend.log 2>&1 &
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
```

## 🆘 Quick Troubleshooting

### Backend not starting?
```bash
cd backend
node server.js  # Check for errors
```

### Frontend not loading?
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### CORS errors?
- Check that backend is running on port 5000
- Verify frontend is making requests to correct URL

## 📞 Need Help?
Check the full `DEPLOYMENT.md` guide for detailed instructions and troubleshooting. 