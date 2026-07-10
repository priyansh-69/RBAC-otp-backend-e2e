const jwt = require('jsonwebtoken');

/**
 * Token Service
 * Handles JWT access token and refresh token generation/verification
 */
const tokenService = {
  /**
   * Generate access token
   * JWT payload: { userId, mobile, role } — as required by assignment
   */
  generateAccessToken: ({ userId, mobile, role }) => {
    return jwt.sign(
      { userId, mobile, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  },

  /**
   * Generate refresh token (Bonus Point)
   */
  generateRefreshToken: ({ userId }) => {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  },

  /**
   * Verify access token
   */
  verifyAccessToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken: (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  },
};

module.exports = tokenService;
