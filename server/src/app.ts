import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import sanitize from 'mongo-sanitize';

import { corsMiddleware } from './middleware/cors.middleware';
import { morganLogger } from './middleware/logger.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import apiRouter from './routes/index';
import serviceRoutes from './routes/service.routes';
// import dashboardRoutes from './routes/dashboard.routes';  
import projectRoutes from './routes/project.routes';

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

// ── MongoDB injection sanitizer
app.use((req, _res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  next();
});

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
app.use("/api/v1/services", serviceRoutes);
// app.use("/api/v1/dashboard", require("./routes/dashboard.routes").default);
app.use("/api/v1/projects", projectRoutes);


// ── 404 handler (must be after all routes)
app.use(notFound);

// ── Global error handler (must be LAST)
app.use(errorHandler);

export default app;