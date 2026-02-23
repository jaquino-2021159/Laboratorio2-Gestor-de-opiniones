import { verifyJWT } from '../helpers/generate-jwt.js';
import { findUserById } from '../helpers/user-db.js';

/**
 * Middleware para validar el token JWT
 */
export const validateJWT = async (req, res, next) => {
  try {
    let token =
      req.header('x-token') ||
      req.header('authorization') ||
      req.body.token ||
      req.query.token;

    // Aqui reviso si viene un token en la petición
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token en la petición',
      });
    }

    // Aqui limpio el token por si viene con la palabra Bearer
    token = token.replace(/^Bearer\s+/, '');

    // Aqui verifico que el token sea valido
    const decoded = await verifyJWT(token);

    // Aqui busco al usuario en la base de datos usando el id que viene en el token
    const user = await findUserById(decoded.sub);

    // Si no existe el usuario entonces el token no es valido
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe',
      });
    }

    // Aqui reviso si el usuario sigue activo
    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    // Aqui guardo el usuario en el request para usarlo despues en otras rutas
    req.user = user;
    req.userId = user.Id.toString();

    next();
  } catch (error) {
    console.error('Error validating JWT:', error);

    // Mensaje por defecto si hay error al verificar el token
    let message = 'Error al verificar el token';

    // Aqui reviso si el token ya expiró
    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';

    // Aqui reviso si el token es invalido
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token inválido';
    }

    return res.status(401).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};