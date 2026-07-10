const User = require('../models/User');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const logService = require('../services/logService');
const smsService = require('../services/smsService');
const ApiError = require('../utils/ApiError');
const { LOG_ACTIONS } = require('../utils/constants');

/**
 * Auth Controller
 * Handles OTP-based authentication flow
 */
const authController = {
  /**
   * POST /auth/send-otp
   * Validate mobile, generate 6-digit OTP, store with 5-min expiry,
   * return OTP for testing, log OTP_GENERATED.
   */
  sendOTP: async (req, res, next) => {
    try {
      const { mobile } = req.body;

      // Generate OTP
      const { otp, expiresAt } = await otpService.generateOTP(mobile);

      // Mock SMS send
      await smsService.sendOTP(mobile, otp);

      // Log OTP_GENERATED
      await logService.createLog({
        mobile,
        action: LOG_ACTIONS.OTP_GENERATED,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        message: `OTP generated for mobile ${mobile}`,
      });

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully.',
        data: {
          mobile,
          otp, // Returned for testing as per assignment
          expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/verify-otp
   * Verify OTP, check expiry, allow one-time use only, max 3 wrong attempts,
   * generate JWT after success, log success/failure.
   */
  verifyOTP: async (req, res, next) => {
    try {
      const { mobile, otp } = req.body;

      // Verify OTP
      const result = await otpService.verifyOTP(mobile, otp);

      if (!result.success) {
        // Log the appropriate failure event
        await logService.createLog({
          mobile,
          action: LOG_ACTIONS[result.code], // OTP_INVALID or OTP_EXPIRED
          status: 'FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          message: result.message,
        });

        // Also log LOGIN_FAILED
        await logService.createLog({
          mobile,
          action: LOG_ACTIONS.LOGIN_FAILED,
          status: 'FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          message: `Login failed for mobile ${mobile}: ${result.message}`,
        });

        throw new ApiError(400, result.message);
      }

      // OTP verified — log OTP_VERIFIED
      await logService.createLog({
        mobile,
        action: LOG_ACTIONS.OTP_VERIFIED,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        message: `OTP verified for mobile ${mobile}`,
      });

      // Find user by mobile
      const user = await User.findOne({ mobile });

      if (!user) {
        await logService.createLog({
          mobile,
          action: LOG_ACTIONS.LOGIN_FAILED,
          status: 'FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          message: `No user found with mobile ${mobile}`,
        });

        throw new ApiError(404, 'User not found. Please contact an admin to create your account.');
      }

      // Check if user is active — inactive users cannot login
      if (!user.isActive) {
        await logService.createLog({
          userId: user._id,
          mobile,
          action: LOG_ACTIONS.LOGIN_FAILED,
          status: 'FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          message: `Inactive user attempted login: ${mobile}`,
        });

        throw new ApiError(403, 'Account is deactivated. Please contact an admin.');
      }

      // Generate JWT — payload: { userId, mobile, role }
      const accessToken = tokenService.generateAccessToken({
        userId: user._id,
        mobile: user.mobile,
        role: user.role,
      });

      // Generate refresh token (bonus)
      const refreshToken = tokenService.generateRefreshToken({
        userId: user._id,
      });

      // Log LOGIN_SUCCESS
      await logService.createLog({
        userId: user._id,
        mobile,
        action: LOG_ACTIONS.LOGIN_SUCCESS,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        message: `User logged in successfully: ${mobile}`,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            mobile: user.mobile,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /auth/refresh-token (Bonus)
   * Verify refresh token and issue a new access token
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required.');
      }

      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new ApiError(404, 'User not found.');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Account is deactivated.');
      }

      // Generate new access token
      const accessToken = tokenService.generateAccessToken({
        userId: user._id,
        mobile: user.mobile,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully.',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
