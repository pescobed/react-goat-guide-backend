import { Router } from 'express';
import { 
  getAllLocations, 
  getResourcesByLocation, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from '../controllers/locationController';
import { verifyAdmin } from '../utils/middleware';

const router = Router();

// Public routes
router.get('/', getAllLocations);
router.get('/:id/resources', getResourcesByLocation);

// Protected routes (Admin Dashboard only)
router.post('/', verifyAdmin, createLocation);
router.put('/:id', verifyAdmin, updateLocation);
router.delete('/:id', verifyAdmin, deleteLocation);

export default router;