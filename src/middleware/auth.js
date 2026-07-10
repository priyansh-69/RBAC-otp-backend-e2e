const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token from the Authorization header.
 * Attaches { userId, mobile, role } to req.user on success.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user payload to request — matches JWT payload: { userId, mobile, role }
    req.user = {
      userId: decoded.userId,
      mobile: decoded.mobile,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired. Please login again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token.'));
    }
    next(new ApiError(401, 'Authentication failed.'));
  }
};

module.exports = auth;
