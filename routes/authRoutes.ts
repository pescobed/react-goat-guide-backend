import { Router } from 'express';
import { login } from '../controllers/authController';
import { getAdminStats, getAdminAll } from '../controllers/resourceController.ts';
import { verifyAdmin } from '../utils/middleware.ts';

const router = Router();

// This is public so you can actually log in
router.post('/login', login);

// PROTECTED: Only works if a valid JWT is sent in the header
router.get('/stats', verifyAdmin, getAdminStats);
router.get('/all', verifyAdmin, getAdminAll);

export default router;
