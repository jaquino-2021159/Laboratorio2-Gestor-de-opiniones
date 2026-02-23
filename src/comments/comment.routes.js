import { Router } from 'express';
import { addComment, updateComment, deleteComment } from './comment.controller.js';

const router = Router();

router.post('/', ...addComment);
router.put('/:id', ...updateComment);
router.delete('/:id', ...deleteComment);

export default router;