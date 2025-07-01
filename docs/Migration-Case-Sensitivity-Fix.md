# 🚨 MySQL Case Sensitivity Migration Fix Guide

## PROBLEM IDENTIFIED ✅

Your migration files have inconsistent table name casing:

- **Migration 1**: Creates `User` table (uppercase U)
- **Migration 2**: Tries to alter `user` table (lowercase u)

This causes errors on Linux MySQL which is case-sensitive.

---

## 🔧 SOLUTION 1: FIX AND RESET MIGRATIONS (RECOMMENDED)

### Step 1: Backup Your Data (IMPORTANT!)

```bash
# On your production server, backup the database first
mysqldump -u malricuser -p malric_pharma > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Check Current State

```bash
# Check what tables exist in production
mysql -u malricuser -p malric_pharma -e "SHOW TABLES;"

# Check migration status
npx prisma migrate status
```

### Step 3: Reset Migration State

```bash
# Reset Prisma migration state (this doesn't delete data)
npx prisma migrate reset --force

# This will:
# 1. Drop all tables
# 2. Recreate from schema.prisma
# 3. Run all migrations in correct order
# 4. Run seed script if available
```

---

## 🔧 SOLUTION 2: MANUAL FIX (If Reset Doesn't Work)

### Step 1: Fix the Migration File Manually

Edit the problematic migration file to use consistent casing:

```sql
-- Original (WRONG):
ALTER TABLE `user` ADD COLUMN `is_admin` BOOLEAN NOT NULL;

-- Fixed (CORRECT):
ALTER TABLE `User` ADD COLUMN `is_admin` BOOLEAN NOT NULL;
```

### Step 2: Mark Failed Migration as Applied

```bash
# Mark the failed migration as resolved
npx prisma migrate resolve --applied 20250626223539_initial
```

### Step 3: Continue with Remaining Migrations

```bash
npx prisma migrate deploy
```

---

## 🔧 SOLUTION 3: PRODUCTION-SAFE APPROACH

### Step 1: Check What Tables Actually Exist

```bash
mysql -u malricuser -p malric_pharma

# In MySQL console:
SHOW TABLES;
DESCRIBE User;  -- Check if this exists
DESCRIBE user;  -- Check if this exists
EXIT;
```

### Step 2: Manually Rename Table (If Needed)

```bash
mysql -u malricuser -p malric_pharma

# If table is named 'User' but migration expects 'user':
RENAME TABLE `User` TO `user`;

# Or if table is named 'user' but should be 'User':
RENAME TABLE `user` TO `User`;

EXIT;
```

### Step 3: Retry Migration

```bash
npx prisma migrate deploy
```

---

## 🎯 RECOMMENDED ACTION PLAN

### FOR YOUR PRODUCTION SERVER:

#### Step 1: Immediate Backup

```bash
cd /var/www/malricpharma/MalricPharmaBackend
mysqldump -u malricuser -p malric_pharma > emergency_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Step 2: Check Current State

```bash
mysql -u malricuser -p malric_pharma -e "SHOW TABLES;"
npx prisma migrate status
```

#### Step 3: Choose Fix Method

Based on what you see:

**If no important data exists yet:**

```bash
npx prisma migrate reset --force
```

**If you have important data:**

```bash
# Check table name
mysql -u malricuser -p malric_pharma -e "SHOW TABLES;"

# If table exists as 'User', rename it
mysql -u malricuser -p malric_pharma -e "RENAME TABLE \`User\` TO \`user\`;"

# Then continue migration
npx prisma migrate deploy
```

---

## 🛡️ PREVENT FUTURE ISSUES

### 1. Update Prisma Schema for Consistency

Edit your `schema.prisma` to ensure consistent naming:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  isAdmin   Boolean  @map("is_admin")
  createdAt DateTime @default(now())

  @@map("user") // Force lowercase table name
}
```

### 2. Configure MySQL for Case Insensitivity (Optional)

Add to `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
lower_case_table_names=1
```

**Note:** This requires MySQL restart and should be done before creating tables.

### 3. Generate New Migration for Consistency

```bash
# After fixing schema.prisma
npx prisma migrate dev --name fix_table_casing
```

---

## 🧪 TESTING YOUR FIX

### Test Migration Success:

```bash
# Check migration status
npx prisma migrate status

# Test database connection
npx prisma db seed

# Test your application
pm2 restart malricpharma-backend
pm2 logs
```

### Test API Endpoints:

```bash
# Test user registration/login
curl -X POST https://api.malricpharma.co.ke/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'
```

---

## 📞 EMERGENCY CONTACTS

If something goes wrong:

1. **Restore from backup**: `mysql -u malricuser -p malric_pharma < backup_file.sql`
2. **Check application logs**: `pm2 logs malricpharma-backend`
3. **Restart services**: `pm2 restart all && systemctl restart nginx`

---

## 🎯 IMMEDIATE ACTION

**Right now, run this on your production server:**

```bash
# 1. Backup first!
mysqldump -u malricuser -p malric_pharma > emergency_backup.sql

# 2. Check what tables exist
mysql -u malricuser -p malric_pharma -e "SHOW TABLES;"

# 3. Share the output so we can determine the exact fix needed
```

**Send me the output of step 2, and I'll give you the exact commands to fix it!** 🔧
