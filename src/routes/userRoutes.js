const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { validateCreateUser, validateRoleUpdate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', auth, userController.getProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *         description: Filter by active status (true/false)
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Access denied
 */
router.get('/', auth, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), userController.getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mobile
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, MANAGER, USER]
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: User created
 *       403:
 *         description: Access denied
 *       409:
 *         description: User already exists
 */
router.post('/', auth, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), validateCreateUser, userController.createUser);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, MANAGER, USER]
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', auth, authorize(ROLES.SUPER_ADMIN), validateRoleUpdate, userController.updateRole);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete('/:id', auth, authorize(ROLES.SUPER_ADMIN), userController.deleteUser);

module.exports = router;
