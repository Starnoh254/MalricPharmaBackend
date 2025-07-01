const cron = require('node-cron');
const authService = require('../services/authService');

/**
 * Cleanup expired refresh tokens
 * Runs every day at 2 AM
 */
const startTokenCleanup = () => {
    // Run every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('Starting refresh token cleanup...');
        try {
            await authService.cleanupExpiredTokens();
            console.log('Refresh token cleanup completed');
        } catch (error) {
            console.error('Refresh token cleanup failed:', error);
        }
    });

    console.log('Token cleanup cron job scheduled');
};

module.exports = { startTokenCleanup };
