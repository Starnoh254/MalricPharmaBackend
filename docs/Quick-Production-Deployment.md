# 🚀 QUICK DEPLOYMENT CHECKLIST - api.malricpharma.co.ke

## 🎯 IMMEDIATE ACTION ITEMS

Here's your step-by-step checklist to get api.malricpharma.co.ke live today:

---

## 📋 PHASE 1: VPS BASIC SETUP (30 minutes)

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
```

### 2. Install Essential Software

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js LTS (v18 or v20 - REQUIRED for Express 5+)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt-get install -y nodejs

# Verify Node.js version (must be 16+ for modern Express)
node --version  # Should show v18.x.x or v20.x.x

# Install other essentials
apt install -y nginx mysql-server git

# Install PM2 globally
npm install -g pm2

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

---

## 📋 PHASE 2: DOMAIN & DNS (5 minutes)

### Add DNS Records in Your Domain Registrar:

```
Type: A
Name: api
Value: YOUR_VPS_IP_ADDRESS
TTL: 300

Type: A
Name: @
Value: YOUR_VPS_IP_ADDRESS
TTL: 300
```

### Test DNS (wait 5-10 minutes):

```bash
nslookup api.malricpharma.co.ke
```

---

## 📋 PHASE 3: DATABASE SETUP (10 minutes)

### 1. Secure MySQL

```bash
mysql_secure_installation
# Choose YES for all security options
# Set a strong root password
```

### 2. Create Database & User

```bash
mysql -u root -p

# In MySQL console:
CREATE DATABASE malric_pharma;
CREATE USER 'malricuser'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON malric_pharma.* TO 'malricuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📋 PHASE 4: DEPLOY YOUR CODE (15 minutes)

### 1. Create App Directory

```bash
mkdir -p /var/www/malricpharma
cd /var/www/malricpharma

# Clone your repository
git clone YOUR_GITHUB_REPO_URL backend
cd backend
```

### 2. Install Dependencies

```bash
# Clear any cached dependencies
rm -rf node_modules package-lock.json

# Install production dependencies (requires Node.js 16+)
npm install --production

# Install global tools
npm install -g prisma@latest
```

### 3. Create Production Environment File

```bash
nano .env
```

```bash
# Copy this into your .env file:
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="mysql://malricuser:YOUR_STRONG_PASSWORD@localhost:3306/malric_pharma"

# JWT Secret (change this!)
JWT_SECRET="malric-pharma-super-secure-production-secret-2024"

# M-Pesa (sandbox for now)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your-sandbox-consumer-key
MPESA_CONSUMER_SECRET=your-sandbox-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://api.malricpharma.co.ke/api/v1/payments/mpesa/callback

# CORS
CORS_ORIGIN=https://malricpharma.co.ke
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (if you have seed data)
npx prisma db seed
```

---

## 📋 PHASE 5: NGINX CONFIGURATION (10 minutes)

### 1. Create Nginx Config

```bash
nano /etc/nginx/sites-available/malricpharma
```

```nginx
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

### 2. Enable Site

```bash
# Enable the configuration
ln -s /etc/nginx/sites-available/malricpharma /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
```

---

## 📋 PHASE 6: SSL CERTIFICATE (5 minutes)

### Get Let's Encrypt Certificate

```bash
certbot --nginx -d api.malricpharma.co.ke

# Follow prompts:
# 1. Enter your email
# 2. Agree to terms
# 3. Choose to redirect HTTP to HTTPS
```

---

## 📋 PHASE 7: START APPLICATION (5 minutes)

### 1. Create PM2 Config

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: "malricpharma-backend",
      script: "server.js", // or app.js - check your entry point
      instances: 2,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

### 2. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you

# Check status
pm2 status
```

---

## 📋 PHASE 8: TESTING (5 minutes)

### Test Your Deployment

```bash
# Test HTTPS redirect
curl -I http://api.malricpharma.co.ke

# Test HTTPS response
curl -I https://api.malricpharma.co.ke

# Test API endpoint (if you have a health check)
curl https://api.malricpharma.co.ke/api/v1/health

# Test M-Pesa callback URL
curl -X POST https://api.malricpharma.co.ke/api/v1/payments/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"test": "callback"}'
```

---

## 🔥 QUICK TROUBLESHOOTING

### If Something Goes Wrong:

#### 502 Bad Gateway:

```bash
# Check if your app is running
pm2 status
pm2 logs

# Check if port 3000 is in use
netstat -tulpn | grep :3000
```

#### SSL Issues:

```bash
# Check certificate
certbot certificates

# Force renewal
certbot renew --force-renewal
```

#### Database Issues:

```bash
# Test database connection
mysql -u malricuser -p malric_pharma

# Check MySQL status
systemctl status mysql
```

---

## 📞 PRODUCTION COMMANDS

### Daily Commands You'll Use:

```bash
# Check app status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart malricpharma-backend

# Deploy new code
cd /var/www/malricpharma/backend
git pull origin main
npm install --production
npx prisma migrate deploy
pm2 restart malricpharma-backend

# Check nginx
systemctl status nginx

# Reload nginx config
systemctl reload nginx
```

---

## ⚡ PRODUCTION vs DEVELOPMENT

### ❌ DON'T USE IN PRODUCTION:

```bash
npm run dev        # Development mode
node server.js     # Manual node execution
nodemon           # File watching (development)
```

### ✅ USE IN PRODUCTION:

```bash
pm2 start ecosystem.config.js --env production  # Process manager
pm2 restart malricpharma-backend               # Restart service
pm2 logs                                       # View logs
pm2 status                                     # Check status
```

---

## 🎯 SUCCESS CHECKLIST

Your deployment is successful when:

- [ ] `https://api.malricpharma.co.ke` loads without errors
- [ ] `http://api.malricpharma.co.ke` redirects to HTTPS
- [ ] `pm2 status` shows your app as "online"
- [ ] API endpoints respond correctly
- [ ] Database connection works
- [ ] SSL certificate is valid
- [ ] M-Pesa callback URL is accessible

---

## 🚀 ESTIMATED TIME: 1.5 HOURS TOTAL

**You're almost there! Follow this checklist step by step and you'll have a production-ready API running on api.malricpharma.co.ke with proper SSL, database, and process management.**

**Need help with any specific step? Just ask!** 🤝
