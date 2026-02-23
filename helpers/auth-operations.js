import crypto from 'crypto';
import path from 'path';
import {
  checkUserExists,
  createNewUser,
  findUserByEmailOrUsername,
  updateEmailVerificationToken,
  markEmailAsVerified,
  findUserByEmail,
  updatePasswordResetToken,
  updateUserPassword,
  findUserByEmailVerificationToken,
  findUserByPasswordResetToken,
} from './user-db.js';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../utils/auth-helpers.js';
import { verifyPassword } from '../utils/password-utils.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { sendVerificationEmail } from './email-service.js';
import { generateJWT } from './generate-jwt.js';
import { uploadImage } from './cloudinary-service.js';
import { config } from '../configs/config.js';

const getExpirationTime = (timeString) => {
  const timeValue = parseInt(timeString);
  const timeUnit = timeString.replace(timeValue.toString(), '');

  switch (timeUnit) {
    case 's':
      return timeValue * 1000;
    case 'm':
      return timeValue * 60 * 1000;
    case 'h':
      return timeValue * 60 * 60 * 1000;
    case 'd':
      return timeValue * 24 * 60 * 60 * 1000;
    default:
      return 30 * 60 * 1000; // aqui deje 30 minutos como tiempo por defecto
  }
};

export const registerUserHelper = async (userData) => {
  try {
    const { email, username, password, name, surname, phone, profilePicture } =
      userData;

    // aqui la validacion ya la hace express-validator en las rutas
    const userExists = await checkUserExists(email, username);
    if (userExists) {
      throw new Error(
        'Ya existe un usuario con este email o nombre de usuario'
      );
    }

    let profilePictureToStore = profilePicture;

    if (profilePicture) {
      const uploadPath = config.upload.uploadPath;

      // aqui verifico si la imagen es un archivo local
      const isLocalFile =
        profilePicture.includes('uploads') ||
        profilePicture.includes(uploadPath) ||
        profilePicture.startsWith('./');

      if (isLocalFile) {
        try {
          // aqui normalizo la ruta del archivo antes de subirlo
          // cambio las barras invertidas por normales
          let normalizedPath = profilePicture.replace(/\\/g, '/');

          // si la ruta es relativa la convierto a absoluta
          if (!path.isAbsolute(normalizedPath)) {
            normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
          }

          // aqui genero un nombre random para la imagen
          const ext = path.extname(normalizedPath);
          const randomHex = crypto.randomBytes(6).toString('hex');
          const cloudinaryFileName = `profile-${randomHex}${ext}`;

          // aqui subo la imagen a cloudinary y me devuelve la url
          profilePictureToStore = await uploadImage(
            normalizedPath,
            cloudinaryFileName
          );
        } catch (err) {
          console.error(
            'Error uploading profile picture to Cloudinary during registration:',
            err
          );
          profilePictureToStore = null;
        }
      } else {
        // si ya viene una url de cloudinary la uso directamente
        if (
          profilePicture.startsWith('https://res.cloudinary.com/') ||
          profilePicture.startsWith('http://res.cloudinary.com/')
        ) {
          profilePictureToStore = profilePicture;
        } else {
          // si no es url ni archivo local entonces no guardo nada
          profilePictureToStore = null;
        }
      }
    }

    // aqui creo el usuario en la base de datos
    const newUser = await createNewUser({
      name,
      surname,
      username,
      email,
      password,
      phone,
      profilePicture: profilePictureToStore,
    });

    // aqui genero el token para verificar el email
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // aqui le doy 24 horas al token

    // aqui guardo el token en la base de datos
    await updateEmailVerificationToken(
      newUser.Id,
      verificationToken,
      tokenExpiry
    );

    // aqui envio el email de verificacion en segundo plano
    // lo hago asi para que no detenga la respuesta si tarda
    Promise.resolve()
      .then(() => sendVerificationEmail(email, name, verificationToken))
      .catch((err) =>
        console.error('Async email send (verification) failed:', err)
      );

    // aqui no genero JWT porque el token solo se da cuando el usuario hace login

    return {
      success: true,
      user: buildUserResponse(newUser),
      message:
        'Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.',
      emailVerificationRequired: true,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const loginUserHelper = async (emailOrUsername, password) => {
  try {
    // aqui busco el usuario usando email o username
    const user = await findUserByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // aqui verifico que la contraseña sea correcta
    const isValidPassword = await verifyPassword(user.Password, password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // aqui genero el token JWT para la sesion
    const role = user.UserRoles?.[0]?.Role?.Name || 'USER_ROLE';
    const token = await generateJWT(user.Id.toString(), { role });

    // aqui calculo cuando va a expirar el token
    const expiresInMs = getExpirationTime(process.env.JWT_EXPIRES_IN || '30m');
    const expiresAt = new Date(Date.now() + expiresInMs);

    // aqui preparo los datos del usuario que se van a devolver
    const fullUser = buildUserResponse(user);
    const userDetails = {
      id: fullUser.id,
      username: fullUser.username,
      profilePicture: fullUser.profilePicture,
      role: fullUser.role,
    };

    return {
      success: true,
      message: 'Login exitoso',
      token,
      userDetails,
      expiresAt,
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};