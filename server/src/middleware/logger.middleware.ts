import morgan from 'morgan';

// 'dev' format: GET /api/v1/projects 200 42ms
// 'combined' format: full Apache-style log for production
export const morganLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
);