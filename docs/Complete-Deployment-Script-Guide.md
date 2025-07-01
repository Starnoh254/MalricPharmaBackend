# Complete Deployment Script Guide

## Overview

This guide documents the comprehensive GitHub Actions deployment script for the MalricPharma Backend, including all errors encountered during development and their solutions. Use this as a reference for creating similar deployment scripts.

## Script Architecture

The deployment script (`deploy.yml`) is structured in logical phases:

1. **Environment Setup** - Checkout code and prepare SSH connection
2. **Pre-deployment** - Backup, version checks, navigation
3. **Code Update** - Git operations and dependency management
4. **Database Operations** - Prisma migrations and client generation
5. **Application Management** - PM2 process handling
6. **Health Checks** - Verification and testing
7. **Cleanup** - Backup management and final status

## Detailed Script Breakdown

### 1. Environment Setup & SSH Connection

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
```

**Required Secrets:**

- `VPS_HOST` - Your server IP or domain
- `VPS_USER` - SSH username (usually root or ubuntu)
- `VPS_SSH_KEY` - Private SSH key content

### 2. Error Handling & Script Safety

```bash
set -e  # Exit on any error
```

**Purpose:** Ensures the script stops immediately if any command fails, preventing partial deployments.

### 3. Navigation & Directory Management

```bash
cd /var/www/malricpharma/MalricPharmaBackend || { echo "❌ Failed to navigate to app directory"; exit 1; }
```

**Error Solved:** Directory not found errors
**Solution:** Use `||` operator with explicit error handling and exit codes

### 4. Backup Strategy

```bash
BACKUP_DIR="$HOME/backups/malricpharma"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz . || echo "⚠️ Backup creation failed"
```

**Errors Solved:**

- Permission denied in `/var/backups`
- **Solution:** Use `$HOME/backups` instead of system directories

### 5. Node.js Version Management

```bash
# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use nvm default if available
if command -v nvm &> /dev/null; then
    nvm use default || echo "⚠️ nvm default not set, using current version"
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Current Node.js version is incompatible"
    exit 1
fi
```

**Major Error Solved:** Node.js version mismatch between interactive and non-interactive shells
**Root Cause:** CI/CD environments don't automatically load nvm
**Solution:**

- Explicitly load nvm in the script
- Check and validate Node.js version
- Provide clear error messages for version issues

### 6. Dependency Management

```bash
# Clean previous dependencies
rm -rf node_modules package-lock.json

# Install with error handling
if npm install --production --silent; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Dependency installation failed"
    echo "📋 Checking npm debug log..."
    tail -20 ~/.npm/_logs/*.log 2>/dev/null || echo "No npm logs found"
    echo "🔄 Retrying with verbose output for debugging..."
    npm install --production --verbose
    exit 1
fi
```

**Errors Solved:**

- Package conflicts from previous installations
- Silent npm failures
  **Solutions:**
- Clean install approach (remove node_modules and package-lock.json)
- Silent install first, verbose on failure for debugging
- Proper error handling with log checking

### 7. Prisma Migration Handling

```bash
if npx prisma migrate deploy; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed, checking for failed migrations..."
    npx prisma migrate status

    # Try to resolve P3009 error
    echo "🔧 Attempting to resolve failed migrations..."
    npx prisma migrate resolve --rolled-back 20250626223539_initial 2>/dev/null || echo "No specific failed migration to resolve"

    # Retry migration
    echo "🔄 Retrying migrations..."
    if npx prisma migrate deploy; then
        echo "✅ Migrations completed after resolution"
    else
        echo "❌ Migration still failing, manual intervention required"
        npx prisma migrate status || echo "Could not get migration status"
        exit 1
    fi
fi
```

**Major Error Solved:** Prisma P3009 error (migration marked as failed)
**Root Cause:** Previous migration attempts left database in inconsistent state
**Solution:**

- Automatic detection of failed migrations
- Use `prisma migrate resolve --rolled-back` for specific migrations
- Retry mechanism with status checking

### 8. PM2 Process Management

```bash
# Check if PM2 app exists
if ! pm2 describe malricpharma-backend > /dev/null 2>&1; then
    echo "🆕 Creating new PM2 application..."
    pm2 start ecosystem.config.js --env production
else
    echo "🔄 Restarting existing PM2 application..."
    pm2 restart malricpharma-backend
fi

pm2 save
```

**Concept:** Idempotent deployment - works whether app exists or not

### 9. Health Checks & Verification

```bash
# Wait for startup
sleep 10

# Health check with debugging
echo "🏥 Performing health check..."
echo "📊 Current PM2 status:"
pm2 list

# Flexible process matching
if pm2 list | grep -E "(online|running)" | grep -i "malric"; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application failed to start!"
    echo "📋 Last 20 log lines:"
    pm2 logs --lines 20
    echo "📊 Detailed PM2 status:"
    pm2 show malricpharma-backend || pm2 show malricph || echo "Could not find process details"
    exit 1
fi
```

**Improvements Made:**

- Flexible process name matching (handles truncated names)
- Multiple status checks (online/running)
- Comprehensive debugging output on failure
- Fallback process identification

### 10. API Endpoint Testing

```bash
# Test API endpoint
if curl -f -s https://api.malricpharma.co.ke/api/v1/health > /dev/null; then
    echo "✅ API endpoint is responding!"
else
    echo "⚠️ API endpoint test failed (might be normal if health endpoint doesn't exist)"
fi
```

**Note:** Non-failing test - warns but doesn't stop deployment

## Common Errors & Solutions

### Error 1: Permission Denied on Backup Creation

**Error:** `mkdir: cannot create directory '/var/backups': Permission denied`
**Solution:** Use `$HOME/backups` instead of system directories

### Error 2: Node.js Version Mismatch

**Error:** Different Node.js versions between interactive and CI/CD shells
**Solution:** Explicitly load nvm and validate Node.js version in script

### Error 3: npm Install Failures

**Error:** Silent npm failures, package conflicts
**Solution:**

- Clean install approach
- Silent first, verbose on retry
- Check npm logs for debugging

### Error 4: Prisma P3009 Migration Error

**Error:** `Migration 20250626223539_initial failed to apply cleanly to the shadow database`
**Solution:**

- Use `prisma migrate resolve --rolled-back` for specific migrations
- Implement retry mechanism
- Status checking before and after

### Error 5: PM2 Health Check False Negatives

**Error:** Health check failing for running processes due to name truncation
**Solution:**

- Flexible regex matching
- Multiple status checks
- Comprehensive debugging output

### Error 6: SSH Connection Issues

**Error:** Authentication failures, connection timeouts
**Solution:**

- Verify SSH key format (no passphrase)
- Check VPS firewall settings
- Validate secret values

## Script Features

### ✅ Robust Error Handling

- Exit on any error (`set -e`)
- Comprehensive error messages
- Retry mechanisms for critical operations

### ✅ Environment Validation

- Node.js version checking
- nvm loading and validation
- Dependency compatibility verification

### ✅ Safe Deployment Practices

- Automatic backups before deployment
- Health checks before marking success
- Rollback capability (manual)

### ✅ Comprehensive Logging

- Timestamped deployment events
- Detailed error debugging
- Process status monitoring

### ✅ Production Readiness

- Production-only dependencies
- PM2 process management
- API endpoint verification

## Creating Similar Scripts

### 1. Base Template Structure

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            set -e
            # Your deployment script here
```

### 2. Essential Components

- Error handling with `set -e`
- Directory navigation with error checking
- Backup creation
- Environment validation
- Dependency management
- Application restart
- Health verification

### 3. Customization Points

- Application directory path
- PM2 app name
- Backup location
- Health check endpoints
- Migration commands (if using database)

### 4. Security Considerations

- Use SSH keys, not passwords
- Validate input parameters
- Limit script permissions
- Log security events

## Maintenance

### Regular Tasks

1. **Update Node.js version requirements** as needed
2. **Review and test backup restoration** procedures
3. **Monitor deployment logs** for new error patterns
4. **Update migration handling** for new Prisma versions

### Monitoring

- Set up alerts for deployment failures
- Monitor application health post-deployment
- Track deployment duration and success rates
- Review backup sizes and cleanup policies

## Related Documentation

- [Node Version Mismatch CI/CD Fix](./Node-Version-Mismatch-CI-CD-Fix.md)
- [Prisma Migration P3009 Fix](./Prisma-Migration-P3009-Fix.md)
- [Deployment Troubleshooting Guide](./Deployment-Troubleshooting-Guide.md)
- [Production VPS Setup Guide](./Production-VPS-Setup-Guide.md)

---

_This documentation reflects the complete evolution of our deployment script through multiple iterations and error resolutions. Use it as a reference for creating robust, production-ready deployment automation._
