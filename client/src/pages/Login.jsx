import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { playSound } from '../utils/SoundManager';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/auth/login', { email, password });
            
            // Save token and user data
            localStorage.setItem('chess_token', response.data.token);
            localStorage.setItem('chess_user', JSON.stringify(response.data.user));
            
            playSound('move'); // Satisfying click sound on success
            navigate('/dashboard'); // We will build this next
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
            // Optional: play an error sound here if you have one
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
            <div className="glass-panel w-full max-w-md p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">
                    ACCESS <span className="text-neonHighlight">TERMINAL</span>
                </h2>
                
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonHighlight transition-colors duration-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="grandmaster@chess.com"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonHighlight transition-colors duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-chessAccent hover:bg-neonHighlight hover:text-black text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        INITIATE SEQUENCE
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account? <span onClick={() => navigate('/register')} className="text-neonHighlight cursor-pointer hover:underline">Register here</span>
                </p>
            </div>
        </div>
    );
}