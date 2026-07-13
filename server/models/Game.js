import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    whitePlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blackPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fen: { type: String, default: 'start' },
    pgn: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resultReason: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);