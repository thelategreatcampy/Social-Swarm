import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { isValidEmail } from '../utils/validation';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.CREATOR);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set role based on URL parameter
  useEffect(() => {
    const paramRole = searchParams.get('role');
    if (paramRole === 'BUSINESS') {
        setRole(UserRole.BUSINESS);
    } else if (paramRole === 'CREATOR') {
        setRole(UserRole.CREATOR);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors on typing
  };

  const handleNext = () => {
    if (!formData.name.trim()) {
      setError("NAME REQUIRED");
      return;
    }
    if (role === UserRole.BUSINESS && !formData.companyName.trim()) {
      setError("COMPANY NAME REQUIRED");
      return;
    }
    setStep(2);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('PROTOCOL VIOLATION: You must accept the Mandatory Liability Agreements.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("INVALID EMAIL FORMAT");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }

    if (formData.password.length < 6) {
      setError('PASSWORD SECURITY TOO LOW (MIN 6 CHARS)');
      return;
    }

    setLoading(true);
    const success = await register(
      formData.email, 
      formData.password, 
      formData.name, 
      role, 
      role === UserRole.BUSINESS ? formData.companyName : undefined
    );
    setLoading(false);

    if (success) {
      if (role === UserRole.BUSINESS) {
        navigate('/business-dashboard');
      } else {
        navigate('/creators');
      }
    } else {
      setError('REGISTRATION FAILED: USER ALREADY EXISTS');
    }
  };

  const BUSINESS_WARNING = `IRREVOCABLE PAYMENT GUARANTEE & DEBT COLLECTIONS NOTICE:
1. You acknowledge that any Commission Generated on this platform represents a binding financial debt owed to Social Swarm and the Creator.
2. MANDATORY COLLECTIONS CLAUSE: You explicitly agree that failure to manually transfer funds within 7 days of a payout cycle closing will result in the immediate transfer of your debt to a 3rd Party Collections Agency.
3. You agree to be personally liable for all legal fees, collection costs, and interest associated with recovering unpaid commissions.
4. You affirm that Social Swarm is a tracking platform only and holds no funds. You are solely responsible for executing payments.`;

  const CREATOR_WARNING = `PLATFORM NON-LIABILITY & INDEMNIFICATION AGREEMENT:
1. You acknowledge that Social Swarm is a software provider, not a financial institution or employer.
2. SOLE LIABILITY CLAUSE: You understand that the Business listed is solely responsible for your payment. Social Swarm is NOT liable for any unpaid commissions or bankruptcy on the part of the business.
3. You hereby release Social Swarm and its administrators from any financial claims regarding unpaid work. Your legal recourse for non-payment is exclusively against the Business Entity.
4. You are an Independent Contractor responsible for your own taxes.`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-cyber-gray border border-neon-blue p-8 shadow-[0_0_30px_rgba(0,243,255,0.1)] relative overflow-hidden">
        
        {/* Header */}
        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest">Protocol: Enlistment</h1>
          <p className={`font-mono text-xs uppercase tracking-widest ${role === UserRole.BUSINESS ? 'text-neon-blue' : 'text-neon-green'}`}>
             STEP {step} OF 2 // {role === UserRole.CREATOR ? 'CREATOR' : 'CORPORATE'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono relative z-10">
          
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
               <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setRole(UserRole.BUSINESS)}
                   className={`p-4 border transition-all ${role === UserRole.BUSINESS ? 'border-neon-blue bg-neon-blue/10 text-neon-blue shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
                 >
                   <i className="fas fa-building text-2xl mb-2 block"></i>
                   <span className="uppercase font-bold tracking-wider text-sm">Business</span>
                 </button>
                 <button 
                   type="button"
                   onClick={() => setRole(UserRole.CREATOR)}
                   className={`p-4 border transition-all ${role === UserRole.CREATOR ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-[inset_0_0_10px_rgba(57,255,20,0.2)]' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
                 >
                   <i className="fas fa-user-astronaut text-2xl mb-2 block"></i>
                   <span className="uppercase font-bold tracking-wider text-sm">Creator<br/><span className="text-[10px]">(Netrunner)</span></span>
                 </button>
               </div>

               <div>
                 <label className="block text-xs text-gray-400 mb-1 uppercase">Full Name</label>
                 <input 
                    name="name" required value={formData.name} onChange={handleChange}
                    className="w-full bg-black border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                 />
               </div>

               {role === UserRole.BUSINESS && (
                 <div>
                   <label className="block text-xs text-gray-400 mb-1 uppercase">Company Entity Name</label>
                   <input 
                      name="companyName" required value={formData.companyName} onChange={handleChange}
                      className="w-full bg-black border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                   />
                 </div>
               )}

               {error && (
                <div className="p-2 bg-red-900/20 text-neon-red text-xs border border-neon-red text-center">
                  {error}
                </div>
               )}

               <Button type="button" variant="outline" className="w-full" onClick={handleNext}>Next Phase >></Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
               <div>
                 <label className="block text-xs text-gray-400 mb-1 uppercase">Email Address</label>
                 <input 
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full bg-black border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                 />
               </div>
               <div>
                 <label className="block text-xs text-gray-400 mb-1 uppercase">Set Password</label>
                 <input 
                    type="password" name="password" required value={formData.password} onChange={handleChange}
                    className="w-full bg-black border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                 />
               </div>
               <div>
                 <label className="block text-xs text-gray-400 mb-1 uppercase">Confirm Password</label>
                 <input 
                    type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                    className="w-full bg-black border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                 />
               </div>

               {/* IRONCLAD AGREEMENT SECTION */}
               <div className={`p-4 border-2 ${role === UserRole.BUSINESS ? 'border-neon-red bg-red-900/10' : 'border-neon-yellow bg-yellow-900/10'}`}>
                 <h4 className={`text-xs font-bold uppercase mb-2 ${role === UserRole.BUSINESS ? 'text-neon-red' : 'text-neon-yellow'}`}>
                    {role === UserRole.BUSINESS ? '⚠️ BINDING DEBT AGREEMENT' : '⚠️ LIABILITY RELEASE'}
                 </h4>
                 <div className="bg-black border border-gray-700 p-3 h-32 overflow-y-auto text-[10px] text-gray-300 leading-relaxed mb-3 font-mono shadow-inner">
                   <pre className="whitespace-pre-wrap font-mono">
                     {role === UserRole.BUSINESS ? BUSINESS_WARNING : CREATOR_WARNING}
                   </pre>
                 </div>
                 <label className="flex items-start gap-3 cursor-pointer">
                   <input 
                    type="checkbox" 
                    className={`mt-1 bg-black border-gray-600 ${role === UserRole.BUSINESS ? 'accent-neon-red' : 'accent-neon-yellow'}`}
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                   />
                   <span className="text-[10px] text-white font-bold uppercase">
                     I Digitally Sign & Accept {role === UserRole.BUSINESS ? 'Debt Liability' : 'Indemnification'}.
                   </span>
                 </label>
               </div>

               {error && (
                <div className="p-2 bg-red-900/20 text-neon-red text-xs border border-neon-red text-center">
                  {error}
                </div>
               )}

               <div className="flex gap-3">
                 <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">Back</Button>
                 <Button 
                    type="submit" 
                    variant={role === UserRole.BUSINESS ? "danger" : "neon"} 
                    className="w-2/3" 
                    loading={loading}
                    disabled={!acceptedTerms}
                 >
                    {role === UserRole.BUSINESS ? 'Initialize Entity' : 'Initialize Creator'}
                 </Button>
               </div>
            </div>
          )}

          <div className="mt-6 text-center border-t border-gray-800 pt-4">
            <Link to="/login" className="text-xs text-gray-500 hover:text-white uppercase tracking-wider">Already in the system? Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};