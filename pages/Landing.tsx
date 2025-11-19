import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Zap, Globe, Shield } from 'lucide-react';
import { Button } from '../components/Button';

export const Landing: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
           <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-neon-pink to-neon-blue opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-8 flex justify-center">
                 <div className="rounded-full px-3 py-1 text-sm leading-6 text-neon-blue ring-1 ring-neon-blue/20 bg-neon-blue/5 font-mono">
                    SYSTEM_STATUS: ONLINE // FEES_DISABLED
                 </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-mono uppercase">
                Social<span className="text-neon-pink">Swarm</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300 font-light">
                Decentralized influencer marketing protocol. Connect with operatives (creators) who only get paid when the mission is successful (sales).
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/business">
                  <Button size="lg" className="bg-neon-pink hover:bg-pink-600 border-none gap-2 font-mono">
                    INITIATE_PROTOCOL <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/creators">
                  <Button variant="outline" size="lg" className="border-neon-blue text-neon-blue hover:bg-neon-blue/10 font-mono">
                    JOIN_SWARM
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-gray hover:border-neon-pink transition-colors">
               <Zap className="text-neon-pink mb-4" size={32} />
               <h3 className="text-white text-xl font-bold mb-2 font-mono">Zero Latency</h3>
               <p className="text-gray-400">Instant connections. No upfront fees. You only pay for confirmed conversions.</p>
            </div>
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-gray hover:border-neon-blue transition-colors">
               <Shield className="text-neon-blue mb-4" size={32} />
               <h3 className="text-white text-xl font-bold mb-2 font-mono">Secure Core</h3>
               <p className="text-gray-400">Vetted creators. Automated tracking logic. Fraud detection active.</p>
            </div>
            <div className="p-6 rounded-xl bg-cyber-dark border border-cyber-gray hover:border-neon-green transition-colors">
               <Globe className="text-neon-green mb-4" size={32} />
               <h3 className="text-white text-xl font-bold mb-2 font-mono">Global Reach</h3>
               <p className="text-gray-400">Deploy campaigns worldwide. Automated payout distribution.</p>
            </div>
         </div>
      </div>
    </div>
  );
};