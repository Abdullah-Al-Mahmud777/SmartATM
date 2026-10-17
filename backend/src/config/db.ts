import mongoose from 'mongoose';
import { env } from './env';

// Cache the in-flight connection promise so concurrent cold-start invocations
// (and serverless reuses) never open multiple connections.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  // 1 === connected — reuse the live connection.
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
  }

  try {
    await connectionPromise;
    // eslint-disable-next-line no-console
    console.log(`[db] connected to ${mongoose.connection.name}`);
  } catch (err) {
    // Reset so the next invocation can retry instead of caching a rejected promise.
    connectionPromise = null;
    throw err;
  }
};

export const disconnectDB = async (): Promise<void> => {
  connectionPromise = null;
  await mongoose.disconnect();
};
