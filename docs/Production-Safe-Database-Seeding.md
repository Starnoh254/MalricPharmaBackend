# Production-Safe Database Seeding Guide

## Overview

The MalricPharma seed script is now environment-aware and production-safe. It automatically detects the environment and adjusts its behavior to prevent data loss in production.

## How Environment Detection Works

### 1. Environment Variables

The script checks these environment variables:

- `NODE_ENV`: Determines the current environment
- `FORCE_RESET`: Override safety checks (use with extreme caution)

### 2. Detection Logic

```javascript
const NODE_ENV = process.env.NODE_ENV || "development";
const FORCE_RESET = process.env.FORCE_RESET === "true";
let FULL_RESET = NODE_ENV === "development" || FORCE_RESET;
```

## Behavior by Environment

### 🛠️ Development Mode (`NODE_ENV=development`)

**Default behavior: FULL RESET**

- ✅ Deletes ALL data (users, orders, products, etc.)
- ✅ Inserts fresh seed data
- ✅ Perfect for development and testing

**Output:**

```
🌍 Environment: development
🔄 Reset Strategy: FULL RESET
🧹 Performing complete database reset...
```

### 🏭 Production Mode (`NODE_ENV=production`)

**Default behavior: SAFE MODE**

- ⛔ **Never deletes user data or orders**
- ✅ Preserves existing order history
- ✅ Only adds new products if they don't already exist
- ✅ Safe for production deployments

**Output:**

```
🌍 Environment: production
🔄 Reset Strategy: SAFE MODE (preserve existing data)
⚠️  PRODUCTION MODE: Full reset disabled for data safety
```

## Production Safety Features

### 1. **Order Protection**

```javascript
// Check if products are referenced by existing orders
const productsInOrders = await prisma.orderItem.findMany({
  select: { productId: true },
  distinct: ["productId"],
});

if (productsInOrders.length > 0) {
  // Skip deleting products - they're referenced by orders
  console.log("Will add new products alongside existing ones");
}
```

### 2. **Duplicate Prevention**

```javascript
// Check if product already exists by name
const existingProduct = await prisma.product.findFirst({
    where: { name: product.name }
});

if (existingProduct) {
    console.log(`Skipping existing product: ${product.name}`);
    continue;
}
```

### 3. **Safe Product Updates**

When no orders reference products, it's safe to replace them:

```javascript
if (existingProductsCount > 0 && productsInOrders.length === 0) {
  await prisma.product.deleteMany({});
  console.log("Safe to replace products (no orders affected)");
}
```

## Usage Examples

### Development (Full Reset)

```bash
# PowerShell
$env:NODE_ENV="development"; node prisma/seed.js

# Linux/Mac
NODE_ENV=development node prisma/seed.js

# Default (no env variable)
node prisma/seed.js
```

### Production (Safe Mode)

```bash
# PowerShell
$env:NODE_ENV="production"; node prisma/seed.js

# Linux/Mac
NODE_ENV=production node prisma/seed.js
```

### Force Reset in Production (DANGEROUS!)

```bash
# PowerShell
$env:NODE_ENV="production"; $env:FORCE_RESET="true"; node prisma/seed.js

# Linux/Mac
NODE_ENV=production FORCE_RESET=true node prisma/seed.js
```

## Real-World Scenarios

### Scenario 1: Fresh Development Setup

**Environment:** `development`
**Result:** Complete database reset with fresh data

```
✅ Successfully seeded 53 pharmacy products!
🛠️  DEVELOPMENT MODE - Full reset performed
```

### Scenario 2: Production Deployment (No Existing Orders)

**Environment:** `production`
**Existing Data:** Products only, no orders
**Result:** Products replaced safely

```
📦 Found 53 existing products with no order references
🔄 Safe to replace products (no orders will be affected)
✅ Successfully seeded 53 pharmacy products!
```

### Scenario 3: Production Update (With Existing Orders)

**Environment:** `production`
**Existing Data:** Products + Orders referencing products
**Result:** No data deleted, duplicates skipped

```
⚠️  Found 1 products referenced in existing orders
📝 Will add new products alongside existing ones (no deletions)
✅ Inserted 0 new products, skipped 53 existing products
```

### Scenario 4: Adding New Products to Production

**Environment:** `production`
**New Products:** Add 5 new products to existing 53
**Result:** Only new products added

```
✅ Inserted 5 new products, skipped 53 existing products
```

## Deployment Integration

### 1. Environment Setup

Set environment variables in your deployment:

**Development:**

```bash
NODE_ENV=development
```

**Production:**

```bash
NODE_ENV=production
DATABASE_URL=mysql://user:pass@prod-db:3306/malric_pharma
```

### 2. CI/CD Pipeline

Add to your deployment script:

```bash
# Production deployment
export NODE_ENV=production
npm run build
npm run db:seed  # Safely seeds production data
npm run start
```

### 3. Package.json Scripts

```json
{
  "scripts": {
    "db:seed": "node prisma/seed.js",
    "db:seed:dev": "NODE_ENV=development node prisma/seed.js",
    "db:seed:prod": "NODE_ENV=production node prisma/seed.js",
    "db:fresh": "NODE_ENV=development node prisma/seed.js"
  }
}
```

## Safety Checks Summary

| Check                         | Development | Production |
| ----------------------------- | ----------- | ---------- |
| Delete Users                  | ✅ Yes      | ❌ No      |
| Delete Orders                 | ✅ Yes      | ❌ No      |
| Delete Products (with orders) | ✅ Yes      | ❌ No      |
| Delete Products (no orders)   | ✅ Yes      | ✅ Yes     |
| Add New Products              | ✅ Yes      | ✅ Yes     |
| Skip Duplicates               | ❌ No       | ✅ Yes     |

## Emergency Procedures

### Force Reset Production (LAST RESORT)

```bash
# DANGER: This will delete ALL data in production
export NODE_ENV=production
export FORCE_RESET=true
node prisma/seed.js
```

### Restore from Backup

```bash
# Stop application
pm2 stop malricpharma-backend

# Restore database from backup
mysql -u user -p malric_pharma < backup.sql

# Restart application
pm2 restart malricpharma-backend
```

## Best Practices

### ✅ Do

- Always set `NODE_ENV=production` in production
- Test seeding in staging environment first
- Monitor logs during production seeding
- Keep database backups before any seeding
- Use safe mode for production updates

### ❌ Don't

- Set `FORCE_RESET=true` in production
- Run development seed scripts in production
- Skip testing seed scripts in staging
- Ignore seeding warnings in production
- Delete production data without backups

## Troubleshooting

### Issue: Products not being added in production

**Cause:** Products already exist with same names
**Solution:** Check logs for "Skipping existing product" messages

### Issue: Seed script deletes data in production

**Cause:** `NODE_ENV` not set to "production"
**Solution:** Verify environment variables

### Issue: Force reset not working

**Cause:** `FORCE_RESET` not set to exact string "true"
**Solution:** Use `FORCE_RESET="true"` (with quotes)

---

This production-safe seeding system ensures your valuable customer data and order history remain protected while still allowing safe product catalog updates.
