const authService = require('../services/authService');

class authController {
  // Register a new user
  static async register(req, res) {
    const { name, email, password } = req.body;
    try {
      const user = await authService.registerUser(name, email, password);
      res.status(201).json({ message: 'User registered', user });
    } catch (err) {
      if (err.message === 'User already exists') {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // Login a user
  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const result = await authService.loginUser(email, password);
      res.status(200).json({
        status: 'success',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        },
        message: 'Login successful'
      });
    } catch (err) {
      if (err.message === 'Invalid credentials') {
        return res.status(400).json({
          status: 'error' ,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: err.message
          }
        });
      }
      res.status(500).json({
        status : 'error',
        error: {
          code: 'SERVER_ERROR',
          message: err.message
        }
      });
    }
  }

  // Refresh access token
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status : 'error',
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required'
          }
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        status : 'success',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        },
        message: 'Token refreshed successfully'
      });

    } catch (err) {
      let statusCode = 401;
      let errorCode = 'INVALID_REFRESH_TOKEN';

      if (err.message.includes('expired')) {
        errorCode = 'REFRESH_TOKEN_EXPIRED';
      } else if (err.message.includes('revoked')) {
        errorCode = 'REFRESH_TOKEN_REVOKED';
      }

      res.status(statusCode).json({
        status : 'error',
        error: {
          code: errorCode,
          message: err.message
        }
      });
    }
  }

  // Logout user (revoke refresh token)
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken);
      }

      res.status(200).json({
        status : 'success',
        message: 'Logged out successfully'
      });

    } catch (err) {
      res.status(500).json({
        status: 'error',
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Failed to logout'
        }
      });
    }
  }
}

module.exports = authController;