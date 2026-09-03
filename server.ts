import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

// Route Imports
import departmentRoutes from './routes/departmentRoutes';
import resourceRoutes from './routes/resourceRoutes';
import locationRoutes from './routes/locationRoutes';
import authRoutes from './routes/authRoutes';
import suggestionRoutes from './routes/suggestionRoutes';

// Middleware Import
import { verifyAdmin } from './utils/middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection Setup
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test Database Connection via Promise
db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL!');
    connection.release();
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

/** 
 * PUBLIC ROUTES
 * Authentication handled within individual route files
 */
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/suggestions', suggestionRoutes);

/** 
 * PROTECTED ROUTES
 */
app.use('/api/locations', verifyAdmin, locationRoutes);

// Server Entry Point
const PORT = process.env.PORT || 5000;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});