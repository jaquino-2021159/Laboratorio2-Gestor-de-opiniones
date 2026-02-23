import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
} from '../../middlewares/validation.js';

const router = Router();

/**
 * Aqui se define la ruta para registrar un nuevo usuario
 * Se aplican varios middlewares como:
 * - limite de intentos
 * - subida de imagen
 * - validaciones de datos
 */
router.post(
  '/register',
  authRateLimit,
  upload.single('profilePicture'),
  handleUploadError,
  validateRegister,
  authController.register
);

/**
 * Ruta para iniciar sesión
 * El usuario puede ingresar con email o username
 * Primero se validan los datos y luego se ejecuta el controlador
 */
router.post('/login', authRateLimit, validateLogin, authController.login);

/**
 * Ruta para verificar el correo del usuario
 * El usuario envía el token que recibió en su email
 */
router.post(
  '/verify-email',
  requestLimit,
  validateVerifyEmail,
  authController.verifyEmail
);

/**
 * Ruta para reenviar el correo de verificación
 * Esto se usa cuando el usuario no recibió el primer email
 */
router.post(
  '/resend-verification',
  authRateLimit,
  validateResendVerification,
  authController.resendVerification
);

/**
 * Ruta para iniciar el proceso de recuperación de contraseña
 * Se envía un email con un token para poder cambiar la contraseña
 */
router.post(
  '/forgot-password',
  authRateLimit,
  validateForgotPassword,
  authController.forgotPassword
);

/**
 * Ruta para cambiar la contraseña
 * El usuario envía el token que recibió en el correo
 * junto con la nueva contraseña
 */
router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  authController.resetPassword
);

/**
 * Ruta para obtener el perfil del usuario autenticado
 * Primero se valida el token JWT
 */
router.get('/profile', validateJWT, authController.getProfile);

/**
 * Ruta para obtener el perfil de un usuario usando su ID
 * El userId se envía en el body de la petición
 */
router.post('/profile/by-id', requestLimit, authController.getProfileById);

/**
 * Ruta para obtener todos los usuarios registrados
 * Normalmente esta ruta es solo para administradores
 */
router.get('/users', authController.getAllUsers);

export default router;