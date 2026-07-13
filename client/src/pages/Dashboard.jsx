import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { playSound } from '../utils/SoundManager';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Load user from local storage
        const storedUser = localStorage.getItem('chess_user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch game history
        const fetchHistory = async () => {
            try {
                const response = await api.get(`/games/history/${parsedUser.id}`);
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

  const handleCreateMatch = async () => {
        playSound('move');
        try {
            // Check for both _id (MongoDB default) and id just to be safe
            const playerId = user._id || user.id; 

            if (!playerId) {
                alert("Player ID is missing. Try logging out and logging back in.");
                return;
            }

            const response = await api.post('/games/create', {
                whitePlayerId: playerId,
                blackPlayerId: playerId, 
                timeControl: '10+0'
            });
            
            const newGame = response.data;
            // Navigate to the active game board room using the MongoDB _id
            navigate(`/game/${newGame._id}`);
        } catch (error) {
            console.error("Failed to create match", error);
            // This will now print the exact backend error to your browser console (F12)
            console.log("Error details:", error.response?.data); 
            alert("Could not create match. Check your F12 Console for details.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('chess_token');
        localStorage.removeItem('chess_user');
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen bg-[#0f172a] text-white flex justify-center items-center">LOADING TERMINAL...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] p-8 text-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Player Stats */}
                <div className="glass-panel p-6 col-span-1 h-fit">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-neonHighlight">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-wide">{user?.username}</h2>
                            <p className="text-neonHighlight font-mono">Rating: {user?.rating || 1200}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleCreateMatch}
                        className="w-full bg-neonHighlight text-black font-bold py-4 px-4 rounded-lg mb-4 hover:bg-white transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,255,204,0.4)]"
                    >
                        INITIATE NEW MATCH
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-transparent border border-red-500 text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        DISCONNECT
                    </button>
                </div>

                {/* Right Column: Match History */}
                <div className="glass-panel p-6 col-span-1 md:col-span-2">
                    <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">RECENT DEPLOYMENTS</h3>
                    
                    {history.length === 0 ? (
                        <p className="text-gray-400 italic">No previous matches found in the database.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((game, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-300">Match #{game._id.slice(-4)}</span>
                                        <span className="ml-4 text-sm text-gray-500">{new Date(game.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`font-mono font-bold ${game.winner === user.id ? 'text-green-400' : game.winner ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {game.winner === user.id ? 'VICTORY' : game.winner ? 'DEFEAT' : 'DRAW'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}