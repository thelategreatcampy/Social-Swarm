import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Zap, Terminal } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-cyber-gray bg-cyber-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-cyber-gray text-neon-pink group-hover:bg-neon-pink group-hover:text-white transition-all">
                <Terminal size={20} />
              </div>
              <span className="text-xl font-mono font-bold text-white tracking-tighter">SOCIAL<span className="text-neon-blue">SWARM</span></span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-neon-blue transition-colors">Network</Link>
              <Link to="/business" className="text-sm font-medium text-gray-300 hover:text-neon-blue transition-colors">Protocol</Link>
              <Link to="/creators" className="text-sm font-medium text-gray-300 hover:text-neon-blue transition-colors">Operatives</Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
               <div className="flex items-center gap-2 text-xs font-mono text-neon-green">
                  <span className="h-2 w-2 bg-neon-green rounded-full animate-pulse"></span>
                  SESSION_ACTIVE
               </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-cyber-gray text-gray-300 hover:border-neon-blue hover:text-neon-blue">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-neon-pink hover:bg-pink-600 text-white border-none">Join Network</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-cyber-dark border-b border-cyber-gray">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 font-mono">
            <Link to="/" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-cyber-gray hover:text-white">Network</Link>
            <Link to="/business" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-cyber-gray hover:text-white">Protocol</Link>
            <Link to="/creators" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-cyber-gray hover:text-white">Operatives</Link>
            <div className="mt-4 border-t border-cyber-gray pt-4 flex flex-col gap-2">
               <Link to="/login" className="block text-center py-2 text-gray-300">Login</Link>
               <Link to="/register" className="block text-center py-2 bg-neon-pink text-white rounded">Join Network</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};