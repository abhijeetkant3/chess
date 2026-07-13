import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { playSound } from '../utils/SoundManager';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await api.post('/auth/register', { username, email, password });
            playSound('move');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
            <div className="glass-panel w-full max-w-md p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">
                    CREATE <span className="text-neonHighlight">PROFILE</span>
                </h2>
                
                {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Username</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonHighlight" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonHighlight" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonHighlight" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-chessAccent hover:bg-neonHighlight hover:text-black text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">REGISTER</button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account? <span onClick={() => navigate('/login')} className="text-neonHighlight cursor-pointer hover:underline">Login here</span>
                </p>
            </div>
        </div>
    );
}