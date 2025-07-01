# Error Resolution Guide

## 🚨 Errors Fixed and Solutions

### ✅ **FIXED: Prisma Query Error**

**Error Message:**

```
Invalid `prisma.order.findFirst()` invocation:
Unknown arg `changedAt` in statusHistory.orderBy.changedAt for type OrderStatusHistoryOrderByInput. Available args: id, orderId, status, changedBy, notes, createdAt
```

**Problem:** The code was trying to order by `changedAt` field, but the correct field name is `createdAt`.

**Solution:** Fixed in `src/services/orderService.js` line 205:

```javascript
// ❌ Wrong:
statusHistory: {
  orderBy: {
    changedAt: "desc";
  }
}

// ✅ Correct:
statusHistory: {
  orderBy: {
    createdAt: "desc";
  }
}
```

---

### 🔧 **TO CONFIGURE: M-Pesa Payment Integration**

**Error Message:**

```
M-Pesa configuration is incomplete. Please check your environment variables.
```

**Problem:** Missing M-Pesa environment variables required for payment processing.

**Solution Steps:**

#### 1. Environment Variables Setup ✅

- Created `.env` file with proper M-Pesa configuration
- Set up sandbox environment for testing

#### 2. Get Real M-Pesa Credentials (Required for Production)

To get real M-Pesa credentials, you need to:

1. **Register on Safaricom Developer Portal:**

   - Go to: https://developer.safaricom.co.ke
   - Create an account
   - Create a new app

2. **Get Your Credentials:**

   - Consumer Key
   - Consumer Secret
   - Business Shortcode (for production)

3. **Update `.env` file:**
   ```bash
   MPESA_CONSUMER_KEY="your-actual-consumer-key"
   MPESA_CONSUMER_SECRET="your-actual-consumer-secret"
   ```

#### 3. Current Configuration Status

**✅ Configured for Development:**

```bash
# Current .env settings
MPESA_ENVIRONMENT="sandbox"
MPESA_BUSINESS_SHORTCODE="174379"  # Safaricom test shortcode
MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
MPESA_CALLBACK_URL="http://localhost:5000/api/v1/payments/mpesa/callback"
```

**⚠️ Still Need to Add:**

- `MPESA_CONSUMER_KEY`: Get from Safaricom Developer Portal
- `MPESA_CONSUMER_SECRET`: Get from Safaricom Developer Portal

---

## 🧪 Testing the Fixes

### 1. **Test Prisma Fix:**

```bash
# Start the server
npm start

# Test order creation (should work now)
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Nairobi",
      "state": "Nairobi",
      "zipCode": "00100",
      "country": "Kenya"
    },
    "paymentMethod": "cash"
  }'
```

### 2. **Test M-Pesa (After Getting Credentials):**

```bash
# Test M-Pesa payment
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [{"productId": 1, "quantity": 1}],
    "shippingAddress": {...},
    "paymentMethod": "mpesa",
    "paymentDetails": {
      "phoneNumber": "254700000000"
    }
  }'
```

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Database

```bash
npx prisma migrate dev
npx prisma db seed
```

### Step 3: Configure Environment

1. Update `.env` with your M-Pesa credentials (from Safaricom Developer Portal)
2. Make sure your database is running

### Step 4: Start Server

```bash
npm start
```

### Step 5: Test APIs

- Orders: `POST /api/v1/orders`
- Payments: `POST /api/v1/payments/mpesa/initiate`
- Auth: `POST /api/v1/auth/login`

---

## 🔍 Common Issues & Solutions

### Issue: "Order not found" after creation

**Cause:** Prisma query error (now fixed)
**Solution:** ✅ Fixed `changedAt` → `createdAt`

### Issue: "M-Pesa configuration incomplete"

**Cause:** Missing environment variables
**Solution:** Get credentials from Safaricom Developer Portal

### Issue: "Invalid phone number format"

**Cause:** Phone number not in correct format
**Solution:** Use format `254XXXXXXXXX` (Kenya format)

### Issue: "Callback URL not accessible"

**Cause:** Local development server not accessible from internet
**Solution:** Use ngrok or deploy to accessible server for testing

---

## 📋 Production Checklist

- [ ] Get real M-Pesa credentials from Safaricom
- [ ] Set up proper callback URL (accessible from internet)
- [ ] Configure production database
- [ ] Set up proper JWT secrets
- [ ] Enable HTTPS
- [ ] Set up logging and monitoring
- [ ] Test payment flows thoroughly

---

## 📞 Support

If you encounter any other errors:

1. Check the server logs in `logs/error.log`
2. Verify all environment variables are set
3. Ensure database is running and accessible
4. Check API documentation in `docs/` folder

**Status:**

- ✅ Prisma Error: FIXED
- ⚠️ M-Pesa Config: NEEDS CREDENTIALS
- 🚀 Server: READY TO START
