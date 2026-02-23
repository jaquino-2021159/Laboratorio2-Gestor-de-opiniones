'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { dbConnection as dbMongoConnection } from './dbMongo.js';

// 1. aqui se registran los modelos principales que se van a usar en el sistema de gestion de opiniones
import '../src/users/user.model.js';
import '../src/auth/role.model.js';
import '../src/posts/post.model.js';
import '../src/comments/comment.model.js';

import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

// 2. aqui se importan las rutas que se van a utilizar en la api
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import postRoutes from '../src/posts/post.routes.js';
import commentRoutes from '../src/comments/comment.routes.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  // 3. aqui se definen los endpoints principales que va a tener la api
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  app.use(`${BASE_PATH}/posts`, postRoutes);
  app.use(`${BASE_PATH}/comments`, commentRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Sistema de Gestión de Opiniones API',
    });
  });

  // aqui se maneja el error 404 cuando una ruta no existe
  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3005; // aqui se define el puerto que se va a usar, si no hay en el .env usa el 3005
  app.set('trust proxy', 1);

  try {
    // aqui se hace la conexion a la base de datos postgresql
    await dbConnection();
    console.log('✅ PostgreSQL connected successfully');

    // aqui se hace la conexion a la base de datos mongodb
    await dbMongoConnection();
    console.log('✅ MongoDB connected successfully');

    // aqui se hace el seed de los datos necesarios como los roles
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();

    // aqui se inicializan los middlewares y despues las rutas
    middlewares(app);
    routes(app);

    // aqui se coloca el manejador global de errores
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Check de salud: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error al iniciar el servidor: ${err.message}`);
    process.exit(1);
  }
};