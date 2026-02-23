import rateLimit from 'express-rate-limit';
import { config } from '../configs/config.js';

// aqui creo un limitador general para todas las peticiones de la API
export const requestLimit = rateLimit({
  // tiempo de la ventana en milisegundos donde se cuentan las peticiones
  windowMs: config.rateLimit.windowMs,

  // numero maximo de peticiones permitidas en ese tiempo
  max: config.rateLimit.maxRequests,

  // mensaje que se devuelve cuando se supera el limite
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },

  // usar los headers estandar para informar el limite
  standardHeaders: true,

  // desactivar los headers antiguos
  legacyHeaders: false,

  // aqui manejo la respuesta cuando alguien supera el limite
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

// aqui creo un limitador especifico para las rutas de autenticacion
// como login o registro para evitar muchos intentos seguidos
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,

  // mensaje que se devuelve cuando se supera el limite
  message: {
    success: false,
    message:
      'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
    retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000),
  },

  standardHeaders: true,
  legacyHeaders: false,

  // aqui tambien registro en consola cuando alguien supera el limite
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);

    res.status(429).json({
      success: false,
      message:
        'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
      retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000),
    });
  },
});

// aqui creo un limitador especial para los endpoints que envian emails
// esto es para evitar que alguien mande muchos correos en poco tiempo
export const emailRateLimit = rateLimit({
  // tiempo de espera para el limite (ejemplo: 15 minutos)
  windowMs: config.rateLimit.emailWindowMs,

  // numero maximo de emails que se pueden enviar en ese tiempo
  max: config.rateLimit.emailMaxRequests,

  message: {
    success: false,
    message: 'Demasiados emails enviados, intenta de nuevo en 15 minutos.',
    retryAfter: Math.ceil(config.rateLimit.emailWindowMs / 1000),
  },

  standardHeaders: true,
  legacyHeaders: false,

  // aqui tambien muestro en consola cuando se supera el limite
  handler: (req, res) => {
    console.log(`Email rate limit exceeded for: ${req.body.email || req.ip}`);

    res.status(429).json({
      success: false,
      message: 'Demasiados emails enviados, intenta de nuevo en 15 minutos.',
      retryAfter: Math.ceil(config.rateLimit.emailWindowMs / 1000),
    });
  },
});