import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, Menu, X, Briefcase, UserCheck } from 'lucide-react';
import { Button } from './Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Simple check to hide "Sign In" button if already on dashboard
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Video size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">UGC Connect</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
            Home
          </Link>
          <Link to="/business" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
            For Brands
          </Link>
          <Link to="/creator" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
            For Creators
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {!isDashboard && (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/business">
                <Button size="sm">Post a Job</Button>
              </Link>
            </>
          )}
          {isDashboard && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Logged In
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 shadow-lg">
          <div className="flex flex-col space-y-4">
             <Link 
                to="/" 
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
                onClick={() => setIsMenuOpen(false)}
             >
               Home
             </Link>
             <Link 
                to="/business" 
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
                onClick={() => setIsMenuOpen(false)}
             >
               <Briefcase size={16} /> For Brands
             </Link>
             <Link 
                to="/creator" 
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
                onClick={() => setIsMenuOpen(false)}
             >
               <UserCheck size={16} /> For Creators
             </Link>
             <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Button className="w-full" variant="outline">Sign In</Button>
                <Button className="w-full">Get Started</Button>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};