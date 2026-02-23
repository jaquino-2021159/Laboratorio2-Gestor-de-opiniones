import { Schema, model } from 'mongoose';
import { generateUserId } from '../../helpers/uuid-generator.js';

// aqui defino el esquema de comentarios que se guardará en la base de datos
const commentSchema = new Schema({
  Id: {
    type: String,
    // aqui genero un id único para cada comentario
    default: () => generateUserId(),
    unique: true
  },
  Text: {
    type: String,
    // aqui guardo el texto del comentario
    required: true
  },
  PostId: {
    type: String,
    // aqui guardo el id del post al que pertenece el comentario
    required: true
  },
  UserId: {
    type: String,
    // aqui guardo el id del usuario que hizo el comentario
    required: true
  }
}, {
  // aqui hago que mongoose guarde automaticamente fecha de creación y actualización
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// aqui creo el modelo para poder usar comentarios en la base de datos
export const Comment = model('Comment', commentSchema);