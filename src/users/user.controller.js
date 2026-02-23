import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

// aqui hice una funcion auxiliar para devolver los datos del usuario pero sin incluir la contraseña
const buildUserResponse = (user) => {
  return {
    id: user.Id,
    name: user.Name,
    surname: user.Surname,
    username: user.Username,
    email: user.Email
  };
};

export const updateOwnProfile = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { name, surname, username, oldPassword, newPassword } = req.body;
    const userId = req.userId; 

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // aqui hago la validacion de la contraseña anterior para mayor seguridad antes de cambiarla
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ success: false, message: 'Debes ingresar la contraseña actual.' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.Password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'La contraseña anterior no coincide.' });
      }
      user.Password = await bcrypt.hash(newPassword, 10);
    }

    // aqui actualizo los datos del usuario si vienen en la peticion
    user.Name = name || user.Name;
    user.Surname = surname || user.Surname;
    user.Username = username || user.Username;

    await user.save();
    return res.status(200).json({ 
      success: true, 
      message: 'Perfil actualizado', 
      user: buildUserResponse(user) 
    });
  })
];

//  aqui deje algunas funciones administrativas para evitar errores en las rutas

export const updateUserRole = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { roleId } = req.body;
    // aqui iria la logica para cambiar el rol de un usuario
    res.status(200).json({ success: true, message: 'Rol actualizado (Simulado)' });
  })
];

export const getUserRoles = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // aqui iria la logica para obtener los roles que tiene un usuario
    res.status(200).json({ success: true, roles: [] });
  })
];

export const getUsersByRole = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { roleName } = req.params;
    // aqui iria la logica para filtrar usuarios segun el rol
    res.status(200).json({ success: true, users: [] });
  })
];

// aqui agregue una funcion extra para buscar un usuario usando su username
export const getUserByUsername = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ 
      where: { Username: username } 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: buildUserResponse(user)
    });
  })
];