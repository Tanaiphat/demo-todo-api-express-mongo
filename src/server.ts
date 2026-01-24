import { app } from './app';
import { env } from './config/env';
import { db } from './config/db';

const startServer = async () => {
  try {
    await db.connect();
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();
