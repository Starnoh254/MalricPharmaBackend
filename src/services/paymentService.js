const MpesaService = require('./mpesaService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentService {
    constructor() {
        this.mpesaService = new MpesaService();
    }

    /**
     * Process payment based on payment method
     * @param {Object} paymentData - Payment information
     * @param {Object} order - Order information
     * @returns {Promise<Object>} Payment processing result
     */
    async processPayment(paymentData, order) {
        const { method } = paymentData;

        switch (method.toLowerCase()) {
            case 'mpesa':
                return await this.processMpesaPayment(paymentData, order);
            case 'card':
                return await this.processCardPayment(paymentData, order);
            case 'cod':
                return await this.processCODPayment(paymentData, order);
            default:
                throw new Error(`Unsupported payment method: ${method}`);
        }
    }

    /**
     * Process M-Pesa payment
     * @param {Object} paymentData - M-Pesa payment data
     * @param {Object} order - Order information
     * @returns {Promise<Object>} M-Pesa payment result
     */
    async processMpesaPayment(paymentData, order) {
        try {
            // Validate M-Pesa configuration
            if (!this.mpesaService.validateConfiguration()) {
                throw new Error('M-Pesa configuration is incomplete');
            }

            const { phone } = paymentData;
            if (!phone) {
                throw new Error('Phone number is required for M-Pesa payment');
            }

            // Create payment record
            const paymentRecord = await this.createPaymentRecord({
                orderId: order.id,
                method: 'mpesa',
                amount: order.totalAmount,
                status: 'pending',
                metadata: {
                    phoneNumber: phone,
                    orderNumber: order.orderNumber
                }
            });

            // Initiate STK Push
            const stkResponse = await this.mpesaService.initiateSTKPush({
                phoneNumber: phone,
                amount: order.totalAmount,
                orderId: order.orderNumber,
                description: `Payment for MalricPharma order ${order.orderNumber}`
            });

            // Update payment record with STK response
            await this.updatePaymentRecord(paymentRecord.id, {
                status: stkResponse.ResponseCode === '0' ? 'initiated' : 'failed',
                providerTransactionId: stkResponse.CheckoutRequestID,
                metadata: {
                    ...paymentRecord.metadata,
                    merchantRequestId: stkResponse.MerchantRequestID,
                    checkoutRequestId: stkResponse.CheckoutRequestID,
                    responseCode: stkResponse.ResponseCode,
                    responseDescription: stkResponse.ResponseDescription
                }
            });

            if (stkResponse.ResponseCode !== '0') {
                throw new Error(stkResponse.ResponseDescription || 'Failed to initiate M-Pesa payment');
            }

            return {
                success: true,
                paymentId: paymentRecord.id,
                checkoutRequestId: stkResponse.CheckoutRequestID,
                message: 'Payment initiated. Please check your phone and enter your M-Pesa PIN.',
                customerMessage: stkResponse.CustomerMessage
            };

        } catch (error) {
            console.error('M-Pesa payment error:', error);
            throw error;
        }
    }

    /**
     * Process card payment (placeholder for future implementation)
     * @param {Object} paymentData - Card payment data
     * @param {Object} order - Order information
     * @returns {Promise<Object>} Card payment result
     */
    async processCardPayment(paymentData, order) {
        // TODO: Implement Stripe/other card processing
        throw new Error('Card payment not yet implemented');
    }

    /**
     * Process Cash on Delivery
     * @param {Object} paymentData - COD payment data
     * @param {Object} order - Order information
     * @returns {Promise<Object>} COD payment result
     */
    async processCODPayment(paymentData, order) {
        try {
            // Create payment record for COD
            const paymentRecord = await this.createPaymentRecord({
                orderId: order.id,
                method: 'cod',
                amount: order.totalAmount,
                status: 'pending_delivery', // COD is paid on delivery
                metadata: {
                    orderNumber: order.orderNumber,
                    note: 'Cash on Delivery - Payment due on delivery'
                }
            });

            return {
                success: true,
                paymentId: paymentRecord.id,
                message: 'Order confirmed. Payment will be collected on delivery.',
                requiresDeliveryPayment: true
            };

        } catch (error) {
            console.error('COD payment error:', error);
            throw error;
        }
    }

    /**
     * Handle M-Pesa callback
     * @param {Object} callbackData - M-Pesa callback data
     * @returns {Promise<Object>} Callback processing result
     */
    async handleMpesaCallback(callbackData) {
        try {
            // Process callback data
            const result = this.mpesaService.processCallback(callbackData);

            // Find payment record by checkout request ID
            const paymentRecord = await prisma.payment.findFirst({
                where: {
                    providerTransactionId: result.checkoutRequestId
                },
                include: {
                    order: true
                }
            });

            if (!paymentRecord) {
                console.error('Payment record not found for checkout request:', result.checkoutRequestId);
                return { success: false, message: 'Payment record not found' };
            }

            let newPaymentStatus;
            let newOrderStatus;

            if (result.success) {
                // Payment successful
                newPaymentStatus = 'completed';
                newOrderStatus = 'CONFIRMED';

                // Update payment record with transaction details
                await this.updatePaymentRecord(paymentRecord.id, {
                    status: newPaymentStatus,
                    completedAt: new Date(),
                    metadata: {
                        ...paymentRecord.metadata,
                        transactionDetails: result.transactionDetails,
                        mpesaReceiptNumber: result.transactionDetails?.mpesaReceiptNumber
                    }
                });

            } else {
                // Payment failed
                newPaymentStatus = 'failed';
                newOrderStatus = 'CANCELLED';

                await this.updatePaymentRecord(paymentRecord.id, {
                    status: newPaymentStatus,
                    failureReason: result.resultDesc,
                    metadata: {
                        ...paymentRecord.metadata,
                        failureDetails: {
                            resultCode: result.resultCode,
                            resultDesc: result.resultDesc
                        }
                    }
                });
            }

            // Update order status
            await prisma.order.update({
                where: { id: paymentRecord.orderId },
                data: { status: newOrderStatus }
            });

            console.log(`Payment ${result.success ? 'successful' : 'failed'} for order ${paymentRecord.order.orderNumber}`);

            return {
                success: true,
                paymentSuccess: result.success,
                orderId: paymentRecord.orderId,
                orderNumber: paymentRecord.order.orderNumber
            };

        } catch (error) {
            console.error('Error handling M-Pesa callback:', error);
            return { success: false, message: 'Failed to process callback' };
        }
    }

    /**
     * Create payment record in database
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} Created payment record
     */
    async createPaymentRecord(paymentData) {
        return await prisma.payment.create({
            data: {
                orderId: paymentData.orderId,
                method: paymentData.method,
                amount: paymentData.amount,
                status: paymentData.status,
                providerTransactionId: paymentData.providerTransactionId,
                metadata: paymentData.metadata
            }
        });
    }

    /**
     * Update payment record
     * @param {string} paymentId - Payment ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated payment record
     */
    async updatePaymentRecord(paymentId, updateData) {
        return await prisma.payment.update({
            where: { id: paymentId },
            data: updateData
        });
    }

    /**
     * Get payment status
     * @param {string} paymentId - Payment ID
     * @returns {Promise<Object>} Payment status
     */
    async getPaymentStatus(paymentId) {
        return await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        status: true
                    }
                }
            }
        });
    }

    /**
     * Query M-Pesa transaction status
     * @param {string} checkoutRequestId - Checkout request ID
     * @returns {Promise<Object>} Transaction status
     */
    async queryMpesaStatus(checkoutRequestId) {
        try {
            const statusResponse = await this.mpesaService.querySTKPushStatus(checkoutRequestId);

            // Find and update payment record
            const paymentRecord = await prisma.payment.findFirst({
                where: { providerTransactionId: checkoutRequestId }
            });

            if (paymentRecord) {
                await this.updatePaymentRecord(paymentRecord.id, {
                    metadata: {
                        ...paymentRecord.metadata,
                        lastStatusQuery: new Date(),
                        statusQueryResult: statusResponse
                    }
                });
            }

            return statusResponse;

        } catch (error) {
            console.error('Error querying M-Pesa status:', error);
            throw error;
        }
    }
}

module.exports = PaymentService;
