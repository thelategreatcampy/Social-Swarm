import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserRole } from '../types';
import { isValidEmail } from '../utils/validation';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    payoutMethod: user?.payoutDetails?.method || 'VENMO',
    payoutId: user?.payoutDetails?.identifier || '',
    cryptoNetwork: user?.payoutDetails?.network || 'ETH'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError("Invalid Email Format.");
      return;
    }

    setIsSaving(true);
    
    updateProfile({
      name: formData.name,
      email: formData.email,
      payoutDetails: {
        method: formData.payoutMethod as any,
        identifier: formData.payoutId,
        network: formData.payoutMethod === 'CRYPTO' ? formData.cryptoNetwork : undefined
      }
    });
    
    addToast('System Profile Updated', 'success');
    
    // Automatically redirect back to the dashboard so the user isn't stranded
    setTimeout(() => {
      setIsSaving(false);
      if (user?.role === UserRole.BUSINESS) {
        navigate('/business-dashboard');
      } else {
        navigate('/creators');
      }
    }, 1500);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-end">
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest">Bio-Data Config</h1>
        <span className="text-neon-blue font-mono text-xs">ID: {user.id}</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-cyber-gray border border-gray-700 p-8 shadow-lg relative">
        {/* Deco lines */}
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-neon-blue opacity-50"></div>

        <div className="space-y-8">
          {/* Identity Section */}
          <div>
            <h3 className="text-neon-blue font-display font-bold uppercase mb-4 border-b border-gray-800 pb-2">Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-2">Display Name</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-white p-2 focus:border-neon-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-2">Comms Email</label>
                <input 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-white p-2 focus:border-neon-blue outline-none"
                />
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div>
            <h3 className="text-neon-green font-display font-bold uppercase mb-4 border-b border-gray-800 pb-2">
              FINANCIAL PROTOCOLS <span className="text-xs font-mono text-red-500 normal-case ml-2">(Critical for Transfers)</span>
            </h3>
            <div className="bg-black/50 p-6 border border-gray-800">
              <div className="grid grid-cols-1 gap-6 font-mono mb-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">Transfer Method</label>
                  <select 
                    name="payoutMethod"
                    value={formData.payoutMethod}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-700 text-white p-2 focus:border-neon-green outline-none"
                  >
                    <option value="VENMO">Venmo (App)</option>
                    <option value="PAYPAL">PayPal (Email)</option>
                    <option value="ZELLE">Zelle (Phone/Email)</option>
                    <option value="STRIPE_LINK">Stripe Payment Link (URL)</option>
                    <option value="CRYPTO">Crypto Wallet</option>
                    <option value="BANK_WIRE">Wire Transfer</option>
                  </select>
                </div>

                {formData.payoutMethod === 'CRYPTO' && (
                  <div className="p-4 border border-neon-yellow bg-neon-yellow/5 animate-fadeIn">
                    <label className="block text-xs text-neon-yellow uppercase mb-2">Blockchain Network</label>
                    <select 
                      name="cryptoNetwork"
                      value={formData.cryptoNetwork}
                      onChange={handleChange}
                      className="w-full bg-black border border-gray-700 text-white p-2 focus:border-neon-yellow outline-none mb-4"
                    >
                      <option value="ETH">Ethereum (ERC-20)</option>
                      <option value="SOL">Solana</option>
                      <option value="BTC">Bitcoin</option>
                      <option value="USDC">USDC (ERC-20)</option>
                    </select>
                    <p className="text-[10px] text-gray-400">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      Ensure network matches address to prevent asset loss.
                    </p>
                  </div>
                )}

                {formData.payoutMethod === 'STRIPE_LINK' && (
                  <div className="p-4 border border-neon-pink bg-neon-pink/5 animate-fadeIn">
                     <p className="text-[10px] text-gray-300 mb-2">
                       Paste your direct Stripe Payment Link here. Businesses will click this to pay you instantly via Credit Card.
                     </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">
                    {formData.payoutMethod === 'CRYPTO' ? 'Wallet Address' : 
                     formData.payoutMethod === 'STRIPE_LINK' ? 'Payment URL' : 
                     'Tag / Identifier'}
                  </label>
                  <input 
                    name="payoutId" 
                    value={formData.payoutId} 
                    onChange={handleChange}
                    placeholder={
                      formData.payoutMethod === 'CRYPTO' ? '0x...' :
                      formData.payoutMethod === 'STRIPE_LINK' ? 'https://buy.stripe.com/...' :
                      '@username or email'
                    }
                    className="w-full bg-black border border-gray-700 text-white p-2 focus:border-neon-green outline-none font-mono"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500">
                * Ensure this data is accurate. The Swarm pays directly to this destination.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          {error && (
            <span className="text-neon-red font-mono text-xs">
              >> {error}
            </span>
          )}
          
          <div className="ml-auto">
             <Button type="submit" variant="primary" className="w-48" loading={isSaving}>
              {isSaving ? 'SAVING...' : 'UPDATE SYSTEM'}
             </Button>
          </div>
        </div>
      </form>
    </div>
  );
};