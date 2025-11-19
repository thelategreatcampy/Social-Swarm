import React from 'react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
     await login(role);
     navigate(role === UserRole.BUSINESS ? '/business-dashboard' : '/creators');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-xl bg-cyber-dark border border-cyber-gray shadow-2xl">
         <h2 className="text-2xl font-bold text-white mb-6 font-mono text-center">ACCESS_TERMINAL</h2>
         <div className="space-y-4">
            <Button onClick={() => handleLogin(UserRole.BUSINESS)} className="w-full bg-neon-blue border-none">Login as Brand</Button>
            <Button onClick={() => handleLogin(UserRole.CREATOR)} className="w-full bg-neon-pink border-none">Login as Creator</Button>
            <Button onClick={() => handleLogin(UserRole.ADMIN)} variant="outline" className="w-full border-gray-600 text-gray-400">Admin Override</Button>
         </div>
      </div>
    </div>
  );
};