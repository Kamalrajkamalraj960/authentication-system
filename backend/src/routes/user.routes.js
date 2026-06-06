import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

// Every route below requires a valid access token.
router.use(authenticate);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile }
 *   patch:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated profile }
 */
router
  .route('/profile')
  .get(userController.getProfile)
  .patch(validate(updateProfileSchema), userController.updateProfile);

export default router;
