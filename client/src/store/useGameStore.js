import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { autoConnect: false });

export const useGameStore = create((set, get) => ({
    socket: socket,
    gameId: null,
    fen: 'start',
    playerColor: null,
    
    connectSocket: () => {
        if (!socket.connected) socket.connect();
    },
    
    joinGame: (gameId, user) => {
        set({ gameId });
        socket.emit('join-game', gameId, user);
    },

    updateBoard: (fen) => set({ fen }),

    makeMove: (moveInfo) => {
        const { gameId } = get();
        socket.emit('make-move', { gameId, ...moveInfo });
    }
}));