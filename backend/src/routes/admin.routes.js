import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../constants/index.js';
import { idParamSchema, updateRoleSchema, listUsersSchema } from '../validators/auth.validator.js';

const router = Router();

// All admin routes require authentication + the admin role.
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Aggregate user statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats }
 *       403: { description: Access denied }
 */
router.get('/stats', adminController.getStats);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users (paginated, filterable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: role, schema: { type: string, enum: [admin, user] } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated users }
 */
router.get('/users', validate(listUsersSchema), adminController.listUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a user by id
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: User }
 *       404: { description: Not found }
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Deleted }
 */
router
  .route('/users/:id')
  .get(validate(idParamSchema), adminController.getUser)
  .delete(validate(idParamSchema), adminController.deleteUser);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a user's role
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { role: { type: string, enum: [admin, user] } }
 *     responses:
 *       200: { description: Role updated }
 */
router.patch('/users/:id/role', validate(updateRoleSchema), adminController.updateUserRole);

export default router;
