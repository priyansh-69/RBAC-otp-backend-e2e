/**
 * Mock SMS Service
 * Simulates sending OTP via SMS.
 * In production, this would integrate with Twilio, MSG91, etc.
 */
const smsService = {
  /**
   * Send OTP to mobile number (mock implementation)
   * Logs the OTP to console for testing
   */
  sendOTP: async (mobile, otp) => {
    console.log(`\n========================================`);
    console.log(`📱 SMS Service (Mock)`);
    console.log(`   To: ${mobile}`);
    console.log(`   OTP: ${otp}`);
    console.log(`========================================\n`);
    return { success: true, message: `OTP sent to ${mobile}` };
  },
};

module.exports = smsService;
