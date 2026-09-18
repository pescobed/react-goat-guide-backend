// tagRoutes.ts
import { Router } from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController';
import { verifyAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getTags);
router.post('/', verifyAdmin, createTag);
router.put('/:id', verifyAdmin, updateTag);
router.delete('/:id', verifyAdmin, deleteTag);

export default router;

// server.ts / app.ts
import tagRoutes from './routes/tagRoutes';
app.use('/api/tags', tagRoutes);