import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';

import logger from './config/logger.js';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import logRoutes from './routes/log.js';
import recipeRoutes from './routes/recipe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/api/health', async (_req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
      mongoose.connection.close().then(() => {
        logger.info('Closed all connections');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});
