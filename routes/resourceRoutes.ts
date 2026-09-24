import { Router } from 'express';
import { verifyAdmin } from '../utils/middleware';

import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementViewCount,
  getAdminStats,
  getAdminAll
} from '../controllers/resourceController';

const router = Router();

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Otherwise /:id will match "admin" as an id parameter

// Admin-only routes (specific paths first)
router.get("/admin/stats", verifyAdmin, getAdminStats);
router.get("/admin/all", verifyAdmin, getAdminAll);

// Public routes (anyone can view resources)
router.get('/', getAllResources);
router.get('/:id', getResourceById);
router.patch('/:id/view', incrementViewCount);

// Protected routes (admin only)
router.post('/', verifyAdmin, createResource);
router.put('/:id', verifyAdmin, updateResource);
router.delete('/:id', verifyAdmin, deleteResource);

export default router;
