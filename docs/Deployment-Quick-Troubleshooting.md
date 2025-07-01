# Deployment Script Troubleshooting Quick Reference

## Quick Error Diagnosis

### 🔍 How to Read Deployment Failures

When a deployment fails, check the GitHub Actions log in this order:

1. **Last error message** - Usually the root cause
2. **Exit code** - `exit 1` indicates controlled failure
3. **Previous successful step** - Where things went wrong
4. **PM2 logs section** - Application-specific errors

## Common Error Patterns & Instant Fixes

### 1. Directory Navigation Failures

**Error Pattern:**

```
❌ Failed to navigate to app directory
```

**Instant Fix:**

```bash
# Check if directory exists on VPS
ls -la /var/www/malricpharma/
```

**Root Causes:**

- Incorrect directory path in script
- Directory deleted or moved
- Permissions changed

---

### 2. Node.js Version Issues

**Error Pattern:**

```
⚠️ Node.js version is too old (vX). Need to use nvm
❌ Current Node.js version is incompatible
```

**Instant Fix:**

```bash
# SSH to VPS and check versions
node --version  # System node
nvm list        # Available nvm versions
nvm use default # Switch to nvm default
```

**Root Causes:**

- System Node.js vs nvm version mismatch
- nvm not loaded in non-interactive shell
- Default nvm version not set

---

### 3. npm Install Failures

**Error Pattern:**

```
❌ Dependency installation failed
npm ERR! peer dep missing
```

**Instant Fixes:**

```bash
# Clear npm cache
npm cache clean --force

# Remove lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install --production
```

**Root Causes:**

- Package conflicts
- Corrupted npm cache
- Version incompatibilities

---

### 4. Prisma Migration Errors

**Error Pattern:**

```
❌ Migration failed
P3009: migrate found failed migration
```

**Instant Fix:**

```bash
# Check migration status
npx prisma migrate status

# Resolve specific failed migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Retry
npx prisma migrate deploy
```

**Root Causes:**

- Previous migration interrupted
- Database schema drift
- Shadow database issues

---

### 5. PM2 Process Issues

**Error Pattern:**

```
❌ Application failed to start!
0│malricpharma-backend │ error    │ Error: listen EADDRINUSE
```

**Instant Fixes:**

```bash
# Check what's using the port
lsof -i :3000

# Kill conflicting processes
pm2 kill
pkill -f node

# Restart
pm2 start ecosystem.config.js --env production
```

**Root Causes:**

- Port already in use
- Zombie processes
- Configuration errors

---

### 6. Health Check False Negatives

**Error Pattern:**

```
❌ Application failed to start!
# But pm2 list shows process as online
```

**Debugging Steps:**

```bash
# Check exact PM2 output
pm2 list

# Check process name variations
pm2 list | grep -i malric

# Check logs for startup issues
pm2 logs malricpharma-backend --lines 50
```

**Root Causes:**

- Process name truncation in PM2
- App started but not ready
- Health check too strict

---

### 7. SSH/Connection Issues

**Error Pattern:**

```
Failed to connect to VPS
Permission denied (publickey)
```

**Instant Fixes:**

```bash
# Test SSH connection locally
ssh -i ~/.ssh/your_key user@your_vps

# Check SSH key format (should be RSA/Ed25519)
cat ~/.ssh/your_key | head -1

# Verify VPS SSH config
sudo nano /etc/ssh/sshd_config
```

**Root Causes:**

- Wrong SSH key format
- Key has passphrase
- VPS SSH configuration

---

### 8. API Endpoint Test Failures

**Error Pattern:**

```
⚠️ API endpoint test failed
curl: (7) Failed to connect
```

**Debugging:**

```bash
# Test locally on VPS
curl http://localhost:3000/api/v1/health

# Check if app is actually listening
netstat -tlnp | grep :3000

# Check firewall
ufw status
```

**Root Causes:**

- App not fully started
- Firewall blocking requests
- Wrong endpoint URL

## Emergency Recovery Procedures

### 1. Complete Deployment Rollback

```bash
# SSH to VPS
ssh user@your_vps

# Navigate to app directory
cd /var/www/malricpharma/MalricPharmaBackend

# Stop current app
pm2 stop malricpharma-backend

# Restore from latest backup
cd $HOME/backups/malricpharma
LATEST_BACKUP=$(ls -t app_backup_*.tar.gz | head -1)
cd /var/www/malricpharma/MalricPharmaBackend
tar -xzf $HOME/backups/malricpharma/$LATEST_BACKUP

# Restart
pm2 restart malricpharma-backend
```

### 2. Force Clean Reinstall

```bash
# Stop all PM2 processes
pm2 kill

# Clean everything
rm -rf node_modules package-lock.json
npm cache clean --force

# Fresh install
npm install --production

# Regenerate Prisma
npx prisma generate

# Start fresh
pm2 start ecosystem.config.js --env production
```

### 3. Database Recovery

```bash
# Check database connection
npx prisma db push --accept-data-loss

# Reset migrations (DANGER: data loss)
npx prisma migrate reset --force

# Or restore from backup if available
```

## Preventive Measures

### 1. Pre-deployment Checklist

- [ ] Test script changes in staging environment
- [ ] Verify all secrets are up to date
- [ ] Check VPS disk space and memory
- [ ] Ensure backup directory has space
- [ ] Validate Node.js version compatibility

### 2. Monitoring Setup

```bash
# Add to crontab for basic monitoring
*/5 * * * * curl -f http://localhost:3000/api/v1/health || echo "API down at $(date)" >> /var/log/api-monitor.log
```

### 3. Regular Maintenance

```bash
# Weekly cleanup script
#!/bin/bash
# Clean old logs
pm2 flush

# Clean old backups (keep last 10)
cd $HOME/backups/malricpharma
ls -t app_backup_*.tar.gz | tail -n +11 | xargs -r rm

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart PM2 processes
pm2 restart all
```

## Debug Command Collection

```bash
# System info
uname -a
df -h
free -h

# Node.js environment
node --version
npm --version
which node
which npm
echo $NODE_PATH

# PM2 diagnostics
pm2 list
pm2 info malricpharma-backend
pm2 logs malricpharma-backend --lines 100

# Network diagnostics
netstat -tlnp
ss -tlnp
lsof -i :3000

# Database connectivity
npx prisma db pull --schema=./prisma/schema.prisma
```

## When to Escalate

Contact system administrator when:

- Repeated disk space errors
- Database corruption detected
- VPS unresponsive
- Multiple deployment failures with different error patterns
- Security-related errors

## Quick Contact Commands

```bash
# Check system status
systemctl status nginx
systemctl status postgresql
systemctl status redis

# Check logs
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log
```

---

_Keep this reference handy during deployments. Most issues can be resolved within 5-10 minutes using these quick fixes._
