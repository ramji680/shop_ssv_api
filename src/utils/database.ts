import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://jarvis:csV99U9dBi02Rjaf@yeldamdatahub.uguun7u.mongodb.net/shop_ssv?retryWrites=true&w=majority&appName=yeldamdatahub';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}; 