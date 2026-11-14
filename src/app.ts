import express, { Express, Request, Response } from 'express';
import { Database } from 'sql.js';
import { createTaskRouter } from './routes/taskRoutes';
import { TaskService } from './services/taskService';

/**
 * Builds the Express application with REST API routes and SQL healthcheck.
 */
export function createApp(db: Database): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    db.exec('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  });

  const taskService = new TaskService(db);
  app.use('/api/tasks', createTaskRouter(taskService));

  return app;
}
