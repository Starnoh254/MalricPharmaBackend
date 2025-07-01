const { PrismaClient } = require('@prisma/client');
const PaymentService = require('./paymentService');
const prisma = new PrismaClient();

class OrderService {
    /**
     * Generate a unique order number
     * Format: MP{timestamp} (MalricPharma + timestamp)
     */
    static generateOrderNumber() {
        const timestamp = Date.now();
        return `MP${timestamp}`;
    }

    /**
     * Create a new order
     * @param {Object} orderData - The order data from frontend
     * @param {number} userId - The authenticated user ID
     * @returns {Promise<Object>} - Created order with details
     */
    static async createOrder(orderData, userId) {
        const { items, shipping, payment, total } = orderData;

        // Generate unique order number
        const orderNumber = this.generateOrderNumber();

        try {
            // Start a database transaction
            const result = await prisma.$transaction(async (tx) => {
                // 1. Validate all products exist and get current prices
                const productIds = items.map(item => item.productId);
                const products = await tx.product.findMany({
                    where: { id: { in: productIds } }
                });

                if (products.length !== productIds.length) {
                    throw new Error('Some products no longer exist');
                }

                // 2. Calculate actual total (security check)
                let calculatedTotal = 0;
                const validatedItems = items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) {
                        throw new Error(`Product ${item.productId} not found`);
                    }

                    const subtotal = product.price * item.quantity;
                    calculatedTotal += subtotal;

                    return {
                        productId: product.id,
                        productName: product.name,
                        price: product.price, // Use current price from DB
                        quantity: item.quantity,
                        subtotal: subtotal,
                        productSnapshot: {
                            name: product.name,
                            description: product.description,
                            category: product.category,
                            imageUrl: product.imageUrl
                        }
                    };
                });                // Verify total matches (within small margin for floating point)
                console.log('🔍 DEBUGGING ORDER TOTAL:');
                console.log('Frontend total:', total, '(type:', typeof total, ')');
                console.log('Calculated total (products only):', calculatedTotal);
                console.log('Difference:', Math.abs(calculatedTotal - total));
                console.log('Items used in calculation:', validatedItems.map(item => ({
                    product: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal
                })));
                console.log('⚠️  IMPORTANT: Backend only validates PRODUCTS total, not including delivery fees!');

                if (Math.abs(calculatedTotal - total) > 0.01) {
                    throw new Error(`Order total mismatch. Frontend total: ${total}, Backend calculated (products only): ${calculatedTotal}. Note: Do not include delivery fees in the total sent to backend.`);
                }

                // 3. Create the order
                const order = await tx.order.create({
                    data: {
                        orderNumber,
                        userId,
                        status: 'PENDING',
                        totalAmount: calculatedTotal,
                        shippingInfo: shipping,
                        paymentMethod: payment.method.toUpperCase(),
                        paymentStatus: 'PENDING',
                        estimatedDelivery: this.calculateEstimatedDelivery()
                    }
                });

                // 4. Create order items
                await tx.orderItem.createMany({
                    data: validatedItems.map(item => ({
                        orderId: order.id,
                        ...item
                    }))
                });

                // 5. Create initial status history
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: order.id,
                        status: 'PENDING',
                        notes: 'Order created'
                    }
                });

                return order;
            });

            // 6. Process payment after order creation
            const paymentService = new PaymentService();
            let paymentResult = null;

            try {
                paymentResult = await paymentService.processPayment(payment, result);
                console.log('Payment processing initiated:', paymentResult);
            } catch (paymentError) {
                console.error('Payment processing failed:', paymentError);

                // If payment fails, we might want to cancel the order
                // For now, we'll keep the order as PENDING and let the user retry
                const errorMessage = paymentError.message.length > 200
                    ? paymentError.message.substring(0, 200) + '...'
                    : paymentError.message;

                await prisma.order.update({
                    where: { id: result.id },
                    data: {
                        notes: `Payment failed: ${errorMessage}`
                    }
                });
            }

            // Return order with items and payment info
            const orderWithDetails = await this.getOrderById(result.id, userId);

            return {
                ...orderWithDetails,
                paymentResult
            };

        } catch (error) {
            console.error('Order creation error:', error);
            throw new Error(error.message || 'Failed to create order');
        }
    }

    /**
     * Calculate estimated delivery date (24-48 hours from now)
     */
    static calculateEstimatedDelivery() {
        const now = new Date();
        const deliveryDate = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours
        return deliveryDate;
    }

    /**
     * Get order by ID (with security check)
     * @param {string} orderId - Order ID
     * @param {number} userId - User ID for security check
     * @returns {Promise<Object>} - Order with all details
     */
    static async getOrderById(orderId, userId) {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId // Security: users can only see their own orders
            },
            include: {
                orderItems: {
                    include: {
                        product: true // Include current product info
                    }
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    /**
     * Get order by order number (for tracking)
     * @param {string} orderNumber - Order number
     * @param {number} userId - User ID for security check
     * @returns {Promise<Object>} - Order details
     */
    static async getOrderByNumber(orderNumber, userId) {
        const order = await prisma.order.findFirst({
            where: {
                orderNumber,
                userId
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    /**
     * Get all orders for a user
     * @param {number} userId - User ID
     * @param {Object} options - Pagination and filtering options
     * @returns {Promise<Object>} - Orders with pagination info
     */
    static async getUserOrders(userId, options = {}) {
        const { page = 1, limit = 10, status } = options;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(status && { status })
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    orderItems: true,
                    _count: {
                        select: { orderItems: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.order.count({ where })
        ]);

        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Update order status (admin function)
     * @param {string} orderId - Order ID
     * @param {string} newStatus - New status
     * @param {number} changedBy - User ID who made the change
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} - Updated order
     */
    static async updateOrderStatus(orderId, newStatus, changedBy, notes = null) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                // Update order status
                const order = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                // Add to status history
                await tx.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: newStatus,
                        changedBy,
                        notes
                    }
                });

                return order;
            });

            return result;
        } catch (error) {
            console.error('Status update error:', error);
            throw new Error('Failed to update order status');
        }
    }

    /**
     * Cancel an order (customer function)
     * @param {string} orderId - Order ID
     * @param {number} userId - User ID for security
     * @returns {Promise<Object>} - Updated order
     */
    static async cancelOrder(orderId, userId) {
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Check if order can be cancelled
        if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
            throw new Error('Order cannot be cancelled at this stage');
        }

        return await this.updateOrderStatus(orderId, 'CANCELLED', userId, 'Cancelled by customer');
    }

    /**
     * Get order statistics (admin function)
     * @returns {Promise<Object>} - Order statistics
     */
    static async getOrderStats() {
        const [
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue,
            todayOrders
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.order.aggregate({
                where: { status: { not: 'CANCELLED' } },
                _sum: { totalAmount: true }
            }),
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            todayOrders
        };
    }

    /**
     * Get all orders (admin function)
     * @param {Object} options - Pagination and filtering options
     * @returns {Promise<Object>} - All orders with pagination info
     */
    static async getAllOrders(options = {}) {
        const { page = 1, limit = 20, status } = options;
        const skip = (page - 1) * limit;

        const where = {
            ...(status && { status })
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    orderItems: {
                        include: {
                            product: true
                        }
                    },
                    _count: {
                        select: { orderItems: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.order.count({ where })
        ]);

        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = OrderService;
