const express = require('express');
const PaymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Public Routes (no authentication required)
 */

// M-Pesa callback endpoint (called by Safaricom)
router.post('/mpesa/callback', PaymentController.handleMpesaCallback);

// Test callback endpoint (development only)
router.post('/mpesa/test-callback', PaymentController.testMpesaCallback);

/**
 * Protected Routes (authentication required)
 */

// Get payment status
router.get('/:id/status', authMiddleware, PaymentController.getPaymentStatus);

// Query M-Pesa transaction status
router.get('/mpesa/:checkoutRequestId/status', authMiddleware, PaymentController.queryMpesaStatus);

// Retry failed payment
router.post('/:id/retry', authMiddleware, PaymentController.retryPayment);

module.exports = router;
