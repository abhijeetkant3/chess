import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// 1. Import your Routes
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

// 2. Import Socket Logic
import { setupSockets } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 3. Middleware (Strictly applied before routes)
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json()); 

// 4. Mount Routes (This fixes the 404 Error!)
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// 5. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 6. Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

setupSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});