# 🚨 Deployment Troubleshooting Guide - MalricPharma Backend

## 🎯 **Quick Diagnosis**

When deployment fails, check these common issues in order:

### **1. Node.js Version Issues** ⚠️

```bash
# Symptom: "Unsupported engine" errors
# Quick check:
ssh server 'node --version'  # Should be 16+

# Fix: Ensure nvm loads in deployment script
```

### **2. Permission Issues** 🔐

```bash
# Symptom: "Permission denied" or "sudo: no password"
# Quick check:
ssh server 'whoami && pwd && ls -la'

# Fix: Use user directories, avoid sudo in CI/CD
```

### **3. Database Connection** 🗄️

```bash
# Symptom: Prisma errors, migration failures
# Quick check:
ssh server 'cd /var/www/malricpharma/MalricPharmaBackend && npx prisma db pull'

# Fix: Check DATABASE_URL in .env
```

### **4. PM2 Process Issues** 🔄

```bash
# Symptom: App shows "stopped" or "error"
# Quick check:
ssh server 'pm2 status && pm2 logs malricpharma-backend --lines 10'

# Fix: Check app logs for specific errors
```

---

## 📋 **Step-by-Step Troubleshooting**

### **Step 1: Environment Check**

```bash
# SSH into server
ssh developer@your-server

# Check versions
node --version  # Should be 16+
npm --version   # Should be recent
pm2 --version   # Should exist

# Check app directory
cd /var/www/malricpharma/MalricPharmaBackend
ls -la  # Verify files exist
```

### **Step 2: Manual Deployment Test**

```bash
# Run deployment steps manually
git fetch origin
git reset --hard origin/main
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 restart malricpharma-backend
```

### **Step 3: Check Logs**

```bash
# PM2 logs
pm2 logs malricpharma-backend --lines 50

# System logs
sudo journalctl -u nginx -f
tail -f /var/log/nginx/error.log
```

---

## 🔧 **Common Fixes**

### **Fix 1: Node.js Version Mismatch**

**Problem**: Different Node.js versions in interactive vs non-interactive shells

**Solution**: Add to deployment script:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default
```

### **Fix 2: Permission Issues**

**Problem**: Can't create directories or install packages

**Solution**: Use user directories:

```bash
BACKUP_DIR="$HOME/backups/malricpharma"  # Not /var/backups
npm install  # Not sudo npm install
```

### **Fix 3: Database Issues**

**Problem**: Prisma can't connect to database

**Solution**: Check environment variables:

```bash
# Verify .env file
cat .env | grep DATABASE_URL
mysql -u malricuser -p malric_pharma  # Test connection
```

### **Fix 4: Application Won't Start**

**Problem**: PM2 shows app as stopped or errored

**Solution**: Check app logs and fix errors:

```bash
pm2 logs malricpharma-backend
pm2 delete malricpharma-backend
pm2 start ecosystem.config.js --env production
```

---

## 🚨 **Emergency Recovery**

### **If Deployment Completely Breaks**

1. **Stop broken app**:

   ```bash
   pm2 stop malricpharma-backend
   ```

2. **Restore from backup**:

   ```bash
   cd /var/www/malricpharma/MalricPharmaBackend
   # Find latest backup
   ls -la ~/backups/malricpharma/
   # Restore
   tar -xzf ~/backups/malricpharma/app_backup_YYYYMMDD_HHMMSS.tar.gz
   ```

3. **Restart with known good version**:
   ```bash
   npm install --production
   pm2 restart malricpharma-backend
   ```

### **If Database Gets Corrupted**

1. **Reset database** (⚠️ DEVELOPMENT ONLY):

   ```bash
   npx prisma migrate reset --force
   npx prisma db seed
   ```

2. **Restore from backup** (Production):
   ```bash
   mysql -u malricuser -p malric_pharma < backup.sql
   ```

---

## 📞 **Quick Commands Reference**

### **Deployment Status**

```bash
# Full status check
pm2 status
systemctl status nginx
mysql -u malricuser -p -e "SELECT 1"
curl https://api.malricpharma.co.ke/api/v1/health
```

### **Log Checking**

```bash
# Application logs
pm2 logs malricpharma-backend --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -xe
```

### **Manual Deployment**

```bash
cd /var/www/malricpharma/MalricPharmaBackend
git pull origin main
npm install --production
npx prisma migrate deploy
pm2 restart malricpharma-backend
```

---

## 🎯 **Prevention Tips**

1. **Test deployments** in staging environment first
2. **Monitor application** logs regularly
3. **Keep backups** before each deployment
4. **Document changes** and their impacts
5. **Use health checks** to verify deployments

---

## 📋 **When to Contact Support**

- **Server hardware issues** (disk space, memory)
- **Network connectivity problems**
- **SSL certificate renewal issues**
- **Database corruption** (production)
- **Security incidents**

---

**Remember**: Most deployment issues are environment-related. Check versions, permissions, and configuration first! 🎯
