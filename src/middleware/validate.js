const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * Validation middleware functions
 * Validates request body fields according to assignment rules
 */

/**
 * Validate mobile number: required, exactly 10 digits, numbers only
 */
const validateMobile = (req, res, next) => {
  const { mobile } = req.body;

  if (!mobile) {
    return next(new ApiError(400, 'Mobile number is required.'));
  }

  if (typeof mobile !== 'string') {
    return next(new ApiError(400, 'Mobile number must be a string.'));
  }

  if (!/^\d{10}$/.test(mobile)) {
    return next(
      new ApiError(
        400,
        'Mobile number must be exactly 10 digits and only numbers.'
      )
    );
  }

  next();
};

/**
 * Validate OTP: required, exactly 6 digits
 */
const validateOtp = (req, res, next) => {
  const { mobile, otp } = req.body;

  if (!mobile) {
    return next(new ApiError(400, 'Mobile number is required.'));
  }

  if (!/^\d{10}$/.test(mobile)) {
    return next(
      new ApiError(
        400,
        'Mobile number must be exactly 10 digits and only numbers.'
      )
    );
  }

  if (!otp) {
    return next(new ApiError(400, 'OTP is required.'));
  }

  if (typeof otp !== 'string') {
    return next(new ApiError(400, 'OTP must be a string.'));
  }

  if (!/^\d{6}$/.test(otp)) {
    return next(new ApiError(400, 'OTP must be exactly 6 digits.'));
  }

  next();
};

/**
 * Validate user creation: name and mobile required, role must be valid
 */
const validateCreateUser = (req, res, next) => {
  const { name, mobile, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new ApiError(400, 'Name is required.'));
  }

  if (!mobile) {
    return next(new ApiError(400, 'Mobile number is required.'));
  }

  if (!/^\d{10}$/.test(mobile)) {
    return next(
      new ApiError(
        400,
        'Mobile number must be exactly 10 digits and only numbers.'
      )
    );
  }

  const allowedRoles = Object.values(ROLES);
  if (role && !allowedRoles.includes(role)) {
    return next(
      new ApiError(
        400,
        `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
      )
    );
  }

  next();
};

/**
 * Validate role update: role must be one of the allowed values
 */
const validateRoleUpdate = (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    return next(new ApiError(400, 'Role is required.'));
  }

  const allowedRoles = Object.values(ROLES);
  if (!allowedRoles.includes(role)) {
    return next(
      new ApiError(
        400,
        `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
      )
    );
  }

  next();
};

module.exports = {
  validateMobile,
  validateOtp,
  validateCreateUser,
  validateRoleUpdate,
};
