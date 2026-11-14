import { Database } from 'sql.js';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createDatabase } from '../../src/db/database';

describe('Tasks REST API + SQLite SQL (Integration Tests)', () => {
  let db: Database;

  beforeEach(async () => {
    db = await createDatabase();
  });

  afterEach(() => {
    db.close();
  });

  it('GET /health should confirm SQLite connection', async () => {
    const app = createApp(db);
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'connected' });
  });

  it('should create, list, fetch, update, and delete a task in SQLite', async () => {
    const app = createApp(db);

    // 1. Create (POST)
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Implementar Pipeline CI', description: 'GitHub Actions + Docker' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data).toMatchObject({
      id: 1,
      title: 'Implementar Pipeline CI',
      description: 'GitHub Actions + Docker',
      completed: false,
    });

    // 2. List (GET)
    const listRes = await request(app).get('/api/tasks');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    // 3. Get by ID (GET /:id)
    const getRes = await request(app).get('/api/tasks/1');
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.title).toBe('Implementar Pipeline CI');

    // 4. Update (PUT /:id)
    const updateRes = await request(app)
      .put('/api/tasks/1')
      .send({ completed: true, title: 'Pipeline CI Validado' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data).toMatchObject({
      id: 1,
      title: 'Pipeline CI Validado',
      completed: true,
    });

    // 5. Delete (DELETE /:id)
    const deleteRes = await request(app).delete('/api/tasks/1');
    expect(deleteRes.status).toBe(204);

    // 6. Confirm deletion (404)
    const notFoundRes = await request(app).get('/api/tasks/1');
    expect(notFoundRes.status).toBe(404);
  });

  it('should return 400 for invalid payloads and invalid ids', async () => {
    const app = createApp(db);

    const badCreate = await request(app).post('/api/tasks').send({ title: 'ab' });
    expect(badCreate.status).toBe(400);

    const badId = await request(app).get('/api/tasks/invalid');
    expect(badId.status).toBe(400);
  });
});
