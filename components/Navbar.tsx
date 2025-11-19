import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? "text-neon-green border-b-2 border-neon-green shadow-[0_4px_10px_rgba(57,255,20,0.3)]" : "text-gray-400 hover:text-white hover:text-shadow-glow";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-cyber-black/90 backdrop-blur-sm border-b border-cyber-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Area */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 group">
              {/* Swarm Logo Visual */}
              <div className="w-10 h-10 grid grid-cols-2 grid-rows-2 gap-1 transform group-hover:rotate-90 transition-transform duration-500">
                 <div className="bg-neon-green rounded-sm shadow-[0_0_5px_rgba(57,255,20,0.8)]"></div>
                 <div className="bg-white rounded-sm shadow-[0_0_5px_rgba(255,255,255,0.8)] opacity-50 group-hover:opacity-100 transition-opacity delay-75"></div>
                 <div className="bg-white rounded-sm shadow-[0_0_5px_rgba(255,255,255,0.8)] opacity-50 group-hover:opacity-100 transition-opacity delay-150"></div>
                 <div className="bg-neon-green rounded-sm shadow-[0_0_5px_rgba(57,255,20,0.8)]"></div>
              </div>
              
              <div className="flex flex-col justify-center">
                <span className="font-display font-bold text-2xl tracking-[0.2em] text-white group-hover:text-neon-green transition-colors leading-none">
                  SOCIAL
                </span>
                <span className="font-display font-bold text-2xl tracking-[0.2em] text-neon-green group-hover:text-white transition-colors leading-none">
                  SWARM
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 font-mono uppercase tracking-widest text-sm">
            <Link to="/" className={`${isActive('/')} py-2 transition-all duration-200`}>Home</Link>
            
            {!isAuthenticated && (
              <>
                <Link to="/login" className={`${isActive('/login')} py-2 transition-all duration-200`}>Login</Link>
                <Link to="/register" className={`${isActive('/register')} py-2 transition-all duration-200 text-neon-blue`}>Register</Link>
              </>
            )}

            {isAuthenticated && user?.role === UserRole.CREATOR && (
              <Link to="/creators" className={`${isActive('/creators')} py-2 transition-all duration-200`}>Terminal</Link>
            )}

            {isAuthenticated && user?.role === UserRole.BUSINESS && (
              <Link to="/business-dashboard" className={`${isActive('/business-dashboard')} py-2 transition-all duration-200`}>Command</Link>
            )}

            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <Link to="/admin-dashboard" className={`${isActive('/admin-dashboard')} py-2 transition-all duration-200 text-neon-red`}>OVERSEER</Link>
            )}

            {isAuthenticated && (
              <>
                <Link to="/settings" className={`${isActive('/settings')} py-2 transition-all duration-200`}>
                   <i className="fas fa-cog"></i>
                </Link>
                <button onClick={handleLogout} className="text-neon-red hover:text-white border border-transparent hover:border-neon-red px-4 py-1 transition-all uppercase">
                  Disconnect
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-neon-green hover:text-white focus:outline-none">
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cyber-dark border-b border-neon-green p-4 space-y-4 font-mono uppercase">
            <Link to="/" className="block text-gray-300 hover:text-neon-green" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block text-gray-300 hover:text-neon-green" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-neon-blue hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                 {user?.role === UserRole.CREATOR && <Link to="/creators" className="block text-gray-300 hover:text-neon-green" onClick={() => setIsMobileMenuOpen(false)}>Terminal</Link>}
                 {user?.role === UserRole.BUSINESS && <Link to="/business-dashboard" className="block text-gray-300 hover:text-neon-green" onClick={() => setIsMobileMenuOpen(false)}>Command</Link>}
                 {user?.role === UserRole.ADMIN && <Link to="/admin-dashboard" className="block text-neon-red hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>OVERSEER</Link>}
                 <Link to="/settings" className="block text-gray-300 hover:text-neon-green" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
                 <button onClick={handleLogout} className="block text-neon-red w-full text-left">Disconnect</button>
              </>
            )}
        </div>
      )}
    </nav>
  );
};