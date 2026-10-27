import mongoose from 'mongoose';
import { env } from '../config/env';

let connected = false;

export async function connectToDatabase(): Promise<void> {
  if (connected) return;

  if (!env.mongodbUri) {
    throw new Error(
      'MONGODB_URI is missing. Add your MongoDB Atlas connection string to backend/.env.'
    );
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongodbUri, {
      dbName: env.mongodbDbName,
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      maxPoolSize: 20,
      autoIndex: true,
    });

    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection was established without a database handle.');
    await db.admin().ping();

    connected = true;
    console.log(`[db] connected to MongoDB Atlas database "${env.mongodbDbName}"`);
  } catch (error) {
    connected = false;
    const reason = error instanceof Error ? error.message : String(error);
    console.error(
      `[db] MongoDB Atlas connection failed for database "${env.mongodbDbName}". ` +
        'Check MONGODB_URI, the database user password, and Atlas Network Access IP rules.'
    );
    console.error(`[db] ${reason}`);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

export function databaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}
