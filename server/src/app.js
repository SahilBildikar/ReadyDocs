import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables across local dev and Vercel serverless runtimes
dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (_) {}

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();

// CORS configuration supporting localhost, Vercel deployments, and custom domains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('.vercel.app') ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Unified API Router for all endpoints
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/profiles', profileRoutes);
apiRouter.use('/checklists', checklistRoutes);
apiRouter.use('/documents', documentRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ReadyDocs API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root welcome response
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    name: 'ReadyDocs API',
    tagline: 'One visit is enough.',
    health: '/api/health'
  });
});

// Support both /api/... and /... mounting for Vercel serverless functions
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

export default app;
