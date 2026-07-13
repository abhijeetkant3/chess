import Game from '../models/Game.js';
import User from '../models/User.js';

// In-memory cache for fast access to active game sessions
const activeGames = new Map();

export const setupSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        // 1. Join a match room
        socket.on('join-game', async ({ gameId, user }) => {
            // --- SAFETY NET START ---
            if (!user) {
                console.log(`[Safety Net] Blocked a crash: Socket ${socket.id} tried to join ${gameId} without a user object.`);
                return; // Stop execution before it crashes the server!
            }
            // Safely get the ID (works with both MongoDB _id or frontend id)
            const safeUserId = user._id || user.id;
            // --- SAFETY NET END ---

            socket.join(gameId);
            
            // If the game isn't in memory yet, initialize it
            if (!activeGames.has(gameId)) {
                activeGames.set(gameId, {
                    players: [],
                    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                    pgn: ''
                });
            }

            const game = activeGames.get(gameId);

            // Dynamically assign White or Black colors based on who joins first
            // *Updated to use safeUserId*
            const exists = game.players.find(p => p.userId === safeUserId);
            if (!exists && game.players.length < 2) {
                const color = game.players.length === 0 ? 'w' : 'b';
                game.players.push({
                    userId: safeUserId, // *Updated to use safeUserId*
                    username: user.username || 'Unknown Player',
                    socketId: socket.id,
                    color
                });
            }

            // Sync the updated players array and current board state back to the room
            io.to(gameId).emit('game-state', {
                players: game.players,
                fen: game.fen,
                pgn: game.pgn
            });
        });

        // 2. Synchronize Moves Instantly between clients
        socket.on('make-move', async ({ gameId, move, fen, pgn }) => {
            const game = activeGames.get(gameId);
            if (!game) return;

            // Update state in memory cache
            game.fen = fen;
            game.pgn = pgn;

            // Broadcast the exact move data to the opponent room members
            socket.to(gameId).emit('receive-move', { move, fen, pgn });

            // Optional: Periodically auto-save current FEN to MongoDB to handle unexpected player disconnections
            await Game.findByIdAndUpdate(gameId, { fen, pgn });
        });

        // 3. Match Completion (Checkmate, Resignation, or Draw Agreement)
        socket.on('game-over', async ({ gameId, resultReason, winnerId }) => {
            const game = activeGames.get(gameId);
            if (!game) return;

            try {
                // Determine layout details
                const status = 'completed';
                let winner = winnerId || null;

                // 1. Persist the final state to the MongoDB database collection
                await Game.findByIdAndUpdate(gameId, {
                    status,
                    winner,
                    fen: game.fen,
                    pgn: game.pgn,
                    resultReason
                });

                // 2. Adjust player ratings based on the outcome
                const DBGame = await Game.findById(gameId);
                if (DBGame) {
                    const whiteId = DBGame.whitePlayer;
                    const blackId = DBGame.blackPlayer;

                    if (winner) {
                        // Increment win/loss tracks
                        await User.findByIdAndUpdate(winner, { $inc: { wins: 1, rating: 15 } });
                        const loser = winner === whiteId.toString() ? blackId : whiteId;
                        await User.findByIdAndUpdate(loser, { $inc: { losses: 1, rating: -15 } });
                    } else {
                        // Increment draw statuses
                        await User.findByIdAndUpdate(whiteId, { $inc: { draws: 1 } });
                        await User.findByIdAndUpdate(blackId, { $inc: { draws: 1 } });
                    }
                }

                // Notify room members that the match processing concludes successfully
                io.to(gameId).emit('match-ended', { resultReason, winnerId });
                
                // Clear state memory cache allocation
                activeGames.delete(gameId);

            } catch (error) {
                console.error("Error finalizing match:", error);
            }
        });

        // 4. Client Connection Disruption Handling
        socket.on('disconnect', () => {
            console.log(`Socket Disconnected: ${socket.id}`);
            
            // Search memory to see if this socket belongs to an active game player
            for (const [gameId, game] of activeGames.entries()) {
                const disconnectedPlayer = game.players.find(p => p.socketId === socket.id);
                if (disconnectedPlayer) {
                    // Alert remaining match room members of the disconnection event
                    socket.to(gameId).emit('player-disconnected', { 
                        username: disconnectedPlayer.username 
                    });
                    break;
                }
            }
        });
    });
};