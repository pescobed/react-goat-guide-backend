import { Router } from 'express';
import { 
  getAllBuildings, 
  getLocationsByBuilding, 
  createBuilding, 
  updateBuilding, 
  deleteBuilding 
} from '../controllers/buildingController';
import { verifyAdmin } from '../utils/middleware';

const router = Router();

// Public routes (Students / Visitors)
router.get('/', getAllBuildings);
router.get('/:id/locations', getLocationsByBuilding);

// Protected routes (Admin Dashboard only)
router.post('/', verifyAdmin, createBuilding);
router.put('/:id', verifyAdmin, updateBuilding);
router.delete('/:id', verifyAdmin, deleteBuilding);

export default router;