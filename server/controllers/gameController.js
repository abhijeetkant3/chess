import Game from '../models/Game.js';
import User from '../models/User.js';

// Initialize a new game in the database
export const createGame = async (req, res) => {
    try {
        const { whitePlayerId, blackPlayerId, timeControl } = req.body;

        const newGame = new Game({
            whitePlayer: whitePlayerId,
            blackPlayer: blackPlayerId,
            timeControl: timeControl,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Standard starting position
            pgn: ''
        });

        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create game', error: error.message });
    }
};

// Fetch a specific game by ID (used when reconnecting to a match)
export const getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate('whitePlayer', 'username rating')
            .populate('blackPlayer', 'username rating');
            
        if (!game) return res.status(404).json({ message: 'Game not found' });
        
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching game', error: error.message });
    }
};

// Fetch match history for a specific user
export const getUserGames = async (req, res) => {
    try {
        const userId = req.params.userId;
        const games = await Game.find({
            $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
            status: 'completed'
        }).sort({ createdAt: -1 }).limit(20); // Get last 20 games

        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching match history', error: error.message });
    }
};