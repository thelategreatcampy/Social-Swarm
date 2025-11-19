import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { generateAffiliateCode } from '../services/gemini';
import { Campaign, SaleRecord, AffiliateLink, UserRole } from '../types';
import { store } from '../services/mockStore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { copyToClipboard, generateUUID } from '../utils/security';

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [mySales, setMySales] = useState<SaleRecord[]>([]);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      setAvailableCampaigns(store.getCampaigns());
      setMyLinks(store.getCreatorLinks(user.id));
      setMySales(store.getCreatorSales(user.id));
    }
  }, [user]);

  const handleGenerateLink = async (campaignId: string, businessName: string, productName: string) => {
    if (!user) return;
    if (loadingCode) return;

    setLoadingCode(campaignId);
    const code = await generateAffiliateCode(user.name, productName);
    
    // UPDATED: Use REF parameter for precise tracking.
    const bridgeUrl = `${window.location.origin}${window.location.pathname}#/go?ref=${code}`;

    const newLink: AffiliateLink = {
      id: generateUUID(),
      campaignId,
      creatorId: user.id,
      code: code,
      generatedUrl: bridgeUrl, 
      clicks: 0
    };
    store.createLink(newLink);
    setMyLinks(prev => [...prev, newLink]);
    setLoadingCode(null);
    addToast(`Contract Accepted: ${productName}`, 'success');
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) addToast('Uplink copied to clipboard', 'success');
  };

  const getLinkForCampaign = (campaignId: string) => myLinks.find(l => l.campaignId === campaignId);
  const calculateCreatorEarnings = (price: number, totalRate: number) => (price * (totalRate / 100) * (2/3));

  if (!user || user.role !== UserRole.CREATOR) return <div className="p-10 text-center font-mono text-neon-red">ACCESS DENIED</div>;

  const paidSales = mySales.filter(s => s.status === 'PAID');
  const pendingSales = mySales.filter(s => s.status !== 'PAID');
  const actionRequiredSales = mySales.filter(s => s.status === 'PAYMENT_SENT');
  const totalPayouts = paidSales.reduce((acc, s) => acc + s.creatorPay, 0);
  const upcomingPayments = pendingSales.reduce((acc, s) => acc + s.creatorPay, 0);
  const missingPayoutInfo = !user.payoutDetails || !user.payoutDetails.identifier;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
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
          <p>SYS.VER. 2.5.0</p>
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

      {actionRequiredSales.length > 0 && (
        <div className="bg-neon-blue/10 border border-neon-blue p-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
             <i className="fas fa-bell text-neon-blue animate-pulse"></i>
             <h3 className="text-white font-bold uppercase">Incoming Transfer Detected</h3>
          </div>
          <p className="text-xs font-mono text-gray-300 mb-3">Businesses have marked {actionRequiredSales.length} transactions as sent. Confirm receipt to close contracts.</p>
          <div className="flex flex-wrap gap-2">
            {actionRequiredSales.map(s => (
              <Link key={s.id} to={`/payment/${s.id}`}><Button size="sm" variant="neon">Confirm ${s.creatorPay.toFixed(2)}</Button></Link>
            ))}
          </div>
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
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 mt-auto">
                {existingLink ? (
                  <div className="space-y-4">
                    <div className="bg-neon-green/5 border border-neon-green/30 p-4 relative">
                       <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-bolt text-neon-green animate-pulse"></i>
                          <p className="text-xs text-neon-green font-bold uppercase tracking-widest">Smart Link Active</p>
                       </div>
                       <div className="bg-black border border-gray-700 p-2 text-[10px] break-all font-mono text-gray-300 mb-3 select-all shadow-inner">{existingLink.generatedUrl}</div>
                       <button onClick={() => handleCopy(existingLink.generatedUrl)} className="w-full text-center bg-neon-green text-black py-2 hover:bg-white text-xs font-bold font-mono uppercase tracking-wider transition-colors">Copy Uplink</button>
                    </div>
                  </div>
                ) : (
                  <Button variant="neon" onClick={() => handleGenerateLink(campaign.id, campaign.businessName, campaign.productName)} loading={loadingCode === campaign.id} className="w-full">Accept Contract</Button>
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