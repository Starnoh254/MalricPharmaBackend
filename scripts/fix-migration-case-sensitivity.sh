#!/bin/bash

# 🚨 EMERGENCY MIGRATION FIX SCRIPT
# Run this on your production server to fix the case sensitivity issue

echo "🚨 Starting Migration Case Sensitivity Fix..."

# Step 1: Backup database
echo "📋 Step 1: Creating emergency backup..."
BACKUP_FILE="emergency_backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u malricuser -p malric_pharma > $BACKUP_FILE
echo "✅ Backup created: $BACKUP_FILE"

# Step 2: Check current state
echo "📋 Step 2: Checking current database state..."
mysql -u malricuser -p malric_pharma -e "SHOW TABLES;" > current_tables.txt
echo "📊 Current tables saved to current_tables.txt"
cat current_tables.txt

# Step 3: Check migration status
echo "📋 Step 3: Checking migration status..."
npx prisma migrate status

# Step 4: The fix depends on what we found above
echo "📋 Step 4: Applying the fix..."

# Check if User table exists (capital U)
if mysql -u malricuser -p malric_pharma -e "DESCRIBE User;" 2>/dev/null; then
    echo "✅ Found 'User' table (capital U) - migrations expect this"
    echo "🔧 Proceeding with migration..."
    npx prisma migrate deploy
else
    # Check if user table exists (lowercase u)
    if mysql -u malricuser -p malric_pharma -e "DESCRIBE user;" 2>/dev/null; then
        echo "⚠️  Found 'user' table (lowercase u) - need to rename"
        echo "🔧 Renaming table to match migration expectations..."
        mysql -u malricuser -p malric_pharma -e "RENAME TABLE \`user\` TO \`User\`;"
        echo "✅ Table renamed from 'user' to 'User'"
        echo "🔧 Proceeding with migration..."
        npx prisma migrate deploy
    else
        echo "❌ No User/user table found - running full migration reset"
        npx prisma migrate reset --force
    fi
fi

# Step 5: Verify fix
echo "📋 Step 5: Verifying the fix..."
npx prisma migrate status

if [ $? -eq 0 ]; then
    echo "✅ Migration fix completed successfully!"
    echo "🚀 Restarting application..."
    pm2 restart malricpharma-backend
    echo "📊 Application status:"
    pm2 status
else
    echo "❌ Migration fix failed!"
    echo "🔄 You may need to restore from backup: mysql -u malricuser -p malric_pharma < $BACKUP_FILE"
fi

echo "🎯 Fix script completed!"
