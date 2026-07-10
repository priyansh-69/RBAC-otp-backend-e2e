/**
 * Role constants — matching the assignment exactly
 */
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
};

/**
 * All 10 required log action types from the assignment
 */
const LOG_ACTIONS = {
  OTP_GENERATED: 'OTP_GENERATED',
  OTP_VERIFIED: 'OTP_VERIFIED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  USER_CREATED: 'USER_CREATED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  USER_DELETED: 'USER_DELETED',
};

module.exports = {
  ROLES,
  LOG_ACTIONS,
};
