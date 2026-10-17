import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
  // eslint-disable-next-line no-console
  console.log(`[db] connected to ${mongoose.connection.name}`);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
