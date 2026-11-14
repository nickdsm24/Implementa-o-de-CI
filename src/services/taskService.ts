import { Database } from 'sql.js';
import { CreateTaskInput, Task, TaskRow, UpdateTaskInput } from '../types/task';
import { mapTaskRow } from './taskValidation';

/**
 * Service layer encapsulating parameterized SQL queries against the tasks table.
 */
export class TaskService {
  constructor(private readonly db: Database) {}

  listAll(): Task[] {
    const stmt = this.db.prepare(
      'SELECT id, title, description, completed, created_at FROM tasks ORDER BY id DESC',
    );
    const rows: TaskRow[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as unknown as TaskRow);
    }
    stmt.free();
    return rows.map(mapTaskRow);
  }

  findById(id: number): Task | null {
    const stmt = this.db.prepare(
      'SELECT id, title, description, completed, created_at FROM tasks WHERE id = ?',
    );
    stmt.bind([id]);
    const row = stmt.step() ? (stmt.getAsObject() as unknown as TaskRow) : undefined;
    stmt.free();
    return row ? mapTaskRow(row) : null;
  }

  create(input: CreateTaskInput): Task {
    this.db.run('INSERT INTO tasks (title, description, completed) VALUES (?, ?, 0)', [
      input.title,
      input.description ?? '',
    ]);

    const idResult = this.db.exec('SELECT last_insert_rowid() AS id');
    const insertedId = Number(idResult[0]?.values[0]?.[0]);
    const created = this.findById(insertedId);

    if (!created) {
      throw new Error('Failed to retrieve newly created task.');
    }
    return created;
  }

  update(id: number, input: UpdateTaskInput): Task | null {
    const existing = this.findById(id);
    if (!existing) {
      return null;
    }

    const nextTitle = input.title ?? existing.title;
    const nextDescription = input.description ?? existing.description;
    const nextCompleted =
      input.completed !== undefined ? (input.completed ? 1 : 0) : existing.completed ? 1 : 0;

    this.db.run('UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?', [
      nextTitle,
      nextDescription,
      nextCompleted,
      id,
    ]);

    return this.findById(id);
  }

  remove(id: number): boolean {
    this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return this.db.getRowsModified() > 0;
  }
}
