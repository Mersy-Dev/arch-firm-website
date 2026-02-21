import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { corsMiddleware } from './middleware/cors.middleware';
import { morganLogger } from './middleware/logger.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import apiRouter from './routes/index';

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — must be before other middleware
app.use(corsMiddleware);

// ── Request logging
app.use(morganLogger);

// ── Compression
app.use(compression());

// ── Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Security sanitizers
app.use(mongoSanitize());

// ── Global rate limiting
app.use(globalRateLimit);

// ── Health check (no auth required)
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── All API routes
app.use('/api/v1', apiRouter);

// ── 404 handler (must be after all routes)
app.use(notFound);

// ── Global error handler (must be LAST)
app.use(errorHandler);

export default app;