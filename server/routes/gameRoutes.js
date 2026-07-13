import express from 'express';
import { createGame, getGameById, getUserGames } from '../controllers/gameController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

// This is the line your code was missing! It defines what 'router' is.
const router = express.Router();

router.post('/create', verifyToken, createGame);
router.get('/:id', verifyToken, getGameById);
router.get('/history/:userId', verifyToken, getUserGames);

export default router;