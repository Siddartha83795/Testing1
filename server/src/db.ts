import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || '');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${(error as Error).message}`);
        console.log('Server is running, but database is not connected.');
        // Do not exit, allow server to handle HTTP requests (and report 503)
    }
};
