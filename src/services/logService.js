const Log = require('../models/Log');

/**
 * Centralized Logging Service
 * Creates log entries for all 10 required events
 */
const logService = {
  /**
   * Create a log entry
   * @param {Object} logData
   * @param {string} logData.userId - User ID (nullable for pre-login events)
   * @param {string} logData.mobile - Mobile number
   * @param {string} logData.action - One of the 10 LOG_ACTIONS
   * @param {string} logData.status - SUCCESS or FAILURE
   * @param {string} logData.ipAddress - Request IP
   * @param {string} logData.userAgent - Request User-Agent header
   * @param {string} logData.message - Descriptive message
   */
  createLog: async ({
    userId = null,
    mobile = null,
    action,
    status,
    ipAddress = null,
    userAgent = null,
    message = null,
  }) => {
    try {
      const log = await Log.create({
        userId,
        mobile,
        action,
        status,
        ipAddress,
        userAgent,
        message,
      });
      return log;
    } catch (error) {
      // Don't let logging failures break the main flow
      console.error('Logging error:', error.message);
    }
  },
};

module.exports = logService;
