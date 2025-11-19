import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
       <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
       
      <h1 className="text-9xl font-display font-bold text-gray-800 select-none relative z-10">404</h1>
      
      <div className="absolute z-20 bg-black border border-neon-red p-4 shadow-[0_0_30px_rgba(255,42,42,0.4)] animate-pulse">
        <p className="text-neon-red font-mono text-xl font-bold tracking-widest">SIGNAL LOST // NODE NOT FOUND</p>
      </div>
      
      <p className="mt-12 text-gray-500 font-mono max-w-md relative z-10">
        The requested directory does not exist in this sector of the Swarm. The link may be dead or the protocol was terminated.
      </p>
      
      <div className="mt-8 relative z-10">
        <Link to="/">
          <Button variant="outline">Return to Grid</Button>
        </Link>
      </div>
    </div>
  );
};