import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { generatePaymentDisclaimer } from '../services/gemini';
import { store } from '../services/mockStore';
import { SaleRecord, User, SystemSettings, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { copyToClipboard } from '../utils/security';

export const PaymentPortal: React.FC = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [sale, setSale] = useState<SaleRecord | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityViolation, setSecurityViolation] = useState(false);
  
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [paidPlatform, setPaidPlatform] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAYMENT_SENT' | 'PAID' | 'DISPUTED'>('PENDING');
  
  const [platformTxInput, setPlatformTxInput] = useState('');
  const [creatorTxInput, setCreatorTxInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!saleId) return;
    const foundSale = store.getSaleById(saleId);
    const settings = store.getSystemSettings();
    setSystemSettings(settings);
    
    // Security Check: Only Business, Creator, or ADMIN can view
    if (foundSale && user) {
      if (foundSale.businessId !== user.id && foundSale.creatorId !== user.id && user.role !== UserRole.ADMIN) {
        setSecurityViolation(true);
        setLoading(false);
        return;
      }

      setSale(foundSale);
      setPaymentStatus(foundSale.status as any);
      
      if (foundSale.platformFeePaid) {
        setPaidPlatform(true);
      }

      const foundCreator = store.getUserById(foundSale.creatorId);
      if (foundCreator) {
        setCreator(foundCreator);
        generatePaymentDisclaimer(foundSale.businessId === user.id ? user.companyName || "Business" : "The Business", foundCreator.name).then(setDisclaimer);
      }
    }
    setLoading(false);
  }, [saleId, user]);

  // BUSINESS Action: Pay Platform
  const handlePayPlatform = () => {
    if (!platformTxInput.trim()) {
        addToast('Proof Required: Please enter a Transaction ID or Receipt Number.', 'error');
        return;
    }
    setActionLoading(true);
    setTimeout(() => {
      if (saleId) {
        store.adminVerifyPlatformFee(saleId, platformTxInput);
      }
      setActionLoading(false);
      setPaidPlatform(true);
      addToast('Platform Payment Recorded', 'success');
    }, 1000);
  };

  // BUSINESS Action: Mark as Sent
  const handleMarkSent = () => {
    if (!creatorTxInput.trim()) {
        addToast('Proof Required: Please enter a Transaction ID or Receipt Number.', 'error');
        return;
    }
    setActionLoading(true);
    if (sale && saleId) {
      store.updateSaleStatus(saleId, 'PAYMENT_SENT', creatorTxInput);
      setPaymentStatus('PAYMENT_SENT');
    }
    setTimeout(() => {
      setActionLoading(false);
      addToast('Payment marked as SENT with proof.', 'info');
    }, 1000);
  };

  // CREATOR Action: Confirm Receipt
  const handleConfirmReceipt = () => {
    setActionLoading(true);
    if (sale && saleId) {
      store.updateSaleStatus(saleId, 'PAID');
      setPaymentStatus('PAID');
    }
    setTimeout(() => {
      setActionLoading(false);
      addToast('Transaction closed and verified.', 'success');
      navigate('/creators');
    }, 1500);
  };

  // CREATOR Action: Dispute
  const handleDispute = () => {
    if (window.confirm("Are you sure? This will flag the business for investigation.")) {
        if (sale && saleId) {
            store.updateSaleStatus(saleId, 'DISPUTED');
            setPaymentStatus('DISPUTED');
            addToast('Transaction flagged for review', 'error');
        }
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) addToast('Copied to clipboard', 'success');
  };

  if (loading) return <div className="p-10 text-center font-mono text-neon-blue animate-pulse">LOADING TRANSACTION DATA...</div>;
  if (securityViolation) return <div className="p-10 text-center text-neon-red">UNAUTHORIZED ACCESS</div>;
  if (!sale || !creator) return <div className="p-10 text-center text-neon-red font-mono">ERROR: INVOICE NOT FOUND</div>;

  const isPayer = user?.id === sale.businessId;
  const isPayee = user?.id === sale.creatorId;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="secondary" size="sm" onClick={() => navigate(isAdmin ? '/admin-dashboard' : isPayer ? '/business-dashboard' : '/creators')}>
          <i className="fas fa-arrow-left mr-2"></i> Return
        </Button>
      </div>

      <div className="bg-cyber-gray border-2 border-gray-700 p-1 shadow-2xl relative">
        {/* Invoice Header */}
        <div className="bg-black p-8 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cGF0aCBkPSJNMSAxaDF2MUgxeiIgZmlsbD0iIzNmZjE0IiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-2">Settlement Invoice</h1>
            <p className="text-xs font-mono text-gray-500">ID: <span className="text-neon-pink">{sale.id}</span></p>
          </div>
          <div className="relative z-10 text-right mt-4 sm:mt-0">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Gross Value</p>
            <p className="font-mono text-3xl text-white">${sale.saleAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-8 bg-cyber-dark">
          {/* STEP 1: PLATFORM FEE */}
          <div className={`border p-6 transition-all relative mb-6 ${paidPlatform ? 'border-neon-green bg-neon-green/10' : 'border-neon-blue bg-black'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className={`w-8 h-8 flex items-center justify-center font-bold font-mono border ${paidPlatform ? 'bg-neon-green text-black border-neon-green' : 'bg-transparent text-neon-blue border-neon-blue'}`}>
                    {paidPlatform ? <i className="fas fa-check"></i> : '01'}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide">Platform Fee (30%)</h4>
                    <p className="text-xs font-mono text-gray-500">Sent to Social Swarm Treasury</p>
                  </div>
                </div>
                <div className="text-xl font-mono font-bold text-neon-blue">${sale.platformFee.toFixed(2)}</div>
              </div>
              
              {paidPlatform ? (
                 <div className="pl-12 text-neon-green font-mono text-xs flex items-center gap-2 uppercase">
                   <i className="fas fa-check-circle"></i> Paid & Verified {sale.platformFeeTxId && `[Ref: ${sale.platformFeeTxId}]`}
                 </div>
              ) : (
                <div className="pl-12">
                  {systemSettings && (
                    <div className="bg-gray-900 p-4 border border-gray-700 mb-4 font-mono text-sm">
                       <p className="text-xs text-gray-500 uppercase mb-2">Send Funds To:</p>
                       <div className="flex justify-between items-center">
                          <span className="text-white font-bold">{systemSettings.adminPayoutMethod.replace('_',' ')}</span>
                          <button onClick={() => handleCopy(systemSettings.adminPayoutIdentifier)} className="text-neon-blue hover:text-white text-xs uppercase">Copy</button>
                       </div>
                       <code className="block mt-2 p-2 bg-black text-neon-blue break-all text-xs">{systemSettings.adminPayoutIdentifier}</code>
                       {systemSettings.adminPayoutNetwork && <p className="text-[10px] text-neon-yellow mt-1">NETWORK: {systemSettings.adminPayoutNetwork}</p>}
                    </div>
                  )}
                  
                  {(isPayer || isAdmin) && (
                    <div className="flex gap-2">
                      <input 
                        className="flex-grow bg-black border border-gray-700 text-white px-3 text-xs font-mono focus:border-neon-blue outline-none"
                        placeholder="Paste Transaction ID / Receipt #"
                        value={platformTxInput}
                        onChange={(e) => setPlatformTxInput(e.target.value)}
                      />
                      <Button onClick={handlePayPlatform} loading={actionLoading} variant="outline" size="sm">
                        Mark Sent
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* STEP 2: CREATOR PAYOUT */}
          <div className={`border p-6 transition-all relative ${!paidPlatform ? 'opacity-50 border-gray-800' : (paymentStatus === 'PAID' ? 'border-neon-green bg-neon-green/10' : 'border-neon-pink bg-black')}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className={`w-8 h-8 flex items-center justify-center font-bold font-mono border ${paymentStatus === 'PAID' ? 'bg-neon-green text-black border-neon-green' : 'bg-transparent text-neon-pink border-neon-pink'}`}>
                    {paymentStatus === 'PAID' ? <i className="fas fa-check"></i> : '02'}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide">Creator Payout (70%)</h4>
                    <p className="text-xs font-mono text-gray-500">Destination: {creator.name}</p>
                  </div>
                </div>
                <div className="text-xl font-mono font-bold text-neon-pink">${sale.creatorPay.toFixed(2)}</div>
              </div>

              <div className="pl-12">
                {/* Status Display */}
                {paymentStatus === 'DISPUTED' && (
                  <div className="bg-red-900/30 border border-red-500 p-4 text-center mb-4">
                    <h3 className="text-white font-bold uppercase">Transaction Disputed</h3>
                  </div>
                )}

                {paymentStatus === 'PAID' && (
                  <div className="text-neon-green font-mono text-xs uppercase bg-black p-3 border border-neon-green">
                     <i className="fas fa-check-double mr-2"></i> Verified. {sale.creatorPayTxId && `[Ref: ${sale.creatorPayTxId}]`}
                  </div>
                )}

                {paymentStatus === 'PAYMENT_SENT' && (
                   <div className="bg-neon-yellow/10 border border-neon-yellow p-4 mb-4">
                      <p className="text-neon-yellow font-mono text-xs uppercase font-bold mb-2">Payment Reported Sent</p>
                      {sale.creatorPayTxId && <p className="text-gray-400 text-xs font-mono mb-2">Ref: {sale.creatorPayTxId}</p>}
                      {(isPayee || isAdmin) && (
                        <div className="flex gap-2">
                             <Button size="sm" variant="neon" onClick={handleConfirmReceipt} loading={actionLoading} className="flex-1">Confirm Receipt</Button>
                             <Button size="sm" variant="danger" onClick={handleDispute} className="flex-1">Dispute</Button>
                        </div>
                      )}
                   </div>
                )}

                {/* Payout Action (Only if Pending/Disputed) */}
                {(paymentStatus === 'PENDING' || paymentStatus === 'DISPUTED') && paidPlatform && (
                    <>
                      <div className="bg-gray-900 p-4 border border-gray-800 mb-4 font-mono text-sm">
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-gray-500 uppercase">Method: {creator.payoutDetails?.method}</span>
                           </div>
                           <div className="flex items-center gap-2 bg-black p-2 border border-gray-700">
                              <code className="flex-grow text-white text-xs">{creator.payoutDetails?.identifier || 'NOT LINKED'}</code>
                              <button onClick={() => handleCopy(creator.payoutDetails?.identifier || '')} className="text-neon-pink text-xs uppercase hover:text-white">Copy</button>
                           </div>
                      </div>

                      {(isPayer || isAdmin) && (
                         <div className="flex gap-2 mt-4">
                            <input 
                              className="flex-grow bg-black border border-gray-700 text-white px-3 text-xs font-mono focus:border-neon-pink outline-none"
                              placeholder="Paste Transaction ID / Receipt #"
                              value={creatorTxInput}
                              onChange={(e) => setCreatorTxInput(e.target.value)}
                            />
                            <Button onClick={handleMarkSent} variant="neon" size="sm" loading={actionLoading}>
                              Mark Sent
                            </Button>
                        </div>
                      )}
                    </>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};