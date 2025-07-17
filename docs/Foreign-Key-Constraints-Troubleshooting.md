# Database Seeding and Foreign Key Constraints - Troubleshooting Guide

## Error: P2003 Foreign Key Constraint Violation

### Problem Description

When trying to delete records from a table, you encounter this error:

```
PrismaClientKnownRequestError: Foreign key constraint violated on the fields: (`productId`)
Code: P2003
```

### Understanding the Error

**What it means:**

- You're trying to delete records that are referenced by other tables
- The database enforces **referential integrity** through foreign key constraints
- Cannot delete a "parent" record if "child" records still reference it

**In our pharmacy example:**

- `Product` table is the "parent"
- `OrderItem` table is the "child" (has `productId` foreign key)
- Cannot delete products while order items still reference them

### Database Relationship Hierarchy

Understanding your database relationships is crucial for safe deletion:

```
Users
├── Orders (userId foreign key)
│   ├── OrderItems (orderId foreign key, productId foreign key)
│   ├── OrderStatusHistory (orderId foreign key)
│   └── Payments (orderId foreign key)
├── RefreshTokens (userId foreign key)

Products
└── OrderItems (productId foreign key)
```

### Safe Deletion Order

Always delete in **reverse dependency order**:

1. **Leaf tables first** (no other tables depend on them)
2. **Parent tables last** (other tables depend on them)

**Correct order for our schema:**

```javascript
// 1. Tables with no dependencies
await prisma.payment.deleteMany({});
await prisma.orderStatusHistory.deleteMany({});

// 2. Tables that reference multiple parents
await prisma.orderItem.deleteMany({}); // References both orders and products

// 3. Middle-level tables
await prisma.order.deleteMany({}); // References users
await prisma.refreshToken.deleteMany({}); // References users

// 4. Tables referenced by others
await prisma.product.deleteMany({}); // Referenced by orderItems
await prisma.user.deleteMany({}); // Referenced by orders and tokens
```

### Production-Safe Strategies

#### Strategy 1: Complete Reset (Development)

```javascript
const FULL_RESET = true;
if (FULL_RESET) {
  // Delete everything in correct order
  await prisma.payment.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
}
```

#### Strategy 2: Preserve Orders (Production)

```javascript
const FULL_RESET = false;
if (!FULL_RESET) {
  // Check for existing references
  const productsInOrders = await prisma.orderItem.findMany({
    select: { productId: true },
    distinct: ["productId"],
  });

  if (productsInOrders.length > 0) {
    console.log("Products referenced in orders - skipping deletion");
    // Only add new products, don't remove existing ones
  } else {
    // Safe to delete products
    await prisma.product.deleteMany({});
  }
}
```

### Common Foreign Key Errors

#### Error P2003 - Constraint Violation

**Cause:** Trying to delete referenced records
**Solution:** Delete in correct order

#### Error P2002 - Unique Constraint

**Cause:** Trying to insert duplicate unique values
**Solution:** Check for existing records or use upsert

#### Error P2025 - Record Not Found

**Cause:** Trying to update/delete non-existent record
**Solution:** Check if record exists first

### Debugging Foreign Key Issues

#### 1. Find Referencing Tables

```sql
-- MySQL
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'Product';
```

#### 2. Check Prisma Schema

```javascript
// Look for models with foreign keys
// Example: OrderItem has productId referencing Product
model OrderItem {
    productId Int
    product   Product @relation(fields: [productId], references: [id])
}
```

#### 3. Count References

```javascript
// Check how many records reference a table
const orderItemsCount = await prisma.orderItem.count({
  where: { productId: specificProductId },
});
```

### Best Practices

#### 1. Use Cascade Deletes in Schema

```prisma
model OrderItem {
    order   Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
    product Product @relation(fields: [productId], references: [id])
}
```

#### 2. Implement Soft Deletes for Important Data

```prisma
model Product {
    id        Int      @id @default(autoincrement())
    name      String
    deletedAt DateTime? // Soft delete timestamp
}
```

#### 3. Use Transactions for Complex Operations

```javascript
await prisma.$transaction(async (tx) => {
  await tx.orderItem.deleteMany({});
  await tx.product.deleteMany({});
});
```

#### 4. Create Seeding Scripts with Options

```javascript
const seedConfig = {
  clearExisting: true, // Clear all data
  preserveOrders: false, // Keep existing orders
  addSampleData: true, // Add demo data
};
```

### Recovery Strategies

#### If Deletion Fails

1. **Check dependencies:** Find what's referencing your records
2. **Delete children first:** Remove referencing records
3. **Use CASCADE:** Update schema with cascade options
4. **Disable constraints temporarily:** (Not recommended for production)

#### If You Need to Force Delete

```sql
-- MySQL (use with extreme caution)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM products;
SET FOREIGN_KEY_CHECKS = 1;
```

### Tools for Analysis

#### Prisma Studio

```bash
npx prisma studio
```

Visual interface to explore relationships

#### Database CLI

```bash
# MySQL
mysql -u user -p database_name

# PostgreSQL
psql -U user -d database_name
```

#### Schema Visualization

```bash
npx prisma generate
# Creates visual ER diagrams
```

### Automated Solutions

#### Create a Database Reset Script

```javascript
// scripts/reset-database.js
async function resetDatabase(preserveUsers = false) {
  if (preserveUsers) {
    // Preserve user data, reset everything else
  } else {
    // Complete reset
  }
}
```

#### Add npm Scripts

```json
{
  "scripts": {
    "db:reset": "npx prisma migrate reset --force",
    "db:seed": "node prisma/seed.js",
    "db:fresh": "npm run db:reset && npm run db:seed"
  }
}
```

---

**Remember:** Foreign key constraints exist to protect data integrity. Always respect them by understanding your database relationships and planning operations accordingly.
