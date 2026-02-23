import { Post } from './post.model.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

export const createPost = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { title, category, content } = req.body;
    const post = await Post.create({
      Title: title,
      Category: category,
      Content: content,
      UserId: req.userId
    });
    res.status(201).json({ success: true, message: 'Publicación creada', post });
  })
];

export const updatePost = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ success: false, message: 'No existe el post' });
    
    if (post.UserId !== req.userId) {
      return res.status(403).json({ success: false, message: 'No puedes editar posts de otros' });
    }

    await post.update(req.body);
    res.status(200).json({ success: true, message: 'Actualizado correctamente', post });
  })
];

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.findAll();
  res.status(200).json({ success: true, posts });
});

export const deletePost = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    
    if (!post) return res.status(404).json({ success: false, message: 'No existe el post' });

    if (post.UserId !== req.userId) {
      return res.status(403).json({ success: false, message: 'No puedes borrar posts de otros' });
    }

    await post.destroy();
    res.status(200).json({ success: true, message: 'Publicación eliminada correctamente' });
  })
];