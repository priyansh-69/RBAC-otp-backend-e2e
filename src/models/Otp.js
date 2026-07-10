const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits and only numbers',
    },
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v);
      },
      message: 'OTP must be exactly 6 digits',
    },
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  attemptCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: automatically remove expired OTP documents after they expire
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('Otp', otpSchema);
