import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Express => {
  const app = express();

  // Security & Utility Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // allow flexible development and preview
  }));

  app.use(cors({
    origin: '*',
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'MediCare HMS API Gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Mount API v1
  app.use('/api/v1', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
