const ApiError = require('../utils/ApiError');
const logService = require('../services/logService');
const { LOG_ACTIONS } = require('../utils/constants');

/**
 * Role-Based Access Control Middleware
 * Usage: authorize('SUPER_ADMIN', 'ADMIN')
 * If the user's role is not in the allowed list, logs ACCESS_DENIED and returns 403.
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Authentication required.'));
      }

      if (!allowedRoles.includes(req.user.role)) {
        // Log ACCESS_DENIED as required by the assignment
        await logService.createLog({
          userId: req.user.userId,
          mobile: req.user.mobile,
          action: LOG_ACTIONS.ACCESS_DENIED,
          status: 'FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          message: `User with role ${req.user.role} attempted to access ${req.method} ${req.originalUrl}`,
        });

        return next(
          new ApiError(403, 'Access denied. Insufficient permissions.')
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorize;
