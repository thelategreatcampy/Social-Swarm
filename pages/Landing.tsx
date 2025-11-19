import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-32 px-4 overflow-hidden border-b border-neon-blue/30 bg-[url('https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="absolute inset-0 bg-cyber-black/90 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block border border-neon-green bg-neon-green/10 px-4 py-1 mb-8 transform skew-x-[-10deg]">
            <span className="text-neon-green font-mono text-sm tracking-[0.2em] uppercase font-bold skew-x-[10deg] inline-block">
              Protocol: Zero_Overhead
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter mb-6 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            The <span className="text-neon-pink inline-block transform -skew-x-6 underline decoration-4 decoration-neon-blue underline-offset-8">Swarm</span><br />
            Is Waiting
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-mono max-w-3xl mx-auto mb-12 leading-relaxed border-l-4 border-neon-blue pl-6 text-left md:text-center md:border-l-0 md:pl-0">
            The era of paying for "exposure" is terminated. <br className="hidden md:block"/>
            <span className="text-neon-green font-bold">Social Swarm</span> is the pure-commission network where businesses pay only for results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/register?role=BUSINESS">
              <Button size="lg" variant="primary" className="w-72 h-16 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                <span className="flex flex-col items-center leading-none py-1">
                  <span className="text-[10px] font-mono tracking-widest opacity-80 mb-1">HIRE THE SWARM</span>
                  <span className="text-lg font-bold">I AM A BUSINESS</span>
                </span>
              </Button>
            </Link>
            <Link to="/register?role=CREATOR">
              <Button size="lg" variant="outline" className="w-72 h-16">
                <span className="flex flex-col items-center leading-none py-1">
                  <span className="text-[10px] font-mono tracking-widest opacity-80 mb-1">JOIN THE NETWORK</span>
                  <span className="text-lg font-bold">I AM A CREATOR</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* "The Glitch" - Free Exposure Value Prop */}
      <section className="py-20 bg-black border-b border-gray-800 relative overflow-hidden">
        <div className="absolute -right-20 top-10 text-[200px] font-display font-black text-white opacity-5 select-none pointer-events-none">
          ROI
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
           <div className="bg-cyber-gray border-l-4 border-neon-yellow p-8 md:p-12 shadow-[0_0_40px_rgba(252,238,10,0.1)]">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-1/3">
                  <h2 className="text-4xl font-display font-bold text-white uppercase leading-none">
                    The <span className="text-neon-yellow">Reach</span><br/>Anomaly
                  </h2>
                  <p className="text-xs font-mono text-gray-500 mt-2">SYSTEM EXPLOIT DETECTED</p>
                </div>
                <div className="md:w-2/3 font-mono text-gray-300 space-y-4">
                  <p className="text-lg">
                    <strong className="text-white">Here is the math that breaks the system:</strong> When a creator posts your product, you get thousands of impressions, brand awareness, and traffic.
                  </p>
                  <p className="text-lg">
                    In "Legacy Systems" (Influencer Agencies), you pay for those views. <br/>
                    <span className="text-neon-yellow">In the Swarm, you pay $0.00.</span>
                  </p>
                  <div className="bg-black/50 p-4 border border-gray-700 mt-4">
                    <p className="text-sm text-neon-green">>> IF (Sales == 0) THEN (Cost = $0)</p>
                    <p className="text-sm text-neon-green">>> BUT (Brand_Reach == 10,000+)</p>
                    <p className="text-sm text-white mt-2">Result: You captured attention for free. We only charge you when the register rings.</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Trust Protocol - Watchdog Explanation */}
      <section className="py-20 bg-cyber-dark border-b border-gray-800">
         <div className="max-w-7xl mx-auto px-4">
            <div className="bg-black border border-neon-blue p-8 md:p-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-slideIn"></div>
               <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="md:w-1/2">
                     <div className="flex items-center gap-4 mb-4">
                        <i className="fas fa-shield-alt text-4xl text-neon-blue"></i>
                        <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Non-Custodial Architecture</h3>
                     </div>
                     <h4 className="text-neon-blue font-mono text-lg mb-4">"How do I know my funds are safe?"</h4>
                     <p className="text-gray-400 font-mono leading-relaxed">
                        Social Swarm operates on a strict <span className="text-white font-bold">Read-Only Scope</span>.
                        <br/><br/>
                        When you connect your store, our API token is cryptographically restricted to <strong>viewing orders</strong> only. 
                        <br/><br/>
                        We physically <strong>cannot</strong> move your money, edit your products, or touch your inventory. You retain 100% custody of your funds at all times, manually releasing commissions only after sales are verified.
                     </p>
                  </div>
                  <div className="md:w-1/2 relative">
                      <div className="border border-gray-700 bg-gray-900 p-6 font-mono text-xs">
                         <p className="text-gray-500 mb-2">>> SECURITY AUDIT</p>
                         <p className="text-neon-green flex justify-between"><span>ACCESS_READ_ORDERS</span> <span>[GRANTED]</span></p>
                         <p className="text-neon-green flex justify-between"><span>ACCESS_READ_PRODUCTS</span> <span>[GRANTED]</span></p>
                         <div className="border-t border-gray-800 my-2"></div>
                         <p className="text-red-500 flex justify-between opacity-70"><span>ACCESS_WRITE_ORDERS</span> <span>[DENIED]</span></p>
                         <p className="text-red-500 flex justify-between opacity-70"><span>ACCESS_MANAGE_FUNDS</span> <span>[DENIED]</span></p>
                         <p className="text-red-500 flex justify-between opacity-70"><span>ACCESS_BANKING_INFO</span> <span>[DENIED]</span></p>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Comparison / The Problem */}
      <section className="py-24 bg-cyber-dark relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-widest mb-4">System Diagnostics</h2>
            <div className="h-1 w-24 bg-neon-blue mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* The Old Way */}
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-500">
              <div className="border border-neon-red/30 bg-red-900/5 p-8 h-full relative">
                <div className="absolute top-0 right-0 bg-neon-red/20 text-neon-red text-xs font-bold px-3 py-1 font-mono uppercase">Legacy Protocol</div>
                <h3 className="text-2xl font-display font-bold text-red-500 mb-6 uppercase">Traditional Marketing</h3>
                <ul className="space-y-4 font-mono text-gray-400">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-times text-red-500 mt-1"></i>
                    <span>Upfront fees ($1000+) for a single video post.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-times text-red-500 mt-1"></i>
                    <span>Paying for "Likes" and "Views" that don't convert.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-times text-red-500 mt-1"></i>
                    <span>Lengthy negotiation processes for every single post.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-times text-red-500 mt-1"></i>
                    <span>High risk: You pay even if the product flops.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* The Swarm Way */}
            <div className="transform md:-translate-y-4">
              <div className="border-2 border-neon-green bg-neon-green/5 p-8 h-full relative shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                <div className="absolute top-0 right-0 bg-neon-green text-black text-xs font-bold px-3 py-1 font-mono uppercase">Swarm Protocol</div>
                <h3 className="text-2xl font-display font-bold text-neon-green mb-6 uppercase">Social Swarm</h3>
                <ul className="space-y-4 font-mono text-gray-200">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-neon-green mt-1"></i>
                    <span><strong className="text-white">Performance Only:</strong> You pay a % of the sale. Period.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-neon-green mt-1"></i>
                    <span><strong className="text-white">Zero Overhead:</strong> No listing fees. No monthly subscriptions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-neon-green mt-1"></i>
                    <span><strong className="text-white">Instant Activation:</strong> Contracts are standardized and automatic.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-neon-green mt-1"></i>
                    <span><strong className="text-white">Verified Sales:</strong> Watchdog API guarantees transparency.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Target Value Prop */}
      <section className="py-24 bg-cyber-black border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid md:grid-cols-2 gap-0 items-stretch">
              
              {/* For Business */}
              <div className="bg-cyber-gray border-r border-gray-800 p-12 hover:bg-gray-900 transition-colors group flex flex-col h-full">
                 {/* Top Section - Flex Grow ensures lists align at bottom */}
                 <div className="flex-grow">
                   <div className="w-16 h-16 bg-black border border-neon-blue flex items-center justify-center text-3xl text-neon-blue mb-6 group-hover:scale-110 transition-transform">
                     <i className="fas fa-building"></i>
                   </div>
                   <h3 className="text-3xl font-display font-bold text-white mb-4 uppercase">For Corporations</h3>
                   <p className="font-mono text-gray-400 mb-6 leading-relaxed">
                     You have products. You need volume. Stop negotiating with influencers who demand payment before proving their worth. Upload your campaign parameters and let the Swarm compete for the bounty.
                   </p>
                 </div>
                 
                 {/* List Stats */}
                 <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-sm font-mono border-b border-gray-800 pb-1">
                     <span className="text-gray-500">RISK FACTOR</span>
                     <span className="text-neon-green">0%</span>
                   </div>
                   <div className="flex justify-between text-sm font-mono border-b border-gray-800 pb-1">
                     <span className="text-gray-500">COST PER IMPRESSION</span>
                     <span className="text-neon-green">$0.00</span>
                   </div>
                   <div className="flex justify-between text-sm font-mono border-b border-gray-800 pb-1">
                     <span className="text-gray-500">SALES FORCE</span>
                     <span className="text-neon-green">UNLIMITED</span>
                   </div>
                 </div>
                 
                 {/* Button */}
                 <div className="pt-8">
                   <Link to="/register?role=BUSINESS">
                    <Button variant="outline" className="w-full">Initialize Business Account</Button>
                   </Link>
                 </div>
              </div>

              {/* For Creators */}
              <div className="bg-cyber-gray p-12 hover:bg-gray-900 transition-colors group flex flex-col h-full">
                 {/* Top Section */}
                 <div className="flex-grow">
                   <div className="w-16 h-16 bg-black border border-neon-pink flex items-center justify-center text-3xl text-neon-pink mb-6 group-hover:scale-110 transition-transform">
                     <i className="fas fa-user-astronaut"></i>
                   </div>
                   <h3 className="text-3xl font-display font-bold text-white mb-4 uppercase">For Creators (Netrunners)</h3>
                   <p className="font-mono text-gray-400 mb-6 leading-relaxed">
                     Because the businesses pay $0 in fees to be here, the commission rates are significantly higher than standard affiliate programs. No approval delays. Grab the link, create the content, keep the lion's share.
                   </p>
                 </div>

                 {/* List Stats - Aligned with Business List */}
                 <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-sm font-mono border-b border-gray-800 pb-1">
                     <span className="text-gray-500">EARNING POTENTIAL</span>
                     <span className="text-neon-pink">UNCAPPED</span>
                   </div>
                   <div className="flex justify-between text-sm font-mono border-b border-gray-800 pb-1">
                     <span className="text-gray-500">PAYOUT SPEED</span>
                     <span className="text-neon-pink">DIRECT</span>
                   </div>
                   <div className="flex justify-between text-sm font-mono border-b border-gray-800 pb-1">
                     <span className="text-gray-500">CONTRACTS</span>
                     <span className="text-neon-pink">INSTANT</span>
                   </div>
                 </div>

                 {/* Button */}
                 <div className="pt-8">
                   <Link to="/register?role=CREATOR">
                    <Button variant="neon" className="w-full">Initialize Creator Account</Button>
                   </Link>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* How It Works - "The Process" */}
      <section className="py-24 bg-cyber-dark relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-16">
             <div className="h-px bg-neon-green flex-grow"></div>
             <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-widest">Operational Sequence</h2>
             <div className="h-px bg-neon-green flex-grow"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-cyber-gray border border-gray-800 p-8 relative group hover:border-neon-blue transition-colors duration-300">
              <div className="absolute -top-3 -left-3 bg-cyber-black border border-neon-blue p-2 text-neon-blue font-mono font-bold text-xl z-10">01</div>
              <div className="h-48 flex items-center justify-center border-b border-gray-800 mb-6 group-hover:border-neon-blue/50">
                <i className="fas fa-cube text-6xl text-gray-600 group-hover:text-neon-blue transition-colors duration-300 drop-shadow-lg"></i>
              </div>
              <h3 className="text-2xl font-display text-white mb-2 uppercase">Upload Asset</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Define the target. Set the commission bounty. No listing fees required. Protocol initialized.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-cyber-gray border border-gray-800 p-8 relative group hover:border-neon-pink transition-colors duration-300">
              <div className="absolute -top-3 -left-3 bg-cyber-black border border-neon-pink p-2 text-neon-pink font-mono font-bold text-xl z-10">02</div>
              <div className="h-48 flex items-center justify-center border-b border-gray-800 mb-6 group-hover:border-neon-pink/50">
                <i className="fas fa-network-wired text-6xl text-gray-600 group-hover:text-neon-pink transition-colors duration-300 drop-shadow-lg"></i>
              </div>
              <h3 className="text-2xl font-display text-white mb-2 uppercase">Swarm Deploys</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Creators generate smart-links. The network distributes your asset across the digital expanse.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-cyber-gray border border-gray-800 p-8 relative group hover:border-neon-green transition-colors duration-300">
              <div className="absolute -top-3 -left-3 bg-cyber-black border border-neon-green p-2 text-neon-green font-mono font-bold text-xl z-10">03</div>
              <div className="h-48 flex items-center justify-center border-b border-gray-800 mb-6 group-hover:border-neon-green/50">
                <i className="fas fa-check-double text-6xl text-gray-600 group-hover:text-neon-green transition-colors duration-300 drop-shadow-lg"></i>
              </div>
              <h3 className="text-2xl font-display text-white mb-2 uppercase">Credits Transfer</h3>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Payment executed only upon verified transaction. Smart contracts handle the split.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Footer */}
      <section className="py-16 bg-neon-green/5 border-t border-neon-green/30 text-center">
         <div className="max-w-4xl mx-auto px-4">
            <i className="fas fa-shield-alt text-5xl text-neon-green mb-6"></i>
            <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest mb-4">The Guarantee</h2>
            <p className="text-xl font-mono text-gray-300 max-w-2xl mx-auto">
              "We guarantee results, or we guarantee you don't pay. There is no middle ground. There are no hidden fees. This is the future of commerce."
            </p>
            <div className="mt-8">
               <Link to="/register?role=BUSINESS">
                 <Button size="lg" variant="primary" className="shadow-[0_0_40px_rgba(57,255,20,0.4)]">Create Business Account</Button>
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};