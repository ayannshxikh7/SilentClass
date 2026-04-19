import mongoose from 'mongoose';

export const connectDb = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/silentclass';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed', error.message);
  }
};
