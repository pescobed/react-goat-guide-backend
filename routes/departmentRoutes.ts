import { Router } from 'express';
import { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController';
import { verifyAdmin } from '../utils/middleware';
const router = Router();

// Public routes
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);

// Admin restricted - ADD verifyAdmin HERE
router.post('/', verifyAdmin, createDepartment);
router.put('/:id', verifyAdmin, updateDepartment);
router.delete('/:id', verifyAdmin, deleteDepartment);

export default router;
