const axios = require('axios');
const moment = require('moment');

class MpesaService {
    constructor() {
        // M-Pesa API Configuration
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
        this.passkey = process.env.MPESA_PASSKEY;
        this.callbackUrl = process.env.MPESA_CALLBACK_URL;

        // M-Pesa API URLs
        this.baseUrl = process.env.MPESA_ENVIRONMENT === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        this.authUrl = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
        this.stkPushUrl = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;
        this.stkQueryUrl = `${this.baseUrl}/mpesa/stkpushquery/v1/query`;
    }

    /**
     * Generate M-Pesa access token
     * @returns {Promise<string>} Access token
     */
    async generateAccessToken() {
        try {
            const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

            const response = await axios.get(this.authUrl, {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.access_token;
        } catch (error) {
            console.error('Error generating M-Pesa access token:', error.response?.data || error.message);
            throw new Error('Failed to generate M-Pesa access token');
        }
    }

    /**
     * Generate password for STK push
     * @returns {string} Base64 encoded password
     */
    generatePassword() {
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
        return { password, timestamp };
    }

    /**
     * Format phone number to M-Pesa format (254XXXXXXXXX)
     * @param {string} phoneNumber - Phone number in various formats
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-numeric characters
        let cleanNumber = phoneNumber.replace(/\D/g, '');

        // Handle different formats
        if (cleanNumber.startsWith('0')) {
            // Convert 0712345678 to 254712345678
            cleanNumber = '254' + cleanNumber.substring(1);
        } else if (cleanNumber.startsWith('7') && cleanNumber.length === 9) {
            // Convert 712345678 to 254712345678
            cleanNumber = '254' + cleanNumber;
        } else if (!cleanNumber.startsWith('254')) {
            // If it doesn't start with 254, assume it needs the prefix
            cleanNumber = '254' + cleanNumber;
        }

        return cleanNumber;
    }

    /**
     * Initiate STK Push payment
     * @param {Object} paymentData - Payment information
     * @returns {Promise<Object>} STK Push response
     */
    async initiateSTKPush(paymentData) {
        const { phoneNumber, amount, orderId, description } = paymentData;

        try {
            // Get access token
            const accessToken = await this.generateAccessToken();

            // Generate password and timestamp
            const { password, timestamp } = this.generatePassword();

            // Format phone number
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            // Prepare STK Push request
            const stkPushData = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(amount), // M-Pesa requires integer amounts
                PartyA: formattedPhone,
                PartyB: this.businessShortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: orderId,
                TransactionDesc: description || `Payment for order ${orderId}`
            };

            console.log('Initiating STK Push:', {
                phone: formattedPhone,
                amount: stkPushData.Amount,
                orderId
            });

            const response = await axios.post(this.stkPushUrl, stkPushData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('STK Push Response:', response.data);
            return response.data;

        } catch (error) {
            console.error('STK Push Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
        }
    }

    /**
     * Query STK Push transaction status
     * @param {string} checkoutRequestId - Checkout request ID from STK push
     * @returns {Promise<Object>} Transaction status
     */
    async querySTKPushStatus(checkoutRequestId) {
        try {
            const accessToken = await this.generateAccessToken();
            const { password, timestamp } = this.generatePassword();

            const queryData = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };

            const response = await axios.post(this.stkQueryUrl, queryData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;

        } catch (error) {
            console.error('STK Query Error:', error.response?.data || error.message);
            throw new Error('Failed to query M-Pesa transaction status');
        }
    }

    /**
     * Process M-Pesa callback data
     * @param {Object} callbackData - Callback data from M-Pesa
     * @returns {Object} Processed payment result
     */
    processCallback(callbackData) {
        try {
            const { Body } = callbackData;
            const { stkCallback } = Body;

            const result = {
                merchantRequestId: stkCallback.MerchantRequestID,
                checkoutRequestId: stkCallback.CheckoutRequestID,
                resultCode: stkCallback.ResultCode,
                resultDesc: stkCallback.ResultDesc,
                success: stkCallback.ResultCode === 0
            };

            // If payment was successful, extract transaction details
            if (result.success && stkCallback.CallbackMetadata) {
                const metadata = stkCallback.CallbackMetadata.Item;

                result.transactionDetails = {
                    amount: this.extractMetadataValue(metadata, 'Amount'),
                    mpesaReceiptNumber: this.extractMetadataValue(metadata, 'MpesaReceiptNumber'),
                    transactionDate: this.extractMetadataValue(metadata, 'TransactionDate'),
                    phoneNumber: this.extractMetadataValue(metadata, 'PhoneNumber')
                };
            }

            return result;

        } catch (error) {
            console.error('Error processing M-Pesa callback:', error);
            throw new Error('Failed to process M-Pesa callback');
        }
    }

    /**
     * Extract value from M-Pesa callback metadata
     * @param {Array} metadata - Callback metadata array
     * @param {string} name - Metadata item name
     * @returns {*} Metadata value
     */
    extractMetadataValue(metadata, name) {
        const item = metadata.find(item => item.Name === name);
        return item ? item.Value : null;
    }

    /**
     * Validate M-Pesa configuration
     * @returns {boolean} Configuration is valid
     */
    validateConfiguration() {
        const requiredConfig = [
            'MPESA_CONSUMER_KEY',
            'MPESA_CONSUMER_SECRET',
            'MPESA_BUSINESS_SHORTCODE',
            'MPESA_PASSKEY',
            'MPESA_CALLBACK_URL'
        ];

        const missing = requiredConfig.filter(key => !process.env[key]);

        if (missing.length > 0) {
            console.error('Missing M-Pesa configuration:', missing);
            return false;
        }

        return true;
    }
}

module.exports = MpesaService;
