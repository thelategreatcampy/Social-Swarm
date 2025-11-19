import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Campaign, SaleRecord, AffiliateLink, UserRole } from '../types';
import { store } from '../services/mockStore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { copyToClipboard } from '../utils/security';

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [mySales, setMySales] = useState<SaleRecord[]>([]);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  
  // Guidelines Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  
  useEffect(() => {
    if (user) {
      setAvailableCampaigns(store.getCampaigns());
      setMyLinks(store.getCreatorLinks(user.id));
      setMySales(store.getCreatorSales(user.id));
    }
  }, [user]);

  const handleRequestLink = async () => {
    if (!user || !selectedCampaign) return;
    
    setLoadingCode(selectedCampaign.id);
    
    // Create the pending link request
    const newLink = store.requestLink(selectedCampaign.id, user.id, user.name);
    
    setMyLinks(prev => [...prev, newLink]);
    setLoadingCode(null);
    setSelectedCampaign(null); // Close modal
    setAgreedToGuidelines(false);
    addToast(`Request Sent to ${selectedCampaign.businessName}. Awaiting Link Assignment.`, 'success');
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) addToast('Link copied to clipboard', 'success');
  };

  const getLinkForCampaign = (campaignId: string) => myLinks.find(l => l.campaignId === campaignId);
  
  // CALCULATE ONLY THE CREATOR'S SHARE (70% of the Total Rate) to display as "Commission"
  // We hide the fact that this is 70% of a larger pie.
  const calculateNetBountyPercentage = (totalRate: number) => (totalRate * 0.7).toFixed(1);
  const calculateCreatorEarnings = (price: number, totalRate: number) => (price * (totalRate / 100) * 0.7);

  if (!user || user.role !== UserRole.CREATOR) return <div className="p-10 text-center font-mono text-neon-red">ACCESS DENIED</div>;

  const paidSales = mySales.filter(s => s.status === 'PAID');
  const pendingSales = mySales.filter(s => s.status !== 'PAID');
  const actionRequiredSales = mySales.filter(s => s.status === 'PAYMENT_SENT');
  const totalPayouts = paidSales.reduce((acc, s) => acc + s.creatorPay, 0);
  const upcomingPayments = pendingSales.reduce((acc, s) => acc + s.creatorPay, 0);
  const missingPayoutInfo = !user.payoutDetails || !user.payoutDetails.identifier;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      
      {/* GUIDELINES MODAL */}
      {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
              <div className="bg-cyber-gray border-2 border-neon-blue max-w-lg w-full shadow-[0_0_50px_rgba(0,243,255,0.2)]">
                  <div className="p-6 border-b border-gray-700">
                      <h2 className="text-xl font-display font-bold text-white uppercase">Compliance Check</h2>
                      <p className="text-neon-blue text-xs font-mono">CAMPAIGN: {selectedCampaign.productName}</p>
                  </div>
                  <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                      <div className="bg-green-900/20 border-l-4 border-green-500 p-4">
                          <h3 className="text-green-500 font-bold uppercase text-xs mb-2">Advertising Guidelines (DO)</h3>
                          <p className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{selectedCampaign.advertisingGuidelines}</p>
                      </div>
                      <div className="bg-red-900/20 border-l-4 border-red-500 p-4">
                          <h3 className="text-red-500 font-bold uppercase text-xs mb-2">Prohibited Acts (DON'T)</h3>
                          <p className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{selectedCampaign.prohibitedActs}</p>
                      </div>
                      <div className="bg-black p-4 border border-gray-700">
                           <p className="text-xs text-gray-400 font-mono mb-2">Non-Bypass Agreement:</p>
                           <p className="text-[10px] text-gray-500">I agree to use the provided affiliate link for all sales. I will not attempt to bypass the platform to transact directly with the business. I understand violation leads to immediate forfeiture of funds.</p>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-700 flex flex-col gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={agreedToGuidelines} onChange={e => setAgreedToGuidelines(e.target.checked)} className="accent-neon-blue w-5 h-5" />
                          <span className="text-sm text-white">I agree to follow these guidelines strictly.</span>
                      </label>
                      <div className="flex gap-3">
                          <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>Cancel</Button>
                          <Button disabled={!agreedToGuidelines} onClick={handleRequestLink} loading={loadingCode === selectedCampaign.id}>Request Link</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <header className="mb-8 border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-widest">Creator (Netrunner) Terminal</h1>
          <div className="flex items-center gap-4 mt-2">
             <p className="text-neon-green font-mono text-sm">>> User: {user.name} // Status: ONLINE</p>
             <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tax Status: 1099-NEC (Self-Reporting)</span>
             </div>
          </div>
        </div>
        <div className="hidden md:block text-right font-mono text-xs text-gray-500">
          <p>SYS.VER. 2.6.0</p>
          <p>ENCRYPTION: ON</p>
        </div>
      </header>

      {missingPayoutInfo && (
        <div className="bg-neon-yellow/10 border-l-4 border-neon-yellow p-4 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-circle text-neon-yellow text-xl"></i>
            <div>
              <h3 className="text-white font-bold font-display uppercase">Setup Required</h3>
              <p className="text-gray-400 text-xs font-mono">You cannot receive commissions until you link a payment method.</p>
            </div>
          </div>
          <Link to="/settings"><Button size="sm" variant="secondary">Configure Payout</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-cyber-dark border border-neon-green p-6 relative overflow-hidden group hover:bg-neon-green/5 transition-colors">
           <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity"><i className="fas fa-coins text-6xl text-neon-green"></i></div>
           <p className="text-neon-green font-mono text-xs font-bold uppercase tracking-widest mb-1">Total Payouts (Received)</p>
           <h2 className="text-4xl font-display font-bold text-white">${totalPayouts.toFixed(2)}</h2>
        </div>
        <div className="bg-cyber-dark border border-gray-700 p-6 relative overflow-hidden hover:border-neon-yellow transition-colors">
           <p className="text-gray-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">Upcoming Payments (Pending)</p>
           <h2 className="text-4xl font-display font-bold text-neon-yellow">${upcomingPayments.toFixed(2)}</h2>
        </div>
        <div className="bg-cyber-dark border border-gray-700 p-6 relative overflow-hidden hover:border-neon-blue transition-colors">
           <p className="text-gray-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">Active Contracts</p>
           <h2 className="text-4xl font-display font-bold text-neon-blue">{myLinks.length}</h2>
        </div>
      </div>

      <h2 className="text-2xl font-display font-bold text-white mb-6 border-l-4 border-neon-pink pl-4 uppercase">Available Contracts</h2>
      {availableCampaigns.length === 0 ? (
        <div className="p-8 border border-gray-800 bg-black/50 text-center">
           <p className="text-gray-500 font-mono">NO CONTRACTS DETECTED ON THE NETWORK.</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-3 gap-8">
        {availableCampaigns.map((campaign) => {
          const creatorEarning = calculateCreatorEarnings(campaign.productPrice, campaign.totalCommissionRate);
          const netPercentage = calculateNetBountyPercentage(campaign.totalCommissionRate);
          const existingLink = getLinkForCampaign(campaign.id);
          
          return (
            <div key={campaign.id} className="bg-cyber-gray border border-gray-700 flex flex-col h-full hover:border-neon-pink transition-all duration-300 group relative overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold border border-gray-600 text-gray-400 px-2 py-1 uppercase tracking-widest">{campaign.businessName}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-widest border ${campaign.paymentFrequency === 'MONTHLY' ? 'border-neon-yellow text-neon-yellow' : 'border-neon-green text-neon-green'}`}>{campaign.paymentFrequency}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-1">{campaign.productName}</h3>
                <p className="text-sm font-mono text-gray-500 mb-4">UNIT PRICE: <span className="text-white">${campaign.productPrice.toFixed(2)}</span></p>
                <div className="bg-black border border-gray-800 p-4 relative">
                  <h4 className="text-[10px] font-bold text-neon-pink uppercase mb-1 tracking-widest">Projected Bounty</h4>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-mono font-bold text-white">${creatorEarning.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{netPercentage}% Net Comm.</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 mt-auto">
                {existingLink ? (
                  existingLink.status === 'PENDING_ASSIGNMENT' ? (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 text-center">
                          <p className="text-yellow-500 font-bold text-xs uppercase mb-1">REQUEST PENDING</p>
                          <p className="text-[10px] text-gray-400">Waiting for Business to assign your unique link.</p>
                      </div>
                  ) : (
                    <div className="space-y-4">
                        <div className="bg-neon-green/5 border border-neon-green/30 p-4 relative">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fas fa-bolt text-neon-green animate-pulse"></i>
                            <p className="text-xs text-neon-green font-bold uppercase tracking-widest">Link Active</p>
                        </div>
                        <div className="bg-black border border-gray-700 p-2 text-[10px] break-all font-mono text-gray-300 mb-3 select-all shadow-inner">{existingLink.destinationUrl}</div>
                        <button onClick={() => handleCopy(existingLink.destinationUrl)} className="w-full text-center bg-neon-green text-black py-2 hover:bg-white text-xs font-bold font-mono uppercase tracking-wider transition-colors">Copy Link</button>
                        </div>
                    </div>
                  )
                ) : (
                  <Button variant="neon" onClick={() => setSelectedCampaign(campaign)} className="w-full">Review & Accept</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};