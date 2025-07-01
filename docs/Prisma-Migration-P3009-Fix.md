# 🗄️ Prisma Migration P3009 Error - Fix Guide

## 🚨 **Error Summary**

**Error Code**: P3009  
**Problem**: Failed migration blocking new migrations  
**Message**: "migrate found failed migrations in the target database, new migrations will not be applied"

---

## 🔍 **What Happened**

The migration `20250626223539_initial` started but **failed to complete**, leaving the database in an inconsistent state. This typically happens when:

1. **Connection interrupted** during migration
2. **Node.js version incompatibility** (like we just fixed)
3. **Database constraints violated**
4. **Insufficient permissions**
5. **Schema conflicts**

---

## ✅ **Immediate Fix**

### **Step 1: SSH into your server**

```bash
ssh developer@your-server
cd /var/www/malricpharma/MalricPharmaBackend
```

### **Step 2: Check migration status**

```bash
npx prisma migrate status
```

### **Step 3: Resolve the failed migration**

```bash
# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back 20250626223539_initial

# Apply migrations again
npx prisma migrate deploy
```

### **Step 4: Verify success**

```bash
npx prisma migrate status
# Should show all migrations as "Applied"
```

---

## 🛠️ **Alternative Solutions**

### **Option A: If the above doesn't work**

```bash
# Check what's in the failed migration
cat prisma/migrations/20250626223539_initial/migration.sql

# Apply it manually to database
mysql -u malricuser -p malric_pharma < prisma/migrations/20250626223539_initial/migration.sql

# Then mark as applied
npx prisma migrate resolve --applied 20250626223539_initial
```

### **Option B: Reset and reapply (⚠️ DANGEROUS - DEVELOPMENT ONLY)**

```bash
# ⚠️ This will DELETE ALL DATA ⚠️
npx prisma migrate reset --force
npx prisma db seed  # If you have seed data
```

### **Option C: Manual database fix**

```bash
# Connect to database
mysql -u malricuser -p malric_pharma

# Check _prisma_migrations table
SELECT * FROM _prisma_migrations WHERE migration_name = '20250626223539_initial';

# Update migration status manually
UPDATE _prisma_migrations
SET finished_at = NOW(),
    applied_steps_count = (SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name = '20250626223539_initial')
WHERE migration_name = '20250626223539_initial';
```

---

## 🔧 **Update Deployment Script**

Let me update your deployment script to handle migration failures gracefully:

### **Add this to your deploy.yml after the Node.js check:**

```bash
# Run database migrations with error handling
echo "🗄️ Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed, checking for failed migrations..."

    # Check migration status
    npx prisma migrate status

    # Try to resolve common P3009 error
    echo "🔧 Attempting to resolve failed migrations..."
    npx prisma migrate resolve --rolled-back 20250626223539_initial || echo "No failed migration to resolve"

    # Retry migration
    if npx prisma migrate deploy; then
        echo "✅ Migrations completed after resolution"
    else
        echo "❌ Migration still failing, manual intervention required"
        exit 1
    fi
fi
```

---

## 📋 **Prevention for Future**

### **1. Always backup before migrations**

```bash
# Create database backup
mysqldump -u malricuser -p malric_pharma > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **2. Test migrations in development first**

```bash
# In development environment
npx prisma migrate dev --name test_migration
# Only deploy to production after testing
```

### **3. Monitor migration status**

```bash
# Add to your deployment script
npx prisma migrate status
```

---

## 🚨 **If Migrations Keep Failing**

### **Check these common issues:**

1. **Database connection**:

   ```bash
   mysql -u malricuser -p malric_pharma
   SELECT 1;  # Should return 1
   ```

2. **Schema conflicts**:

   ```bash
   npx prisma db pull  # Check if schema matches database
   ```

3. **Permissions**:

   ```bash
   # Check user permissions
   SHOW GRANTS FOR 'malricuser'@'localhost';
   ```

4. **Database locks**:
   ```bash
   # Check for locks
   SHOW PROCESSLIST;
   ```

---

## 🎯 **Quick Fix Commands**

```bash
# One-liner fix for P3009
npx prisma migrate resolve --rolled-back 20250626223539_initial && npx prisma migrate deploy

# Check if fixed
npx prisma migrate status

# Restart app
pm2 restart malricpharma-backend
```

---

## 📞 **When to Use Each Option**

- **Option 1 (resolve --rolled-back)**: First try, safest option
- **Option 2 (manual SQL)**: If you understand the migration SQL
- **Option 3 (reset)**: Only in development, never in production
- **Option 4 (manual database)**: Last resort, requires database knowledge

---

**⚠️ Important**: Always backup your database before attempting migration fixes in production!

**✅ Success indicator**: `npx prisma migrate status` shows all migrations as "Applied"
