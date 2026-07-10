const User = require('../models/User');
const logService = require('../services/logService');
const ApiError = require('../utils/ApiError');
const { LOG_ACTIONS } = require('../utils/constants');

/**
 * User Controller
 * Handles user CRUD operations with RBAC
 */
const userController = {
  /**
   * GET /users/profile
   * Access: Any logged-in user
   * Returns the logged-in user's own profile
   */
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).select('-__v');

      if (!user) {
        throw new ApiError(404, 'User not found.');
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /users
   * Access: SUPER_ADMIN, ADMIN, MANAGER
   * Returns all users (with pagination)
   */
  getAllUsers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Optional filters
      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

      const [users, total] = await Promise.all([
        User.find(filter).select('-__v').skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
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
   * POST /users
   * Access: SUPER_ADMIN, ADMIN
   * Create a new user
   */
  createUser: async (req, res, next) => {
    try {
      const { name, mobile, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        throw new ApiError(409, 'User with this mobile number already exists.');
      }

      const user = await User.create({
        name,
        mobile,
        role: role || 'USER',
      });

      // Log USER_CREATED
      await logService.createLog({
        userId: req.user.userId,
        mobile: user.mobile,
        action: LOG_ACTIONS.USER_CREATED,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        message: `User created: ${user.name} (${user.mobile}) with role ${user.role} by ${req.user.role}`,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /users/:id/role
   * Access: SUPER_ADMIN only
   * Update a user's role
   */
  updateRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await User.findById(id);

      if (!user) {
        throw new ApiError(404, 'User not found.');
      }

      const oldRole = user.role;
      user.role = role;
      await user.save();

      // Log ROLE_UPDATED
      await logService.createLog({
        userId: req.user.userId,
        mobile: user.mobile,
        action: LOG_ACTIONS.ROLE_UPDATED,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        message: `Role updated for user ${user.name} (${user.mobile}): ${oldRole} → ${role}`,
      });

      res.status(200).json({
        success: true,
        message: 'User role updated successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /users/:id
   * Access: SUPER_ADMIN only
   * Delete a user
   */
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        throw new ApiError(404, 'User not found.');
      }

      // Prevent deleting yourself
      if (user._id.toString() === req.user.userId.toString()) {
        throw new ApiError(400, 'You cannot delete your own account.');
      }

      await User.findByIdAndDelete(id);

      // Log USER_DELETED
      await logService.createLog({
        userId: req.user.userId,
        mobile: user.mobile,
        action: LOG_ACTIONS.USER_DELETED,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        message: `User deleted: ${user.name} (${user.mobile}) by ${req.user.role}`,
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
