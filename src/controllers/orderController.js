const OrderService = require('../services/orderService');

class OrderController {
    /**
     * Create a new order
     * POST /api/v1/orders
     */
    static async createOrder(req, res) {
        try {
            // Get user ID from authenticated request
            const userId = req.user.userId; // Assumes auth middleware sets req.user

            // Validate request body
            const { items, shipping, payment, total } = req.body;
            console.log("🔍 ORDER CONTROLLER DEBUG:");
            console.log("Request body:", JSON.stringify(req.body, null, 2));
            console.log("Items:", items);
            console.log("Total from frontend:", total);
            console.log("Total type:", typeof total);

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'INVALID_ITEMS',
                        message: 'Order must contain at least one item'
                    }
                });
            }

            if (!shipping || !shipping.fullName || !shipping.address) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'INVALID_SHIPPING',
                        message: 'Shipping information is required'
                    }
                });
            }

            if (!payment || !payment.method) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'INVALID_PAYMENT',
                        message: 'Payment method is required'
                    }
                });
            }

            if (!total || total <= 0) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'INVALID_TOTAL',
                        message: 'Invalid order total'
                    }
                });
            }

            // Create the order
            const order = await OrderService.createOrder(req.body, userId);

            res.status(201).json({
                status: 'success',
                data: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    total: order.totalAmount,
                    createdAt: order.createdAt,
                    estimatedDelivery: order.estimatedDelivery,
                    items: order.orderItems
                },
                message: 'Order created successfully'
            });

        } catch (error) {
            console.error('Create order error:', error);

            // Handle specific error types
            if (error.message.includes('no longer exist')) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'INVALID_ITEMS',
                        message: 'Some items in your cart are no longer available'
                    }
                });
            }

            if (error.message.includes('total mismatch')) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'PRICE_MISMATCH',
                        message: 'Order total mismatch. Make sure to send PRODUCTS total only (excluding delivery fees).',
                        details: error.message,
                        hint: 'Check the Frontend Integration Guide for correct total calculation'
                    }
                });
            }

            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create order. Please try again.'
                }
            });
        }
    }

    /**
     * Get user's orders
     * GET /api/v1/orders
     */
    static async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            const { page, limit, status } = req.query;

            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                status: status || undefined
            };

            const result = await OrderService.getUserOrders(userId, options);

            res.json({
                success: true,
                data: result.orders,
                pagination: result.pagination
            });

        } catch (error) {
            console.error('Get user orders error:', error);
            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch orders'
                }
            });
        }
    }

    /**
     * Get specific order by ID
     * GET /api/v1/orders/:orderId
     */
    static async getOrderById(req, res) {
        try {
            const userId = req.user.userId;
            const { orderId } = req.params;

            const order = await OrderService.getOrderById(orderId, userId);

            res.json({
                success: true,
                data: order
            });

        } catch (error) {
            console.error('Get order error:', error);

            if (error.message === 'Order not found') {
                return res.status(404).json({
                    status: 'error',
                    error: {
                        code: 'ORDER_NOT_FOUND',
                        message: 'Order not found'
                    }
                });
            }

            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch order'
                }
            });
        }
    }

    /**
     * Track order by order number
     * GET /api/v1/orders/track/:orderNumber
     */
    static async trackOrder(req, res) {
        try {
            const userId = req.user.userId;
            const { orderNumber } = req.params;

            const order = await OrderService.getOrderByNumber(orderNumber, userId);

            // Return tracking-specific information
            res.json({
                success: true,
                data: {
                    orderNumber: order.orderNumber,
                    status: order.status,
                    createdAt: order.createdAt,
                    estimatedDelivery: order.estimatedDelivery,
                    statusHistory: order.statusHistory,
                    shippingInfo: order.shippingInfo
                }
            });

        } catch (error) {
            console.error('Track order error:', error);

            if (error.message === 'Order not found') {
                return res.status(404).json({
                    status: 'error',
                    error: {
                        code: 'ORDER_NOT_FOUND',
                        message: 'Order not found'
                    }
                });
            }

            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to track order'
                }
            });
        }
    }

    /**
     * Cancel an order
     * PATCH /api/v1/orders/:orderId/cancel
     */
    static async cancelOrder(req, res) {
        try {
            const userId = req.user.userId;
            const { orderId } = req.params;

            const order = await OrderService.cancelOrder(orderId, userId);

            res.json({
                success: true,
                data: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status
                },
                message: 'Order cancelled successfully'
            });

        } catch (error) {
            console.error('Cancel order error:', error);

            if (error.message === 'Order not found') {
                return res.status(404).json({
                    status: 'error',
                    error: {
                        code: 'ORDER_NOT_FOUND',
                        message: 'Order not found'
                    }
                });
            }

            if (error.message.includes('cannot be cancelled')) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'CANNOT_CANCEL',
                        message: error.message
                    }
                });
            }

            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to cancel order'
                }
            });
        }
    }

    /**
     * Admin: Get all orders
     * GET /api/v1/admin/orders
     */
    static async getAllOrders(req, res) {
        try {
            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    status: 'error',
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Admin access required'
                    }
                });
            }

            const { page, limit, status } = req.query;

            // For admin, we'll modify the service to get all orders
            // For now, let's create a simple implementation
            const orders = await OrderService.getAllOrders({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status
            });

            res.json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('Get all orders error:', error);
            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch orders'
                }
            });
        }
    }

    /**
     * Admin: Update order status
     * PATCH /api/v1/admin/orders/:orderId/status
     */
    static async updateOrderStatus(req, res) {
        try {
            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    status: 'error',
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Admin access required'
                    }
                });
            }

            const { orderId } = req.params;
            const { status, notes } = req.body;
            const changedBy = req.user.userId;

            if (!status) {
                return res.status(400).json({
                    status: 'error',
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Status is required'
                    }
                });
            }

            const order = await OrderService.updateOrderStatus(orderId, status, changedBy, notes);

            res.json({
                success: true,
                data: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status
                },
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update order status'
                }
            });
        }
    }

    /**
     * Admin: Get order statistics
     * GET /api/v1/admin/orders/stats
     */
    static async getOrderStats(req, res) {
        try {
            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    status: 'error',
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Admin access required'
                    }
                });
            }

            const stats = await OrderService.getOrderStats();

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Get order stats error:', error);
            res.status(500).json({
                status: 'error',
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch order statistics'
                }
            });
        }
    }
}

module.exports = OrderController;
