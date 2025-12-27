import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './db';
import orderRoutes from './routes/orders';
import menuRoutes from './routes/menu';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('QuickServe Backend Running');
});

// Connect to DB and start server
// Health Check
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ status: 'ok', database: dbStatus });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Attempt DB connection after server starts
    connectDB();
});
