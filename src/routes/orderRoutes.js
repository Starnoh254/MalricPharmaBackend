const express = require('express');
const OrderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

/**
 * Customer Order Routes
 */

// Create a new order
router.post('/', OrderController.createOrder);

// Get user's orders (with pagination and filtering)
router.get('/', OrderController.getUserOrders);

// Get specific order by ID
router.get('/:orderId', OrderController.getOrderById);

// Track order by order number
router.get('/track/:orderNumber', OrderController.trackOrder);

// Cancel an order
router.patch('/:orderId/cancel', OrderController.cancelOrder);

/**
 * Admin Order Routes
 */

// Get all orders (admin only)
router.get('/admin/all', OrderController.getAllOrders);

// Update order status (admin only)
router.patch('/admin/:orderId/status', OrderController.updateOrderStatus);

// Get order statistics (admin only)
router.get('/admin/stats', OrderController.getOrderStats);

module.exports = router;
