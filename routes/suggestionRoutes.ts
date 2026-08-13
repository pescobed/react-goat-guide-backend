import { Router } from 'express';
import { verifyAdmin } from '../utils/middleware';
import { 
  createSuggestion, 
  getSuggestions, 
  deleteSuggestion 
} from '../controllers/suggestionController.ts';

const router = Router();

// Public can submit suggestions
router.post('/', createSuggestion);

// ONLY Admins can view or delete suggestions
router.get('/', verifyAdmin, getSuggestions);
router.delete('/:id', verifyAdmin, deleteSuggestion);

export default router;
