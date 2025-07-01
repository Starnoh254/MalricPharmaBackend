# M-Pesa Integration Setup Guide

This guide explains how to set up M-Pesa payment processing for MalricPharma Backend.

## 📋 Prerequisites

1. **Safaricom Developer Account**: Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. **M-Pesa Business Account**: You need a registered M-Pesa business account
3. **Public Domain**: For callbacks (use ngrok for local development)

## 🔧 M-Pesa Setup Steps

### Step 1: Register on Safaricom Developer Portal

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account or log in
3. Navigate to "My Apps"
4. Click "Create New App"

### Step 2: Create M-Pesa App

1. **App Name**: `MalricPharma Payment`
2. **Description**: `Payment processing for MalricPharma e-commerce`
3. **APIs**: Select "Lipa Na M-Pesa Online"
4. **Environment**: Start with "Sandbox" for testing

### Step 3: Get API Credentials

After creating the app, you'll get:

- **Consumer Key**
- **Consumer Secret**

### Step 4: Get Test Credentials (Sandbox)

For sandbox testing, use these default values:

- **Business Short Code**: `174379`
- **Passkey**: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`

### Step 5: Set up Callback URL

For local development:

1. Install ngrok: `npm install -g ngrok`
2. Run ngrok: `ngrok http 5000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Your callback URL: `https://abc123.ngrok.io/api/v1/payments/mpesa/callback`

For production:

- Use your actual domain: `https://yourdomain.com/api/v1/payments/mpesa/callback`

## 🔐 Environment Configuration

Update your `.env` file:

```env
# M-Pesa Sandbox Configuration
MPESA_ENVIRONMENT="sandbox"
MPESA_CONSUMER_KEY="your-consumer-key-from-safaricom"
MPESA_CONSUMER_SECRET="your-consumer-secret-from-safaricom"
MPESA_BUSINESS_SHORTCODE="174379"
MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
MPESA_CALLBACK_URL="https://your-ngrok-url.ngrok.io/api/v1/payments/mpesa/callback"
```

## 🧪 Testing M-Pesa Integration

### Test Phone Numbers (Sandbox)

Use these test numbers for sandbox testing:

- `254708374149`
- `254711XXXXXX`
- `254701XXXXXX`

### Test Scenarios

1. **Successful Payment**:

   - Use test phone number
   - Amount: Any amount
   - Expected: Payment successful

2. **Failed Payment**:

   - Use invalid phone number
   - Expected: Payment failed

3. **Timeout**:
   - Use test number but don't respond to prompt
   - Expected: Payment timeout

## 🚀 Production Setup

### Step 1: Get Production Credentials

1. Contact Safaricom to get production credentials
2. Provide your business registration documents
3. Get your actual business short code

### Step 2: Update Environment

```env
MPESA_ENVIRONMENT="production"
MPESA_CONSUMER_KEY="your-production-consumer-key"
MPESA_CONSUMER_SECRET="your-production-consumer-secret"
MPESA_BUSINESS_SHORTCODE="your-actual-business-shortcode"
MPESA_PASSKEY="your-production-passkey"
MPESA_CALLBACK_URL="https://yourdomain.com/api/v1/payments/mpesa/callback"
```

## 📊 Payment Flow Explained

### 1. Customer Initiates Payment

```javascript
// Frontend sends order creation request
POST /api/v1/orders
{
  "items": [...],
  "shipping": {...},
  "payment": {
    "method": "mpesa",
    "phone": "+254712345678"
  }
}
```

### 2. Backend Processes Order

1. Validates order data
2. Creates order in database (status: PENDING)
3. Initiates M-Pesa STK Push
4. Returns order confirmation with payment instructions

### 3. M-Pesa STK Push

1. Customer receives payment prompt on phone
2. Customer enters M-Pesa PIN
3. M-Pesa processes payment

### 4. Payment Callback

1. M-Pesa sends callback to your server
2. Backend processes callback
3. Updates order status (CONFIRMED/CANCELLED)
4. Stores payment receipt

## 🔍 Monitoring and Debugging

### Check Payment Status

```http
GET /api/v1/payments/{paymentId}/status
Authorization: Bearer {token}
```

### Query M-Pesa Status

```http
GET /api/v1/payments/mpesa/{checkoutRequestId}/status
Authorization: Bearer {token}
```

### View Logs

```bash
# Check server logs
tail -f logs/combined.log

# Check error logs
tail -f logs/error.log
```

### Common Issues

1. **"Invalid Credentials"**

   - Check consumer key/secret
   - Verify environment (sandbox/production)

2. **"Callback not received"**

   - Check callback URL is accessible
   - Verify ngrok is running (for local dev)
   - Check firewall settings

3. **"Payment timeout"**
   - User didn't respond to STK push
   - Phone number might be offline
   - M-Pesa service might be down

## 📱 Test Commands

### Test STK Push (using curl)

```bash
# Create order with M-Pesa payment
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"productId": 1, "quantity": 1, "price": 10.00}],
    "shipping": {
      "fullName": "Test User",
      "address": "123 Test St",
      "city": "Nairobi",
      "postalCode": "00100",
      "phone": "+254700000000"
    },
    "payment": {
      "method": "mpesa",
      "phone": "+254708374149"
    }
  }'
```

### Test Callback (development)

```bash
curl -X POST http://localhost:5000/api/v1/payments/mpesa/test-callback \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutRequestId": "ws_CO_123456789",
    "resultCode": 0
  }'
```

## 🎯 Next Steps

1. **Test thoroughly** in sandbox environment
2. **Set up monitoring** for payment failures
3. **Implement retry logic** for failed payments
4. **Add email notifications** for payment status
5. **Create admin dashboard** for payment management
6. **Go live** with production credentials

## 📞 Support

- **Safaricom Developer Support**: [developer.safaricom.co.ke/support](https://developer.safaricom.co.ke/support)
- **M-Pesa API Documentation**: [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)

---

**Note**: Always test thoroughly in sandbox before going to production!
