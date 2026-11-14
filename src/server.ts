import { createApp } from './app';
import { createDatabase } from './db/database';

const port = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  const db = await createDatabase();
  const app = createApp(db);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
