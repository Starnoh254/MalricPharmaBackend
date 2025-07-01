const PaymentService = require('../services/paymentService');

class PaymentController {
    /**
     * Handle M-Pesa callback from Safaricom
     * POST /api/v1/payments/mpesa/callback
     */
    static async handleMpesaCallback(req, res) {
        try {
            console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

            const paymentService = new PaymentService();
            const result = await paymentService.handleMpesaCallback(req.body);

            if (result.success) {
                console.log(`M-Pesa callback processed successfully for order ${result.orderNumber}`);

                // M-Pesa expects a successful response
                res.status(200).json({
                    ResultCode: 0,
                    ResultDesc: "Callback processed successfully"
                });
            } else {
                console.error('M-Pesa callback processing failed:', result.message);

                // Still send success to M-Pesa to avoid retries
                res.status(200).json({
                    ResultCode: 0,
                    ResultDesc: "Callback received but processing failed"
                });
            }

        } catch (error) {
            console.error('M-Pesa callback error:', error);

            // Send success response to M-Pesa even on error to prevent retries
            res.status(200).json({
                ResultCode: 0,
                ResultDesc: "Callback received"
            });
        }
    }

    /**
     * Get payment status
     * GET /api/v1/payments/:id/status
     */
    static async getPaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const paymentService = new PaymentService();
            const payment = await paymentService.getPaymentStatus(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'PAYMENT_NOT_FOUND',
                        message: 'Payment not found'
                    }
                });
            }

            // Check if user has access to this payment
            if (payment.order.userId !== userId && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Access denied'
                    }
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    payment: {
                        id: payment.id,
                        method: payment.method,
                        amount: payment.amount,
                        status: payment.status,
                        createdAt: payment.createdAt,
                        completedAt: payment.completedAt,
                        mpesaReceiptNumber: payment.mpesaReceiptNumber,
                        order: {
                            orderNumber: payment.order.orderNumber,
                            status: payment.order.status
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Get payment status error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get payment status'
                }
            });
        }
    }

    /**
     * Query M-Pesa transaction status
     * GET /api/v1/payments/mpesa/:checkoutRequestId/status
     */
    static async queryMpesaStatus(req, res) {
        try {
            const { checkoutRequestId } = req.params;

            const paymentService = new PaymentService();
            const statusResult = await paymentService.queryMpesaStatus(checkoutRequestId);

            res.status(200).json({
                success: true,
                data: {
                    checkoutRequestId,
                    status: statusResult
                }
            });

        } catch (error) {
            console.error('Query M-Pesa status error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'QUERY_FAILED',
                    message: 'Failed to query M-Pesa status'
                }
            });
        }
    }

    /**
     * Retry failed payment
     * POST /api/v1/payments/:id/retry
     */
    static async retryPayment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Get the original payment record
            const paymentService = new PaymentService();
            const payment = await paymentService.getPaymentStatus(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'PAYMENT_NOT_FOUND',
                        message: 'Payment not found'
                    }
                });
            }

            // Check access
            if (payment.order.userId !== userId && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Access denied'
                    }
                });
            }

            // Only allow retry for failed payments
            if (payment.status !== 'failed') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Can only retry failed payments'
                    }
                });
            }

            // Get order details and retry payment
            const order = await prisma.order.findUnique({
                where: { id: payment.orderId }
            });

            const paymentData = {
                method: payment.method,
                ...payment.metadata
            };

            const retryResult = await paymentService.processPayment(paymentData, order);

            res.status(200).json({
                success: true,
                data: {
                    payment: retryResult
                },
                message: 'Payment retry initiated'
            });

        } catch (error) {
            console.error('Retry payment error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'RETRY_FAILED',
                    message: 'Failed to retry payment'
                }
            });
        }
    }

    /**
     * Webhook endpoint for testing M-Pesa integration
     * POST /api/v1/payments/mpesa/test-callback
     */
    static async testMpesaCallback(req, res) {
        try {
            // This is for testing purposes only
            if (process.env.NODE_ENV === 'production') {
                return res.status(404).json({ message: 'Not found' });
            }

            const testCallbackData = {
                Body: {
                    stkCallback: {
                        MerchantRequestID: "test-merchant-123",
                        CheckoutRequestID: req.body.checkoutRequestId || "test-checkout-123",
                        ResultCode: req.body.resultCode || 0,
                        ResultDesc: req.body.resultDesc || "The service request is processed successfully.",
                        CallbackMetadata: req.body.resultCode === 0 ? {
                            Item: [
                                { Name: "Amount", Value: 100 },
                                { Name: "MpesaReceiptNumber", Value: "TEST123456" },
                                { Name: "TransactionDate", Value: 20241230100000 },
                                { Name: "PhoneNumber", Value: 254712345678 }
                            ]
                        } : undefined
                    }
                }
            };

            const paymentService = new PaymentService();
            const result = await paymentService.handleMpesaCallback(testCallbackData);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Test callback processed'
            });

        } catch (error) {
            console.error('Test callback error:', error);
            res.status(500).json({
                success: false,
                error: 'Test callback failed'
            });
        }
    }
}

module.exports = PaymentController;
