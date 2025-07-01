const jwt = require('jsonwebtoken');

class authMiddleware {
  static authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      // Ensure consistent user object structure
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin || false
      };

      next();
    });
  }

  // 2. Check if authenticated user is admin
  static authorizeAdmin(req, res, next) {
    // `req.user` must be set by authenticateToken first
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  }
}

module.exports = authMiddleware.authenticateToken;
module.exports.authorizeAdmin = authMiddleware.authorizeAdmin;