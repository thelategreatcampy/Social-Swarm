import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      // Security Check: If trying to use admin email without triggering admin mode, fail silently or generic error
      if (email.toLowerCase() === 'admin@socialswarm.net' && !adminMode) {
         setError('ACCESS DENIED: Invalid Credentials.');
         return;
      }

      setLoading(true);
      const success = await login(email, password);
      setLoading(false);
      
      if (success) {
        const user = JSON.parse(localStorage.getItem('commish_user') || '{}');
        
        if (user.role === UserRole.ADMIN) {
           navigate('/admin-dashboard');
        } else if (user.role === UserRole.BUSINESS) {
           navigate('/business-dashboard');
        } else {
           navigate('/creators');
        }
      } else {
        setError('ACCESS DENIED: Invalid Credentials.');
      }
    }
  };

  const toggleSecureChannel = () => {
    setAdminMode(prev => !prev);
    if (!adminMode) {
      addToast("SECURE CHANNEL OPEN", 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className={`max-w-md w-full bg-cyber-gray border-2 p-1 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative transition-all duration-500 ${adminMode ? 'border-neon-red shadow-[0_0_50px_rgba(255,42,42,0.2)]' : 'border-neon-green shadow-[0_0_50px_rgba(57,255,20,0.1)]'}`}>
        
        {/* Corner accents */}
        <div className={`absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 ${adminMode ? 'border-neon-red' : 'border-neon-green'}`}></div>
        <div className={`absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 ${adminMode ? 'border-neon-red' : 'border-neon-green'}`}></div>
        <div className={`absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 ${adminMode ? 'border-neon-red' : 'border-neon-green'}`}></div>
        
        {/* Invisible Admin Trigger Button - Bottom Right Corner */}
        <div 
          className="absolute bottom-0 right-0 w-8 h-8 z-50 cursor-default" 
          onClick={toggleSecureChannel}
          title="" // No tooltip
        ></div>
        
        <div className={`absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 ${adminMode ? 'border-neon-red' : 'border-neon-green'}`}></div>

        <div className="bg-black/50 p-8 backdrop-blur-sm">
          <div className="text-center mb-8 border-b border-gray-800 pb-4">
            <h1 className={`text-3xl font-display font-bold tracking-widest mb-1 transition-colors ${adminMode ? 'text-neon-red' : 'text-white'}`}>
              {adminMode ? 'OVERSEER PORTAL' : 'ACCESS PORTAL'}
            </h1>
            <p className={`font-mono text-xs ${adminMode ? 'text-neon-red animate-pulse' : 'text-neon-green'}`}>
              {adminMode ? 'ROOT CREDENTIALS REQUIRED' : 'SECURE CONNECTION REQUIRED'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 font-mono">
            <div>
              <label className={`block text-xs mb-2 uppercase tracking-wider ${adminMode ? 'text-neon-red' : 'text-neon-green'}`}>
                >> {adminMode ? 'Root Identity' : 'Identity String'}
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-black border text-white focus:ring-1 focus:outline-none transition-colors placeholder-gray-800 ${adminMode ? 'border-red-900 focus:border-neon-red focus:ring-neon-red' : 'border-gray-700 focus:border-neon-green focus:ring-neon-green'}`}
                placeholder="USER@NET.LOC" 
              />
            </div>
            
            <div>
              <label className={`block text-xs mb-2 uppercase tracking-wider ${adminMode ? 'text-neon-red' : 'text-neon-green'}`}>
                >> {adminMode ? 'Master Key' : 'Access Key'}
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-black border text-white focus:ring-1 focus:outline-none transition-colors placeholder-gray-800 ${adminMode ? 'border-red-900 focus:border-neon-red focus:ring-neon-red' : 'border-gray-700 focus:border-neon-green focus:ring-neon-green'}`}
                placeholder="********" 
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 text-neon-red text-xs border border-neon-red flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" variant={adminMode ? 'danger' : 'primary'} loading={loading}>
              {adminMode ? 'INITIALIZE ROOT' : 'AUTHENTICATE'}
            </Button>

            {!adminMode && (
              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">NEW USER DETECTED?</p>
                <Link to="/register" className="text-neon-blue hover:text-white uppercase tracking-widest text-sm font-bold">
                  >> Initialize Registration
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};