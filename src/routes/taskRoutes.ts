import { Request, Response, Router } from 'express';
import { TaskService } from '../services/taskService';
import {
  ValidationError,
  parsePositiveId,
  validateCreateTask,
  validateUpdateTask,
} from '../services/taskValidation';

/**
 * Creates Express REST routes for /api/tasks.
 */
export function createTaskRouter(taskService: TaskService): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    const tasks = taskService.listAll();
    res.status(200).json({ data: tasks });
  });

  router.get('/:id', (req: Request, res: Response) => {
    try {
      const id = parsePositiveId(req.params.id);
      const task = taskService.findById(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.status(200).json({ data: task });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.post('/', (req: Request, res: Response) => {
    try {
      const input = validateCreateTask(req.body);
      const task = taskService.create(input);
      res.status(201).json({ data: task });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.put('/:id', (req: Request, res: Response) => {
    try {
      const id = parsePositiveId(req.params.id);
      const input = validateUpdateTask(req.body);
      const updated = taskService.update(id, input);
      if (!updated) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.status(200).json({ data: updated });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const id = parsePositiveId(req.params.id);
      const deleted = taskService.remove(id);
      if (!deleted) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  return router;
}

function handleRouteError(error: unknown, res: Response): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error.' });
}
