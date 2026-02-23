import { Comment } from './comment.model.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

// Aqui cree la funcion para agregar un comentario a un post
export const addComment = [
  validateJWT, // primero valido que el usuario tenga token
  asyncHandler(async (req, res) => {
    const { text, postId } = req.body;
    
    // aqui creo el comentario en la base de datos
    const comment = await Comment.create({
      Text: text,
      PostId: postId,
      UserId: req.userId
    });

    res.status(201).json({ success: true, message: 'Comentario añadido', comment });
  })
];

// esta funcion sirve para actualizar un comentario
export const updateComment = [
  validateJWT, // valido el token antes de continuar
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    
    // aqui busco el comentario por su id
    const comment = await Comment.findOne({ Id: id });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    // aqui verifico que el comentario sea del mismo usuario
    if (comment.UserId !== req.userId) {
      return res.status(403).json({ success: false, message: 'No puedes editar comentarios ajenos' });
    }

    // aqui actualizo el texto del comentario
    comment.Text = text;
    await comment.save();

    res.status(200).json({ success: true, message: 'Comentario actualizado', comment });
  })
];

// esta funcion sirve para eliminar un comentario
export const deleteComment = [
  validateJWT, // valido que el usuario esté autenticado
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // busco el comentario por id
    const comment = await Comment.findOne({ Id: id }); 

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    // verifico que el comentario pertenezca al usuario
    if (comment.UserId !== req.userId) {
      return res.status(403).json({ success: false, message: 'No puedes eliminar comentarios ajenos' });
    }

    // aqui elimino el comentario
    await comment.deleteOne(); 

    res.status(200).json({ success: true, message: 'Comentario eliminado' });
  })
];