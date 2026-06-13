import console from 'console';
import mongoose from 'mongoose';
import process from 'process';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI as string;

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
};
