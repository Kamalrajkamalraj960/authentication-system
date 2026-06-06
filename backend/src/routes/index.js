import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Liveness/health probe
 *     responses:
 *       200: { description: Service healthy }
 */
router.get('/health', (_req, res) =>
  res.status(200).json({ success: true, message: 'OK', data: { uptime: process.uptime() } })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
