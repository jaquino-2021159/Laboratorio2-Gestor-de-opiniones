import { randomUUID } from 'crypto';

/*
aqui manejo todos los errores de forma global en la aplicacion
este middleware se ejecuta cuando ocurre un error en alguna ruta
*/
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // muestro el error en consola para poder verlo mientras desarrollo
  console.error('Error:', err);

  // aqui genero un id unico para identificar el error
  const traceId = err.traceId || randomUUID();

  // guardo la fecha y hora del error
  const timestamp = new Date().toISOString();

  // codigo de error si existe
  const errorCode = err.errorCode || null;

  // aqui manejo errores de validacion de mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo cuando el id enviado es invalido
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo errores de datos duplicados en la base de datos
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    return res.status(400).json({
      success: false,
      message: `El ${field} '${value}' ya está en uso`,
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo errores cuando el token JWT es invalido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo cuando el token JWT ya expiró
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo errores cuando el archivo subido es demasiado grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo errores cuando falla la conexion con la base de datos
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // aqui manejo errores personalizados que ya traen un status definido
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Error del servidor',
      errorCode: err.errorCode || null,
      traceId,
      timestamp,
    });
  }

  // si no coincide con ningun caso anterior, se considera error interno
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errorCode,
    traceId,
    timestamp,
  });
};

/*
este middleware se usa cuando alguien intenta entrar a una ruta
que no existe en la API
*/
export const notFound = (req, res) => {
  const traceId = randomUUID();
  const timestamp = new Date().toISOString();

  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    errorCode: null,
    traceId,
    timestamp,
  });
};

/*
este wrapper lo uso para manejar errores en funciones async
asi evito tener try catch en cada controlador
*/
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};