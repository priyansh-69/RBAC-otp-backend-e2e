const Log = require('../models/Log');
const { LOG_ACTIONS } = require('../utils/constants');

/**
 * Log Controller
 * Handles log retrieval with pagination and filters
 */
const logController = {
  /**
   * GET /logs
   * Access: SUPER_ADMIN, ADMIN
   * Returns all logs with pagination and optional filters
   * Filters: action, status, userId, startDate, endDate
   */
  getAllLogs: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};
      if (req.query.action) filter.action = req.query.action;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.userId) filter.userId = req.query.userId;
      if (req.query.mobile) filter.mobile = req.query.mobile;

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
          filter.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          filter.createdAt.$lte = new Date(req.query.endDate);
        }
      }

      const [logs, total] = await Promise.all([
        Log.find(filter)
          .select('-__v')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('userId', 'name mobile role'),
        Log.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /logs/login
   * Access: SUPER_ADMIN, ADMIN
   * Returns only login-related logs (LOGIN_SUCCESS and LOGIN_FAILED)
   */
  getLoginLogs: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {
        action: { $in: [LOG_ACTIONS.LOGIN_SUCCESS, LOG_ACTIONS.LOGIN_FAILED] },
      };

      // Optional additional filters
      if (req.query.status) filter.status = req.query.status;
      if (req.query.mobile) filter.mobile = req.query.mobile;

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
          filter.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          filter.createdAt.$lte = new Date(req.query.endDate);
        }
      }

      const [logs, total] = await Promise.all([
        Log.find(filter)
          .select('-__v')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('userId', 'name mobile role'),
        Log.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = logController;
