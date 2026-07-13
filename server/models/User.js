import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rating: { type: Number, default: 1200 }, // Starting Elo
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    avatar: { type: String, default: 'default-avatar.png' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);