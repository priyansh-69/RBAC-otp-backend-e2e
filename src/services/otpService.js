const Otp = require('../models/Otp');

/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */
const otpService = {
  /**
   * Generate a 6-digit OTP and store it in the database
   * Invalidates any previous unused OTPs for the same mobile
   */
  generateOTP: async (mobile) => {
    // Invalidate all previous unused OTPs for this mobile
    await Otp.updateMany(
      { mobile, isUsed: false },
      { $set: { isUsed: true } }
    );

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry (configurable via env, default 5 minutes)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Store OTP
    const otpRecord = await Otp.create({
      mobile,
      otp,
      expiresAt,
      isUsed: false,
      attemptCount: 0,
    });

    return { otp, expiresAt, otpId: otpRecord._id };
  },

  /**
   * Verify an OTP
   * Checks: exists, not expired, not used, max 3 wrong attempts
   * Returns: { success, message, otpRecord }
   */
  verifyOTP: async (mobile, otp) => {
    // Find the latest unused OTP for this mobile
    const otpRecord = await Otp.findOne({
      mobile,
      isUsed: false,
    }).sort({ createdAt: -1 });

    // No OTP found
    if (!otpRecord) {
      return {
        success: false,
        message: 'No OTP found for this mobile number. Please request a new OTP.',
        code: 'OTP_INVALID',
      };
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
        code: 'OTP_EXPIRED',
      };
    }

    // Check if max attempts exceeded (max 3 wrong attempts)
    if (otpRecord.attemptCount >= 3) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return {
        success: false,
        message: 'Maximum OTP verification attempts exceeded. Please request a new OTP.',
        code: 'OTP_INVALID',
      };
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      otpRecord.attemptCount += 1;
      await otpRecord.save();
      return {
        success: false,
        message: `Invalid OTP. ${3 - otpRecord.attemptCount} attempt(s) remaining.`,
        code: 'OTP_INVALID',
      };
    }

    // OTP is valid — mark as used (one-time use)
    otpRecord.isUsed = true;
    await otpRecord.save();

    return {
      success: true,
      message: 'OTP verified successfully.',
      code: 'OTP_VERIFIED',
    };
  },
};

module.exports = otpService;
