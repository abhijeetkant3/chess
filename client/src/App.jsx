import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
// 1. Ensure these imports are active
import Dashboard from './pages/Dashboard';
import GameBoard from './pages/GameBoard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. Ensure these routes exist so React knows where to go */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:id" element={<GameBoard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;