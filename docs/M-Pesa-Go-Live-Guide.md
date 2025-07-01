# M-Pesa Go-Live Guide - Complete Documentation

## 🎯 OVERVIEW

This guide covers the complete process of taking your M-Pesa integration from sandbox testing to live production environment. Follow each step carefully to ensure a smooth transition.

---

## 📋 PRE-REQUISITES CHECKLIST

Before starting the go-live process, ensure you have:

- [ ] **Active Safaricom Daraja Account** with sandbox apps
- [ ] **Completed sandbox testing** with successful transactions
- [ ] **Valid business/organization** registered in Kenya
- [ ] **Business registration documents** ready
- [ ] **KRA PIN certificate** for your business
- [ ] **Bank account details** for settlement
- [ ] **Production server** with HTTPS enabled
- [ ] **Domain name** and SSL certificate
- [ ] **Callback URLs** accessible from the internet

---

## 🏢 STEP 1: BUSINESS VERIFICATION & DOCUMENTATION

### Required Business Documents:

1. **Certificate of Incorporation** (for companies)
2. **Business Registration Certificate** (for sole proprietorships)
3. **KRA PIN Certificate**
4. **Business Permit/License**
5. **ID Copy** of the business owner/authorized signatory
6. **Bank Account Details** for settlement

### Business Requirements:

- Must be a **registered business** in Kenya
- Must have a **valid KRA PIN**
- Must have a **business bank account**
- Business must be **operational** (not just for testing)

---

## 🌐 STEP 2: PREPARE PRODUCTION INFRASTRUCTURE

### 2.1 Production Server Setup

```bash
# Ensure your production server has:
✅ HTTPS enabled (SSL certificate)
✅ Domain name (not IP address)
✅ Stable internet connection
✅ Proper firewall configuration
✅ Server monitoring setup
```

### 2.2 Callback URL Requirements

Your callback URLs must be:

- **HTTPS only** (HTTP not allowed in production)
- **Publicly accessible** from the internet
- **Responsive** (return HTTP 200 status)
- **Properly configured** to handle M-Pesa callbacks

Example Production URLs:

```
✅ https://yourdomain.com/api/v1/payments/mpesa/callback
✅ https://api.yourcompany.com/webhooks/mpesa
❌ http://yourdomain.com/callback (HTTP not allowed)
❌ http://localhost:3000/callback (Not accessible)
```

### 2.3 Update Environment Configuration

```bash
# Production environment variables
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
```

---

## 🚀 STEP 3: SAFARICOM DARAJA GO-LIVE PROCESS

### 3.1 Login to Daraja Portal

1. Go to: https://developer.safaricom.co.ke
2. Login with your account credentials
3. Navigate to **"My Apps"** section

### 3.2 Create Production App

1. Click **"Create New App"**
2. Fill in the details:
   ```
   App Name: YourCompany Production
   Description: Production M-Pesa integration for [Your Business]
   ```
3. Select **APIs you need**:
   - ✅ M-Pesa Express (STK Push)
   - ✅ Lipa Na M-Pesa Online (if needed)
   - ✅ Any other APIs you use

### 3.3 Go-Live Request Process

1. **Navigate to your app** in the Daraja portal
2. Look for **"Go Live"** or **"Request Production Access"** button
3. Click and fill out the **Go-Live Request Form**:

#### Go-Live Request Form Fields:

```
Business Name: [Your registered business name]
Business Type: [Company/Sole Proprietorship/Partnership]
KRA PIN: [Your business KRA PIN]
Business Registration Number: [Certificate number]
Business Category: [e.g., E-commerce, Healthcare, etc.]
Phone Number: [Your business phone]
Email Address: [Business email]
Physical Address: [Business location]
Website URL: [Your business website]
```

#### Technical Details:

```
Production Callback URL: https://yourdomain.com/api/v1/payments/mpesa/callback
Expected Transaction Volume: [e.g., 100-500 transactions/month]
Average Transaction Amount: [e.g., KES 500-5000]
Go-Live Date: [Preferred date]
```

### 3.4 Document Upload

Upload the following documents:

- [ ] Certificate of Incorporation/Business Registration
- [ ] KRA PIN Certificate
- [ ] Business License/Permit
- [ ] ID Copy of authorized signatory
- [ ] Bank account details/Bank statement

---

## ⏳ STEP 4: WAITING PERIOD & FOLLOW-UP

### Expected Timeline:

- **Initial Review**: 1-3 business days
- **Document Verification**: 3-7 business days
- **Technical Review**: 2-5 business days
- **Final Approval**: 1-2 business days

**Total Expected Time: 7-17 business days**

### During the Waiting Period:

1. **Monitor your email** for communications from Safaricom
2. **Respond quickly** to any requests for additional information
3. **Keep testing** in sandbox to ensure your integration is solid
4. **Prepare your production deployment**

---

## 📧 STEP 5: APPROVAL NOTIFICATION

Once approved, you'll receive:

1. **Email notification** with approval confirmation
2. **Production credentials**:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode (Paybill number)
   - Passkey
3. **Go-live instructions**
4. **Settlement account details**

---

## ⚙️ STEP 6: PRODUCTION DEPLOYMENT

### 6.1 Update Your Environment Variables

```bash
# Update your .env or environment configuration
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
```

### 6.2 Code Updates (if needed)

Most of your code should work without changes, but verify:

```javascript
// Your mpesaService.js should automatically switch to production URLs
this.baseUrl =
  process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke" // Production URL
    : "https://sandbox.safaricom.co.ke"; // Sandbox URL
```

### 6.3 Deploy to Production

1. **Deploy your application** to production server
2. **Test callback URL** accessibility:
   ```bash
   curl -X POST https://yourdomain.com/api/v1/payments/mpesa/callback \
     -H "Content-Type: application/json" \
     -d '{"test": "callback"}'
   ```
3. **Verify SSL certificate** is valid and trusted

---

## 🧪 STEP 7: PRODUCTION TESTING

### 7.1 Initial Tests

Start with **small amounts** for initial testing:

```javascript
// Test with small amounts first
const testPayment = {
  phoneNumber: "254700000000", // Your actual phone number
  amount: 1, // Start with KES 1
  orderId: "TEST001",
  description: "Test payment",
};
```

### 7.2 Test Scenarios

1. **Successful Payment**: Complete a payment end-to-end
2. **Failed Payment**: Test with insufficient funds/cancelled payment
3. **Callback Processing**: Verify callbacks are received and processed
4. **Multiple Payments**: Test concurrent payments
5. **Edge Cases**: Test with different phone number formats

### 7.3 Monitoring Setup

```javascript
// Add production monitoring
console.log("🚀 PRODUCTION M-PESA TRANSACTION:", {
  orderId,
  amount,
  phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{3})/, "$1***$3"), // Mask phone
  timestamp: new Date().toISOString(),
});
```

---

## 💰 STEP 8: SETTLEMENT CONFIGURATION

### Settlement Details:

1. **Settlement Account**: Funds will be deposited to your business bank account
2. **Settlement Schedule**: Usually T+1 (next business day)
3. **Settlement Fees**: Safaricom will deduct their transaction fees
4. **Settlement Reports**: Available in Daraja portal

### Fees Structure (as of 2025):

- **Transaction Fee**: ~1-3% depending on volume
- **Settlement Fee**: Minimal or free for most businesses
- **Monthly Service Fee**: May apply based on your package

---

## 🔒 STEP 9: SECURITY & COMPLIANCE

### Security Best Practices:

1. **Secure API Keys**: Store in environment variables, never in code
2. **HTTPS Only**: All M-Pesa communication must be over HTTPS
3. **Callback Validation**: Verify callback authenticity
4. **Rate Limiting**: Implement rate limiting on your APIs
5. **Logging**: Log all transactions for audit purposes
6. **Error Handling**: Implement robust error handling

### Compliance Requirements:

1. **Data Protection**: Follow Kenya's Data Protection Act
2. **Transaction Records**: Keep records for at least 7 years
3. **Audit Trail**: Maintain complete audit trail of all transactions
4. **Reporting**: May need to provide transaction reports to Safaricom

---

## 📊 STEP 10: GO-LIVE CHECKLIST

Before announcing your M-Pesa integration:

### Technical Checklist:

- [ ] Production credentials configured
- [ ] HTTPS enabled on all endpoints
- [ ] Callback URL accessible and tested
- [ ] Error handling implemented
- [ ] Logging and monitoring setup
- [ ] Rate limiting configured
- [ ] Security measures in place

### Business Checklist:

- [ ] Settlement account configured
- [ ] Customer support processes defined
- [ ] Refund processes established
- [ ] Terms of service updated
- [ ] Privacy policy updated
- [ ] Marketing materials prepared

### Testing Checklist:

- [ ] Successful payment flows tested
- [ ] Failed payment scenarios tested
- [ ] Callback processing verified
- [ ] Edge cases handled
- [ ] Performance testing completed
- [ ] Load testing performed (if high volume expected)

---

## 🚨 COMMON GO-LIVE ISSUES & SOLUTIONS

### Issue 1: "Invalid Credentials" in Production

**Solution**: Double-check production credentials match exactly what Safaricom provided

### Issue 2: "Callback URL Not Accessible"

**Solution**: Ensure URL is HTTPS and publicly accessible. Test with curl.

### Issue 3: "Business Shortcode Not Found"

**Solution**: Wait for Safaricom to activate your shortcode (can take 24-48 hours)

### Issue 4: "Transaction Limits Exceeded"

**Solution**: Contact Safaricom to adjust your transaction limits

### Issue 5: "Callback Not Received"

**Solution**: Check firewall settings and ensure callback endpoint returns HTTP 200

---

## 📞 SUPPORT & ESCALATION

### Safaricom Support Contacts:

1. **Daraja Support Email**: apisupport@safaricom.co.ke
2. **Phone Support**: +254 722 000 000
3. **Developer Portal**: https://developer.safaricom.co.ke/support
4. **Community Forum**: https://developer.safaricom.co.ke/community

### When to Contact Support:

- Go-live request taking longer than expected
- Technical issues with production APIs
- Settlement problems
- Credential or configuration issues
- Transaction disputes

---

## 📋 POST GO-LIVE MAINTENANCE

### Monthly Tasks:

- [ ] Review transaction volumes and success rates
- [ ] Check settlement reports
- [ ] Monitor error rates
- [ ] Update credentials if needed
- [ ] Review security logs

### Quarterly Tasks:

- [ ] Performance optimization
- [ ] Security audit
- [ ] Backup and disaster recovery testing
- [ ] Documentation updates

---

## 🎉 CONGRATULATIONS!

Once you complete all these steps, your M-Pesa integration will be live and ready to process real payments from customers!

### Key Success Metrics to Track:

- **Transaction Success Rate**: Should be >95%
- **Average Response Time**: Should be <5 seconds
- **Callback Success Rate**: Should be >99%
- **Settlement Accuracy**: Should be 100%

---

**Remember**: Start with small transaction amounts and gradually increase as you gain confidence in your production setup. Always have a rollback plan ready in case issues arise.

**Good luck with your M-Pesa go-live process!** 🚀

---

_Last Updated: July 2025_
_For the latest information, always refer to the official Safaricom Daraja documentation._
