import mysql from 'mysql2/promise';
import { sequelize } from './connection';
// Import model to register it with Sequelize
import '../models/user.sequelize';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'User-Express';

export async function initializeDatabase(): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    // Create database if it doesn't exist
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`Database ${DB_NAME} created or already exists`);

    await connection.end();

    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('Sequelize connection established');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('Users table synchronized successfully');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
