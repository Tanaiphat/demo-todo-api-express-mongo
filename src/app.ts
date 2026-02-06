import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import statsRoutes from './routes/statsRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Expose raw Swagger JSON for verification
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authLimiter, userRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);
app.use('/api/stats', apiLimiter, statsRoutes);

// Global Error Handler (must be last)
app.use(errorHandler);

export { app };
