'use strict';

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// aqui configure la conexion a postgresql, basicamente para que la api pueda conectarse a la base de datos
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.DB_SQL_LOGGING === 'true' ? console.log : false,
  define: {
    freezeTableName: true, // aqui puse esto para que sequelize use el nombre exaacto de la tabla y no lo cambie a plural
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true, // aqui uso snake_case para que los campos en la base de datoss se vean mas ordnados
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// aqui cree la funcion que se encarga de hacer la conexion a la base de datos
export const dbConnection = async () => {
  try {
    console.log('PostgreSQL | Trying to connect...');

    await sequelize.authenticate();
    console.log('PostgreSQL | Connected to PostgreSQL');
    console.log('PostgreSQL | Connection to database established');

    // aqui hago que los modelos se sincronicen con la base de datos cuando estoy en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const syncLogging =
        process.env.DB_SQL_LOGGING === 'true' ? console.log : false;
      await sequelize.sync({ alter: true, logging: syncLogging });
      console.log('PostgreSQL | Models synchronized with database');
    }
  } catch (error) {
    console.error('PostgreSQL | Could not connect to PostgreSQL');
    console.error('PostgreSQL | Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// aqui manejo el cierre correcto de la conexion cuando el programa se apaga
const gracefulShutdown = async (signal) => {
  console.log(
    `PostgreSQL | Received ${signal}. Closing database connection...`
  );
  try {
    await sequelize.close();
    console.log('PostgreSQL | Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error(
      'PostgreSQL | Error during graceful shutdown:',
      error.message
    );
    process.exit(1);
  }
};

// aqui puse estos manejadores para detectar cuando el programa se termina y asi cerrar bien la conexion
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // esto lo deje para cuando nodemon reinicia el servidor