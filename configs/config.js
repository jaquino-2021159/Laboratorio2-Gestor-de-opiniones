import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // configuracion de los tokens jwt que se usan para la autenticacion
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },

  // configuracion del correo smtp para poder enviar emails desde la aplicacion
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    enableSsl: process.env.SMTP_SECURE === 'true', // aqui solo se revisa si el smtp usa ssl o no
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  },

  // configuracion para subir archivos como imagenes
  upload: {
    maxSize: 5 * 1024 * 1024, // tamaño maximo permitido 5mb
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], // tipos de imagen que se permiten
    uploadPath: process.env.UPLOAD_PATH,
  },

  // configuracion de cloudinary donde se guardan las imagenes en la nube
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    baseUrl: process.env.CLOUDINARY_BASE_URL,
    // aqui se revisa si la ruta del avatar ya viene completa en las variables de entorno
    // si no viene completa entonces se arma usando la carpeta y el nombre del archivo
    defaultAvatarPath:
      process.env.CLOUDINARY_DEFAULT_AVATAR &&
      !process.env.CLOUDINARY_DEFAULT_AVATAR.includes('${')
        ? process.env.CLOUDINARY_DEFAULT_AVATAR
        : [
            process.env.CLOUDINARY_FOLDER,
            process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME,
          ]
            .filter(Boolean)
            .join('/'),
    folder: process.env.CLOUDINARY_FOLDER,
  },

  // limites de peticiones para que no se abuse de la api
  rateLimit: {
    // limite general para toda la api
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 20,

    // limite especial para rutas de login o autenticacion
    authWindowMs: 1 * 60 * 1000, // 1 minuto
    authMaxRequests: 5,

    // limite para endpoints que envian correos
    emailWindowMs: 15 * 60 * 1000, // 15 minutos
    emailMaxRequests: 3,
  },

  // configuraciones de seguridad del sistema
  security: {
    saltRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 30 * 60 * 1000,
    passwordMinLength: 8,

    // listas de ips para controlar acceso
    blacklistedIPs: process.env.BLACKLISTED_IPS
      ? process.env.BLACKLISTED_IPS.split(',').map((ip) => ip.trim())
      : [],
    whitelistedIPs: process.env.WHITELISTED_IPS
      ? process.env.WHITELISTED_IPS.split(',').map((ip) => ip.trim())
      : [],
    restrictedPaths: process.env.RESTRICTED_PATHS
      ? process.env.RESTRICTED_PATHS.split(',').map((path) => path.trim())
      : [],
  },

  // configuracion general de la aplicacion
  app: {
    frontendUrl: process.env.FRONTEND_URL,
  },

  // configuracion de cors para controlar que dominios pueden usar la api
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
    adminAllowedOrigins: process.env.ADMIN_ALLOWED_ORIGINS
      ? process.env.ADMIN_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
  },

  // configuracion de los tokens de verificacion
  verification: {
    // tiempo que dura el token de verificacion de email
    emailTokenExpiry:
      (process.env.VERIFICATION_EMAIL_EXPIRY_HOURS
        ? parseInt(process.env.VERIFICATION_EMAIL_EXPIRY_HOURS, 10)
        : 24) *
      60 *
      60 *
      1000,

    // tiempo que dura el token para recuperar contraseña
    passwordResetExpiry:
      (process.env.PASSWORD_RESET_EXPIRY_HOURS
        ? parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS, 10)
        : 1) *
      60 *
      60 *
      1000,
  },
};