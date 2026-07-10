const rateLimit = require('express-rate-limit');

/**
 * OTP Request Rate Limiter (Bonus Point)
 * Limits OTP requests to prevent abuse
 * Max 5 OTP requests per IP per 10 minutes
 */
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API Rate Limiter
 * Max 100 requests per IP per 15 minutes
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  otpRateLimiter,
  apiRateLimiter,
};
