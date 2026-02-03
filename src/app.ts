import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import statsRoutes from './routes/statsRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler (must be last)
app.use(errorHandler);

export { app };
