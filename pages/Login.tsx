import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        addToast('Access Granted. Welcome back.', 'success');
        // Redirect is handled by effect in protected route or we can force it here
        // But since we don't know the role easily without the user object (which is async updated)
        // We might need to wait or rely on the AuthContext state.
        // However, login returns a boolean, let's check state in a moment or just redirect to /
        // The ProtectedRoute will redirect to specific dashboard if needed, 
        // but let's just go to a safe default.
        navigate('/'); 
      } else {
        addToast('Access Denied: Invalid Credentials', 'error');
      }
    } catch (err) {
      addToast('System Error during authentication', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-xl bg-cyber-dark border border-cyber-gray shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
         {/* Decorative glow */}
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-blue/20 blur-3xl rounded-full group-hover:bg-neon-blue/30 transition-all"></div>

         <h2 className="text-2xl font-bold text-white mb-2 font-mono text-center tracking-wider">ACCESS_TERMINAL</h2>
         <p className="text-center text-slate-400 text-sm mb-8 font-mono">Please identify yourself.</p>

         <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-neon-blue mb-1 uppercase">Email_Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded p-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all font-mono"
                placeholder="operative@socialswarm.net"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neon-blue mb-1 uppercase">Passcode</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded p-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all font-mono"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full bg-neon-blue border-none text-black hover:bg-white">
              AUTHENTICATE
            </Button>

            <div className="text-center text-xs font-mono text-slate-500 pt-4">
               <span className="mr-2">NO_CREDENTIALS?</span>
               <Link to="/register" className="text-neon-pink hover:underline">REGISTER_NEW_ID</Link>
            </div>
            
            <div className="mt-4 p-4 bg-slate-900/50 rounded border border-slate-800 text-xs text-slate-500 font-mono">
              <p className="mb-1 text-slate-400">DEBUG_ACCESS:</p>
              <p>U: admin@socialswarm.net</p>
              <p>P: admin123</p>
            </div>
         </form>
      </div>
    </div>
  );
};