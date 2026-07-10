const mongoose = require('mongoose');
const { LOG_ACTIONS } = require('../utils/constants');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  mobile: {
    type: String,
    default: null,
  },
  action: {
    type: String,
    required: true,
    enum: {
      values: Object.values(LOG_ACTIONS),
      message: 'Invalid log action',
    },
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    required: true,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  message: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient querying
logSchema.index({ action: 1 });
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1 });

module.exports = mongoose.model('Log', logSchema);
