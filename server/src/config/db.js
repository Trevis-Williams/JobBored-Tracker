import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  } catch (err) {
    logger.fatal({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
};

export default connectDB;
