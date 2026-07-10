const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { ROLES } = require('../utils/constants');

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get all logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [OTP_GENERATED, OTP_VERIFIED, OTP_INVALID, OTP_EXPIRED, LOGIN_SUCCESS, LOGIN_FAILED, ACCESS_DENIED, USER_CREATED, ROLE_UPDATED, USER_DELETED]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILURE]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of logs
 *       403:
 *         description: Access denied
 */
router.get('/', auth, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), logController.getAllLogs);

/**
 * @swagger
 * /logs/login:
 *   get:
 *     summary: Get login logs (LOGIN_SUCCESS and LOGIN_FAILED)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILURE]
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Login logs
 *       403:
 *         description: Access denied
 */
router.get('/login', auth, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), logController.getLoginLogs);

module.exports = router;
