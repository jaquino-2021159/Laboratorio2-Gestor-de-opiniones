import {
  registerUserHelper,
  loginUserHelper,
  verifyEmailHelper,
  resendVerificationEmailHelper,
  forgotPasswordHelper,
  resetPasswordHelper,
} from '../../helpers/auth-operations.js';
import { getUserProfileHelper } from '../../helpers/profile-operations.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { buildUserResponse } from '../../utils/user-helpers.js';

// Controlador para registrar usuario
export const register = asyncHandler(async (req, res) => {
  try {
    // Aqui agrego la foto de perfil si el usuario subió una
    const userData = {
      ...req.body,
      profilePicture: req.file ? req.file.path : null,
    };

    // Llamo al helper que hace el registro
    const result = await registerUserHelper(userData);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in register controller:', error);

    let statusCode = 400;

    // Si el usuario ya existe se devuelve conflicto
    if (
      error.message.includes('ya está registrado') ||
      error.message.includes('ya está en uso') ||
      error.message.includes('Ya existe un usuario')
    ) {
      statusCode = 409;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el registro',
      error: error.message,
    });
  }
});

// Controlador para login
export const login = asyncHandler(async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Se llama al helper para verificar el login
    const result = await loginUserHelper(emailOrUsername, password);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in login controller:', error);

    let statusCode = 401;

    // Si la cuenta está bloqueada o desactivada
    if (
      error.message.includes('bloqueada') ||
      error.message.includes('desactivada')
    ) {
      statusCode = 423;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el login',
      error: error.message,
    });
  }
});

// Controlador para verificar email
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;

    // Se verifica el token
    const result = await verifyEmailHelper(token);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyEmail controller:', error);

    let statusCode = 400;

    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en la verificación',
      error: error.message,
    });
  }
});

// Controlador para reenviar verificación de correo
export const resendVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const result = await resendVerificationEmailHelper(email);

    // Se revisa si hubo error en el proceso
    if (!result.success) {
      if (result.message.includes('no encontrado')) {
        return res.status(404).json(result);
      }

      if (result.message.includes('ya ha sido verificado')) {
        return res.status(400).json(result);
      }

      // Error al enviar email
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resendVerification controller:', error);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

// Controlador para recuperar contraseña
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const result = await forgotPasswordHelper(email);

    // Siempre devuelve success por seguridad
    // pero si el correo no se pudo enviar devuelve error
    if (!result.success && result.data?.initiated === false) {
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

// Controlador para cambiar contraseña
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await resetPasswordHelper(token, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resetPassword controller:', error);

    let statusCode = 400;

    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al resetear contraseña',
      error: error.message,
    });
  }
});

// Obtener perfil del usuario autenticado
export const getProfile = asyncHandler(async (req, res) => {
  // userId viene del middleware que valida el token
  const userId = req.userId;

  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

// Obtener perfil usando un ID enviado en el body
export const getProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Si no mandan el userId se devuelve error
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'El userId es requerido',
    });
  }

  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

// Obtener todos los usuarios
export const getAllUsers = asyncHandler(async (req, res) => {
  // Se importa la función que trae los usuarios desde la base de datos
  const { getAllUsers: getAllUsersFromDb } = await import('../../helpers/user-db.js');

  const users = await getAllUsersFromDb();

  // Se formatea la respuesta de cada usuario
  const usersResponse = users.map(buildUserResponse);

  return res.status(200).json({
    success: true,
    message: 'Usuarios obtenidos exitosamente',
    data: usersResponse,
    total: usersResponse.length,
  });
});