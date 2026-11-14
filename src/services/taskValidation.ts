import { CreateTaskInput, Task, TaskRow, UpdateTaskInput } from '../types/task';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates and normalizes payload for creating a task.
 */
export function validateCreateTask(input: unknown): CreateTaskInput {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Request body must be a JSON object.');
  }

  const record = input as Record<string, unknown>;
  const rawTitle = record.title;

  if (typeof rawTitle !== 'string' || rawTitle.trim().length < 3) {
    throw new ValidationError('Field "title" is required and must have at least 3 characters.');
  }

  if (rawTitle.trim().length > 120) {
    throw new ValidationError('Field "title" must not exceed 120 characters.');
  }

  const rawDescription = record.description;
  if (rawDescription !== undefined && typeof rawDescription !== 'string') {
    throw new ValidationError('Field "description" must be a string.');
  }

  return {
    title: rawTitle.trim(),
    description: typeof rawDescription === 'string' ? rawDescription.trim() : '',
  };
}

/**
 * Validates and normalizes payload for updating a task.
 */
export function validateUpdateTask(input: unknown): UpdateTaskInput {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Request body must be a JSON object.');
  }

  const record = input as Record<string, unknown>;
  const result: UpdateTaskInput = {};

  if (record.title !== undefined) {
    if (typeof record.title !== 'string' || record.title.trim().length < 3) {
      throw new ValidationError('Field "title" must be a string with at least 3 characters.');
    }
    if (record.title.trim().length > 120) {
      throw new ValidationError('Field "title" must not exceed 120 characters.');
    }
    result.title = record.title.trim();
  }

  if (record.description !== undefined) {
    if (typeof record.description !== 'string') {
      throw new ValidationError('Field "description" must be a string.');
    }
    result.description = record.description.trim();
  }

  if (record.completed !== undefined) {
    if (typeof record.completed !== 'boolean') {
      throw new ValidationError('Field "completed" must be a boolean.');
    }
    result.completed = record.completed;
  }

  if (
    result.title === undefined &&
    result.description === undefined &&
    result.completed === undefined
  ) {
    throw new ValidationError('At least one field (title, description, completed) is required.');
  }

  return result;
}

/**
 * Parses and validates a positive integer route parameter.
 */
export function parsePositiveId(rawId: unknown): number {
  if (typeof rawId !== 'string') {
    throw new ValidationError('Invalid task id. It must be a positive integer.');
  }
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError('Invalid task id. It must be a positive integer.');
  }
  return parsed;
}

/**
 * Maps a raw SQLite row to the public Task model.
 */
export function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}
