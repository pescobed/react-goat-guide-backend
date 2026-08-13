import { Router } from 'express';
import { getAllLocations, getResourcesByLocation } from '../controllers/locationController.ts';

const router = Router();
router.get('/', getAllLocations);
router.get('/:locationName', getResourcesByLocation);

export default router;
