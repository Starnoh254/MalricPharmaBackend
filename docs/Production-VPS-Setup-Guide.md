# 🌐 Production Deployment Guide - VPS Setup with Nginx

## 🎯 COMPLETE PRODUCTION SETUP

This guide covers setting up your Node.js backend on a VPS with nginx, domain configuration, SSL, process management, and database setup.

---

## 📋 SERVER REQUIREMENTS

### Minimum VPS Specifications:

- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 20GB SSD minimum
- **OS**: Ubuntu 20.04/22.04 LTS (recommended)
- **Network**: Static IP address

---

## 🚀 STEP 1: INITIAL SERVER SETUP

### 1.1 Connect to Your VPS

```bash
# SSH into your VPS
ssh root@your-vps-ip-address

# Or if you have a user account
ssh username@your-vps-ip-address
```

### 1.2 Update System

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common
```

### 1.3 Create Application User

```bash
# Create a dedicated user for your application
sudo adduser malricpharma

# Add user to sudo group
sudo usermod -aG sudo malricpharma

# Switch to the new user
su - malricpharma
```

---

## 🔧 STEP 2: INSTALL REQUIRED SOFTWARE

### 2.1 Install Node.js (Latest LTS)

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.2 Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u malricpharma --hp /home/malricpharma
```

### 2.3 Install Nginx

```bash
# Install nginx
sudo apt install -y nginx

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check nginx status
sudo systemctl status nginx
```

### 2.4 Install MySQL

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

---

## 🗄️ STEP 3: DATABASE SETUP

### 3.1 Configure MySQL

```bash
# Login to MySQL as root
sudo mysql -u root -p

# Create database and user
CREATE DATABASE malric_pharma;
CREATE USER 'malricuser'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON malric_pharma.* TO 'malricuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 Test Database Connection

```bash
# Test the connection
mysql -u malricuser -p malric_pharma

# If successful, exit
EXIT;
```

### 3.3 Configure MySQL for Production

```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add/modify these settings:
[mysqld]
# Performance settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200

# Security settings
bind-address = 127.0.0.1
local_infile = 0

# Restart MySQL
sudo systemctl restart mysql
```

---

## 📂 STEP 4: DEPLOY YOUR APPLICATION

### 4.1 Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/malricpharma
sudo chown -R developer:developer /var/www/malricpharma
cd /var/www/malricpharma
```

### 4.2 Clone Your Repository

```bash
# Clone your repository (replace with your actual repo)
git clone https://github.com/your-username/MalricPharma-Backend.git backend
cd backend

# Install dependencies
npm install --production

# Install Prisma CLI
npm install -g prisma
```

### 4.3 Setup Environment Variables

```bash
# Create production environment file
nano .env

# Add your production environment variables:
```

```bash
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL="mysql://malricuser:your-strong-password@localhost:3306/malric_pharma"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-for-production-2024"

# M-Pesa Configuration (sandbox for now, update when going live)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://api.malricpharma.co.ke/api/v1/payments/mpesa/callback

# Server Configuration
CORS_ORIGIN=https://malricpharma.co.ke

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4.4 Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (if you have seed data)
npx prisma db seed
```

---

## 🌐 STEP 5: DOMAIN AND DNS CONFIGURATION

### 5.1 Configure DNS Records

In your domain registrar (e.g., Namecheap, GoDaddy), add these DNS records:

```
Type: A
Name: api
Value: your-vps-ip-address
TTL: 300 (or Auto)

Type: A
Name: @ (or root)
Value: your-vps-ip-address
TTL: 300

Type: CNAME
Name: www
Value: malricpharma.co.ke
TTL: 300
```

### 5.2 Wait for DNS Propagation

```bash
# Check if DNS is propagated (wait 5-30 minutes)
nslookup api.malricpharma.co.ke
dig api.malricpharma.co.ke
```

---

## 🔒 STEP 6: SSL CERTIFICATE SETUP

### 6.1 Install Certbot

```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Configure Nginx (Basic Setup First)

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/malricpharma
```

```nginx
# Basic Nginx Configuration (before SSL)
server {
    listen 80;
    server_name api.malricpharma.co.ke;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.3 Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/malricpharma /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6.4 Get SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d api.malricpharma.co.ke

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to share email with EFF
# - Select redirect option (recommended)
```

---

## 🔄 STEP 7: PROCESS MANAGEMENT WITH PM2

### 7.1 Create PM2 Ecosystem File

```bash
# Create PM2 configuration
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: "malricpharma-backend",
      script: "server.js", // or app.js, depending on your entry point
      instances: "max", // Use all CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Error and output logs
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",

      // Advanced PM2 features
      watch: false, // Don't watch files in production
      max_memory_restart: "1G",
      restart_delay: 4000,

      // Health monitoring
      min_uptime: "10s",
      max_restarts: 10,
    },
  ],
};
```

### 7.2 Create Logs Directory

```bash
# Create logs directory
mkdir -p logs
```

### 7.3 Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs
```

---

## ⚙️ STEP 8: PRODUCTION NGINX CONFIGURATION

### 8.1 Update Nginx Configuration for Production

```bash
# Edit the nginx configuration
sudo nano /etc/nginx/sites-available/malricpharma
```

```nginx
# Production Nginx Configuration
server {
    listen 80;
    server_name api.malricpharma.co.ke;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.malricpharma.co.ke;

    # SSL Configuration (Certbot will add these)
    ssl_certificate /etc/letsencrypt/live/api.malricpharma.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.malricpharma.co.ke/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate no_last_modified no_etag auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Main proxy configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;

        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching (if you serve any)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

### 8.2 Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🔥 STEP 9: FIREWALL CONFIGURATION

### 9.1 Configure UFW Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow MySQL (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 3306

# Check firewall status
sudo ufw status
```

---

## 📊 STEP 10: MONITORING AND LOGGING

### 10.1 Setup Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/malricpharma
```

```
/var/www/malricpharma/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 malricpharma malricpharma
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 10.2 Setup PM2 Monitoring

```bash
# Install PM2 monitoring (optional)
pm2 install pm2-logrotate

# Configure PM2 log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

---

## 🧪 STEP 11: TESTING YOUR DEPLOYMENT

### 11.1 Test Basic Connectivity

```bash
# Test HTTP to HTTPS redirect
curl -I http://api.malricpharma.co.ke

# Test HTTPS
curl -I https://api.malricpharma.co.ke

# Test API endpoint
curl https://api.malricpharma.co.ke/api/v1/health
```

### 11.2 Test Database Connection

```bash
# Check if your app can connect to database
pm2 logs malricpharma-backend --lines 50
```

### 11.3 Test M-Pesa Callback URL

```bash
# Test if M-Pesa can reach your callback
curl -X POST https://api.malricpharma.co.ke/api/v1/payments/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"test": "callback"}'
```

---

## 🚀 STEP 12: DEPLOYMENT SCRIPTS

### 12.1 Create Deployment Script

```bash
# Create deployment script
nano deploy.sh
```

```bash
#!/bin/bash

# MalricPharma Backend Deployment Script
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install/update dependencies
npm install --production

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Restart PM2 application
pm2 restart malricpharma-backend

# Wait for app to start
sleep 5

# Check if application is running
if pm2 list | grep -q "online"; then
    echo "✅ Deployment successful!"
    echo "📊 Application status:"
    pm2 status
else
    echo "❌ Deployment failed!"
    echo "📋 Logs:"
    pm2 logs --lines 20
    exit 1
fi
```

```bash
# Make script executable
chmod +x deploy.sh
```

### 12.2 Create Backup Script

```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/var/backups/malricpharma"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u malricuser -p malric_pharma > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/malricpharma/backend

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

```bash
# Make script executable
chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add this line for daily backup at 2 AM:
# 0 2 * * * /var/www/malricpharma/backend/backup.sh
```

---

## 📋 PRODUCTION CHECKLIST

### Security Checklist:

- [ ] SSL certificate installed and working
- [ ] Firewall configured (UFW)
- [ ] Database secured with strong passwords
- [ ] Environment variables properly set
- [ ] Security headers configured in nginx
- [ ] Rate limiting enabled
- [ ] SSH key authentication (disable password auth)

### Performance Checklist:

- [ ] PM2 cluster mode enabled
- [ ] Nginx gzip compression enabled
- [ ] Database optimized for production
- [ ] Log rotation configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Functional Checklist:

- [ ] Domain resolves correctly
- [ ] HTTPS redirect working
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] M-Pesa callback URL accessible
- [ ] Error handling working
- [ ] Logs being written correctly

---

## 🆘 TROUBLESHOOTING

### Common Issues:

#### 1. **502 Bad Gateway**

```bash
# Check if your Node.js app is running
pm2 status
pm2 logs

# Check nginx configuration
sudo nginx -t

# Check if port 3000 is in use
sudo netstat -tulpn | grep :3000
```

#### 2. **SSL Certificate Issues**

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test automatic renewal
sudo certbot renew --dry-run
```

#### 3. **Database Connection Issues**

```bash
# Check MySQL status
sudo systemctl status mysql

# Check database connectivity
mysql -u malricuser -p malric_pharma

# Check logs
sudo tail -f /var/log/mysql/error.log
```

#### 4. **PM2 Issues**

```bash
# Restart PM2
pm2 restart all

# Clear PM2 logs
pm2 flush

# Reload PM2 configuration
pm2 reload ecosystem.config.js
```

---

## 🎯 PRODUCTION COMMANDS REFERENCE

### Daily Operations:

```bash
# Check application status
pm2 status

# View logs
pm2 logs --lines 100

# Restart application
pm2 restart malricpharma-backend

# Deploy new version
./deploy.sh

# Check nginx status
sudo systemctl status nginx

# Check SSL certificate expiry
sudo certbot certificates
```

### Database Operations:

```bash
# Connect to database
mysql -u malricuser -p malric_pharma

# Run migrations
npx prisma migrate deploy

# Backup database
./backup.sh

# View database processes
SHOW PROCESSLIST;
```

---

## 🎉 CONGRATULATIONS!

Your production environment is now fully configured with:

✅ **Domain**: api.malricpharma.co.ke  
✅ **SSL**: Let's Encrypt certificate  
✅ **Process Manager**: PM2 with clustering  
✅ **Web Server**: Nginx with optimization  
✅ **Database**: MySQL with security  
✅ **Monitoring**: Logs and process monitoring  
✅ **Security**: Firewall, headers, rate limiting  
✅ **Automation**: Deployment and backup scripts

Your backend is now ready for production traffic and M-Pesa integration! 🚀

---

_Remember to regularly update your system, renew SSL certificates, and monitor your application logs._
