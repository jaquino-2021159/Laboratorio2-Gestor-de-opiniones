import { Router } from 'express';
import { createPost, getPosts, updatePost, deletePost } from './post.controller.js'; // 1. Agregamos deletePost a la importación

const router = Router();

router.get('/', getPosts);
router.post('/', ...createPost);
router.put('/:id', ...updatePost);
router.delete('/:id', deletePost); 

export default router;