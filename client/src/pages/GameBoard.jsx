import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useGameStore } from '../store/useGameStore';
import { playSound } from '../utils/SoundManager';

export default function GameBoard() {
    const { id: gameId } = useParams();
    const navigate = useNavigate();
    
    // Initialize chess logic
    const [game, setGame] = useState(new Chess());
    
    // Get socket state and actions from Zustand
    const { 
        socket, 
        connectSocket, 
        joinGame, 
        makeMove, 
        fen, 
        updateBoard, 
        players, 
        setPlayers, 
        disconnectSocket 
    } = useGameStore();

   // This forces React to only read the user once when the page loads, not every millisecond.
    const user = useMemo(() => {
        const storedUser = localStorage.getItem('chess_user');
        return storedUser ? JSON.parse(storedUser) : null;
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // 1. Connect Socket and Join Room
        connectSocket();
        joinGame(gameId, user);

        // 2. Listen for initial game state from server
        socket.on('game-state', (data) => {
            const newGame = new Chess();
            if (data.fen !== 'start') newGame.load(data.fen);
            setGame(newGame);
            updateBoard(data.fen);
            setPlayers(data.players);
        });

        // 3. Listen for opponent's moves
        socket.on('receive-move', (data) => {
            playSound('move');
            const newGame = new Chess(data.fen);
            setGame(newGame);
            updateBoard(data.fen);
        });

        // Cleanup when leaving the page
        return () => {
            if (socket) {
                socket.off('game-state');
                socket.off('receive-move');
            }
            if (typeof disconnectSocket === 'function') {
                disconnectSocket();
            }
        };
        // Added missing dependencies to satisfy eslint(react-hooks/exhaustive-deps)
    }, [gameId, socket, connectSocket, joinGame, setPlayers, updateBoard, disconnectSocket, navigate, user]);

    // Handle a piece being dragged and dropped
    const onDrop = (sourceSquare, targetSquare) => {
        const gameCopy = new Chess(game.fen());
        
        try {
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // Always promote to queen for simplicity right now
            });

            // If move is illegal, snap piece back
            if (move === null) return false;

            // If move is legal, update local board
            setGame(gameCopy);
            updateBoard(gameCopy.fen());
            
            // Play sound based on move type
            if (move.captured) {
                playSound('capture');
            } else {
                playSound('move');
            }

            // Broadcast move to server via socket
            makeMove({
                move: move.san,
                fen: gameCopy.fen(),
                pgn: gameCopy.pgn()
            });

            return true;
        } catch (err) {
            // Changed 'error' to 'err' and log it to avoid unused-vars crash
            console.error("Invalid move attempted:", err);
            return false;
        }
    };

    // Find the opponent username from the dynamic players array
    const opponent = players?.find(p => p.userId !== user?.id);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="glass-panel p-8 w-full max-w-3xl flex flex-col items-center">
                
                {/* Opponent Info */}
                <div className="w-full flex justify-between items-center mb-4 text-white">
                    <span className="font-bold text-gray-400">
                        {opponent ? opponent.username : 'Waiting for opponent...'}
                    </span>
                    <span className="font-mono text-sm bg-black/30 px-3 py-1 rounded">10:00</span>
                </div>

                {/* The Chess Board */}
                <div className="w-full max-w-[600px] shadow-[0_0_30px_rgba(0,255,204,0.15)] rounded-lg overflow-hidden">
                    <Chessboard 
                        id="PremiumBoard"
                        position={fen} 
                        onPieceDrop={onDrop}
                        customDarkSquareStyle={{ backgroundColor: '#16213e' }}
                        customLightSquareStyle={{ backgroundColor: '#e2e8f0' }}
                    />
                </div>

                {/* Player Info */}
                <div className="w-full flex justify-between items-center mt-4 text-white">
                    <span className="font-bold text-neonHighlight">{user?.username || 'Player'}</span>
                    <span className="font-mono text-sm bg-black/30 px-3 py-1 rounded border border-neonHighlight/30">10:00</span>
                </div>

            </div>
        </div>
    );
}