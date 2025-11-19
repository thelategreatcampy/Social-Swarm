import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.CREATOR);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await register(email, password, name, role, companyName);
      if (success) {
        addToast('Operative Registered Successfully.', 'success');
        navigate(role === UserRole.BUSINESS ? '/business-dashboard' : '/creators');
      } else {
        addToast('Registration Failed: Email may be in use.', 'error');
      }
    } catch (err) {
      addToast('Critical Error during registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-xl bg-cyber-dark border border-cyber-gray shadow-[0_0_20px_rgba(57,255,20,0.1)]">
         <h2 className="text-2xl font-bold text-white mb-2 font-mono text-center tracking-wider">NEW_OPERATIVE</h2>
         <div className="flex justify-center gap-2 mb-8">
            <div className={`h-1 w-8 rounded ${step === 1 ? 'bg-neon-green' : 'bg-slate-700'}`}></div>
            <div className={`h-1 w-8 rounded ${step === 2 ? 'bg-neon-green' : 'bg-slate-700'}`}></div>
         </div>

         <form onSubmit={handleRegister} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                 <p className="text-center text-slate-400 text-sm font-mono">SELECT_PROTOCOL</p>
                 
                 <div 
                   onClick={() => setRole(UserRole.CREATOR)}
                   className={`cursor-pointer p-4 border rounded-lg transition-all flex items-center gap-4 ${role === UserRole.CREATOR ? 'border-neon-green bg-neon-green/10' : 'border-slate-700 hover:border-slate-500'}`}
                 >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === UserRole.CREATOR ? 'border-neon-green' : 'border-slate-500'}`}>
                       {role === UserRole.CREATOR && <div className="w-2 h-2 bg-neon-green rounded-full"></div>}
                    </div>
                    <div>
                       <h3 className="text-white font-bold font-mono">CREATOR</h3>
                       <p className="text-xs text-slate-400">I create content and earn commission.</p>
                    </div>
                 </div>

                 <div 
                   onClick={() => setRole(UserRole.BUSINESS)}
                   className={`cursor-pointer p-4 border rounded-lg transition-all flex items-center gap-4 ${role === UserRole.BUSINESS ? 'border-neon-blue bg-neon-blue/10' : 'border-slate-700 hover:border-slate-500'}`}
                 >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === UserRole.BUSINESS ? 'border-neon-blue' : 'border-slate-500'}`}>
                       {role === UserRole.BUSINESS && <div className="w-2 h-2 bg-neon-blue rounded-full"></div>}
                    </div>
                    <div>
                       <h3 className="text-white font-bold font-mono">BUSINESS</h3>
                       <p className="text-xs text-slate-400">I want to drive sales with UGC.</p>
                    </div>
                 </div>

                 <Button type="button" onClick={() => setStep(2)} className="w-full mt-4">
                   NEXT_STEP
                 </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                   <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Full Name</label>
                   <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black/50 border border-slate-700 rounded p-2 text-white focus:border-neon-green focus:outline-none font-mono" />
                </div>

                {role === UserRole.BUSINESS && (
                  <div>
                     <label className="block text-xs font-mono text-neon-blue mb-1 uppercase">Company Name</label>
                     <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full bg-black/50 border border-slate-700 rounded p-2 text-white focus:border-neon-blue focus:outline-none font-mono" />
                  </div>
                )}

                <div>
                   <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Email</label>
                   <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/50 border border-slate-700 rounded p-2 text-white focus:border-neon-green focus:outline-none font-mono" />
                </div>

                <div>
                   <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Password</label>
                   <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black/50 border border-slate-700 rounded p-2 text-white focus:border-neon-green focus:outline-none font-mono" />
                </div>

                <div className="flex gap-3 pt-2">
                   <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">BACK</Button>
                   <Button type="submit" loading={loading} className="flex-[2]">INITIALIZE</Button>
                </div>
              </div>
            )}

            <div className="text-center text-xs font-mono text-slate-500 pt-4 border-t border-slate-800 mt-4">
               <span className="mr-2">ALREADY_ACTIVE?</span>
               <Link to="/login" className="text-neon-green hover:underline">LOGIN_HERE</Link>
            </div>
         </form>
      </div>
    </div>
  );
};