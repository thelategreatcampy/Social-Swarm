
import React, { useState, useRef, useEffect } from 'react';
import { Plus, TrendingUp, Users, Upload, Copy, Check, ExternalLink, Link as LinkIcon, AlertCircle, Pencil, X, Save, DollarSign, ArrowRight, Wallet, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { store } from '../services/mockStore';
import { Campaign, SaleRecord, AffiliateLink, User, SystemSettings } from '../types';
import { parseSalesCSV } from '../utils/validation';
import { copyToClipboard } from '../utils/security';

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(store.getSystemSettings());
  
  const [assignInputs, setAssignInputs] = useState<Record<string, {code: string, url: string, discountCode?: string}>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDiscountInput, setShowDiscountInput] = useState<Record<string, boolean>>({});
  
  // Edit Mode State
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ code: '', url: '' });

  // --- Batch Payout State ---
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [batchPlatformTx, setBatchPlatformTx] = useState('');
  // This tracks individual payment inputs for creators
  const [batchCreatorTx, setBatchCreatorTx] = useState<Record<string, string>>({});
  // This tracks the SINGLE input for the "Mark All Paid" feature
  const [markAllTx, setMarkAllTx] = useState('');

  useEffect(() => {
    if (user) {
      const refresh = () => {
        setCampaigns(store.getBusinessCampaigns(user.id));
        setSales(store.getBusinessSales(user.id));
        setMyLinks(store.getBusinessLinks(user.id));
        setAllUsers(store.getAllUsers());
        setSystemSettings(store.getSystemSettings());
      };
      refresh();
      window.addEventListener('storage', refresh);
      return () => window.removeEventListener('storage', refresh);
    }
  }, [user]);

  const handleAssignChange = (linkId: string, field: 'code' | 'url' | 'discountCode', value: string) => {
      setAssignInputs(prev => ({
          ...prev,
          [linkId]: {
              ...prev[linkId],
              [field]: value
          }
      }));
  };

  const handleSaveLink = (link: AffiliateLink) => {
      let input = assignInputs[link.id];
      if (!input || !input.code || !input.url) {
          addToast('Tracking ID and Destination URL required.', 'error');
          return;
      }

      // Logistical Safety: Ensure URL starts with http
      let safeUrl = input.url.trim();
      if (!safeUrl.match(/^https?:\/\//)) {
         safeUrl = 'https://' + safeUrl;
      }

      store.assignLink(link.id, input.code, safeUrl, input.discountCode);
      addToast('Link assigned to Creator successfully.', 'success');
      if(user) setMyLinks(store.getBusinessLinks(user.id));
  };

  // --- EDIT LOGIC ---
  const startEditing = (link: AffiliateLink) => {
      setEditingLinkId(link.id);
      setEditFormData({ code: link.code, url: link.destinationUrl });
  };

  const cancelEditing = () => {
      setEditingLinkId(null);
      setEditFormData({ code: '', url: '' });
  };

  const saveEditing = (linkId: string) => {
      if (!editFormData.code || !editFormData.url) {
          addToast("Cannot save empty fields.", 'error');
          return;
      }
      
      // Logistical Safety
      let safeUrl = editFormData.url.trim();
      if (!safeUrl.match(/^https?:\/\//)) {
         safeUrl = 'https://' + safeUrl;
      }

      store.updateLinkDetails(linkId, editFormData.code, safeUrl);
      addToast("Link details updated.", 'success');
      setEditingLinkId(null);
      if(user) setMyLinks(store.getBusinessLinks(user.id));
  };

  const handleCopyLink = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      addToast('Link copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleDiscountField = (linkId: string) => {
      setShowDiscountInput(prev => ({ ...prev, [linkId]: !prev[linkId] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await parseSalesCSV(file);
      let imported = 0;
      let skipped = 0;
      
      data.forEach(row => {
         const link = store.getLinkByCode(row.code);
         if (link) {
            const campaign = campaigns.find(c => c.id === link.campaignId);
            if (campaign) {
                const exists = sales.some(s => s.affiliateCode === row.code && s.saleAmount === row.amount && new Date(s.saleDate).toDateString() === new Date().toDateString());
                if (!exists) {
                   store.recordSale(campaign.id, row.code, row.amount, 'CSV_IMPORT');
                   imported++;
                } else { skipped++; }
            } else { skipped++; }
         } else { skipped++; }
      });
      
      if (imported > 0) {
          addToast(`Success: ${imported} sales imported from CSV.`, 'success');
          if (user) setSales(store.getBusinessSales(user.id));
      }
      if (skipped > 0) addToast(`Notice: ${skipped} rows skipped.`, 'info');
      
    } catch (err: any) {
      addToast(err.message, 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerImport = () => { fileInputRef.current?.click(); };
  
  // --- BATCH PAYOUT LOGIC ---
  const handleBulkPayPlatform = () => {
    if (!batchPlatformTx.trim()) {
        addToast('Please enter a Transaction ID or Receipt Number.', 'error');
        return;
    }
    const unpaidFeeSales = sales.filter(s => !s.platformFeePaid).map(s => s.id);
    if (unpaidFeeSales.length === 0) return;
    
    store.markBatchPlatformFee(unpaidFeeSales, batchPlatformTx);
    addToast('Platform Fees marked as PAID.', 'success');
    if (user) setSales(store.getBusinessSales(user.id)); // Force Refresh
  };

  const handleBulkPayCreator = (creatorId: string, saleIds: string[]) => {
      const tx = batchCreatorTx[creatorId];
      if (!tx || !tx.trim()) {
          addToast('Please enter a Transaction ID.', 'error');
          return;
      }
      store.markBatchCreatorPay(saleIds, tx);
      addToast('Payment marked as SENT.', 'success');
      if (user) setSales(store.getBusinessSales(user.id));
      // clear the input for that creator
      setBatchCreatorTx(prev => ({ ...prev, [creatorId]: '' }));
  };

  // The "One Click" Mark All as Paid
  const handleMarkAllCreatorsPaid = (allSaleIds: string[]) => {
     if (!markAllTx.trim()) {
         addToast('Please enter the Mass Pay Reference ID (e.g. from PayPal/Bank).', 'error');
         return;
     }
     if (window.confirm("CONFIRM: You have already sent these funds externally? The platform will mark all debts as settled.")) {
         store.markBatchCreatorPay(allSaleIds, markAllTx);
         addToast('All pending creator debts marked as SENT.', 'success');
         if(user) setSales(store.getBusinessSales(user.id));
         setMarkAllTx('');
     }
  };

  const generateCSVForPayout = (payouts: any[]) => {
      const headers = "Recipient Email,Amount,Currency,Note,Reference ID\n";
      const rows = payouts.map(p => {
          const email = p.payoutDetails?.method === 'PAYPAL' ? p.payoutDetails.identifier : (p.payoutDetails?.identifier || 'MISSING_INFO');
          return `${email},${p.total.toFixed(2)},USD,Commission Payout,${p.saleIds.length}_SALES`;
      }).join("\n");
      
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payout_batch_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
  };

  const pendingLinks = myLinks.filter(l => l.status === 'PENDING_ASSIGNMENT');
  const activeLinks = myLinks.filter(l => l.status === 'ACTIVE');

  // Calculations for Payout Modal
  const unpaidPlatformFees = sales.filter(s => !s.platformFeePaid).reduce((acc, s) => acc + s.platformFee, 0);
  
  // Group unpaid creator payouts by Creator ID
  const creatorPayouts = sales
    .filter(s => s.status === 'PENDING' || s.status === 'DUE' || s.status === 'DISPUTED')
    .reduce((acc, sale) => {
        if (!acc[sale.creatorId]) {
            acc[sale.creatorId] = { total: 0, saleIds: [], creatorName: '', payoutDetails: null };
        }
        acc[sale.creatorId].total += sale.creatorPay;
        acc[sale.creatorId].saleIds.push(sale.id);
        
        // Find Creator Details
        const creator = allUsers.find(u => u.id === sale.creatorId);
        if (creator) {
            acc[sale.creatorId].creatorName = creator.name;
            acc[sale.creatorId].payoutDetails = creator.payoutDetails;
        }
        return acc;
    }, {} as Record<string, { total: number, saleIds: string[], creatorName: string, payoutDetails: any }>);

  const creatorPayoutList = Object.entries(creatorPayouts);
  const allPendingCreatorSaleIds = creatorPayoutList.flatMap(([_, data]) => data.saleIds);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 relative">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 uppercase tracking-wide">Command Center</h1>
            <p className="text-slate-500 font-mono text-sm">Manage protocol assets and deploy creator links.</p>
          </div>
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
            <Button variant="secondary" className="gap-2" onClick={triggerImport}><Upload size={18} /> Import CSV</Button>
            <Link to="/business"><Button className="gap-2"><Plus size={18} /> Post New Campaign</Button></Link>
          </div>
        </div>

        {/* --- PAYOUT SETTLEMENT CONSOLE --- */}
        {/* Trigger Banner */}
        {(unpaidPlatformFees > 0 || creatorPayoutList.length > 0) && (
            <div className="bg-cyber-black rounded-xl overflow-hidden shadow-2xl border border-neon-green mb-8 relative group">
                 <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                 <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                     <div className="flex items-center gap-4">
                         <div className="p-4 bg-neon-green/10 rounded-full border border-neon-green/30 animate-pulse">
                             <DollarSign className="text-neon-green" size={32} />
                         </div>
                         <div>
                             <h2 className="text-white font-display font-bold text-xl uppercase tracking-widest">Financial Settlement Console</h2>
                             <p className="text-gray-400 font-mono text-sm">
                                 Outstanding Balance: <span className="text-white font-bold">${(unpaidPlatformFees + creatorPayoutList.reduce((acc, [_, v]) => acc + v.total, 0)).toFixed(2)}</span>
                             </p>
                         </div>
                     </div>
                     <Button variant="primary" onClick={() => setIsPayoutModalOpen(true)} className="shadow-[0_0_20px_rgba(57,255,20,0.4)] text-lg px-8 py-4">
                         OPEN SETTLEMENT CONSOLE
                     </Button>
                 </div>
            </div>
        )}

        {/* Payout Modal */}
        {isPayoutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
                <div className="w-full max-w-7xl bg-cyber-gray border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-black">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Settlement Protocol</h2>
                            <p className="text-neon-green font-mono text-xs">>> Execute Payments in Batch Sequence</p>
                        </div>
                        <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
                        
                        {/* COLUMN 1: PLATFORM FEES (Left Panel - 2/5 width) */}
                        <div className="lg:col-span-2 space-y-6 border-r border-gray-700 pr-4">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-neon-blue text-black font-bold px-3 py-1 text-sm rounded-sm font-mono">STEP 01</span>
                                <h3 className="text-white font-bold uppercase">Platform Treasury (30%)</h3>
                            </div>
                            <div className="bg-black/50 border border-neon-blue/30 p-6 relative overflow-hidden">
                                {unpaidPlatformFees <= 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-neon-green">
                                        <Check size={48} className="mb-2" />
                                        <p className="font-mono font-bold">ALL FEES PAID</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-400 text-xs font-mono uppercase mb-1">Total Owed to Social Swarm</p>
                                        <p className="text-4xl font-mono font-bold text-neon-blue mb-6">${unpaidPlatformFees.toFixed(2)}</p>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-gray-900 p-4 border border-gray-700">
                                                <p className="text-[10px] text-gray-500 uppercase mb-2">Send To ({systemSettings.adminPayoutMethod})</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-grow bg-black p-2 text-neon-blue font-mono text-xs break-all border border-gray-800">{systemSettings.adminPayoutIdentifier}</code>
                                                    <button onClick={() => copyToClipboard(systemSettings.adminPayoutIdentifier)} className="p-2 hover:bg-gray-800 text-white"><Copy size={16} /></button>
                                                </div>
                                                <div className="mt-2 text-right">
                                                    <a href={systemSettings.adminPayoutIdentifier} target="_blank" rel="noreferrer" className="text-xs text-white underline hover:text-neon-blue">
                                                        Open Payment Link <ExternalLink size={10} className="inline" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-800 pt-4">
                                                <label className="block text-xs text-gray-400 uppercase mb-2">Verify Bulk Payment</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        className="flex-grow bg-black border border-gray-600 text-white px-3 py-2 text-sm font-mono focus:border-neon-blue outline-none"
                                                        placeholder="Paste One Receipt ID"
                                                        value={batchPlatformTx}
                                                        onChange={(e) => setBatchPlatformTx(e.target.value)}
                                                    />
                                                    <Button variant="outline" onClick={handleBulkPayPlatform}>Mark Fees Paid</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2: CREATOR PAYOUTS (Right Panel - 3/5 width) */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="bg-neon-pink text-black font-bold px-3 py-1 text-sm rounded-sm font-mono">STEP 02</span>
                                    <div>
                                        <h3 className="text-white font-bold uppercase">Creator Payroll (70%)</h3>
                                        <p className="text-[10px] text-gray-400 font-mono">DIRECT TRANSFER REQUIRED - DO NOT SEND TO PLATFORM</p>
                                    </div>
                                </div>
                                {creatorPayoutList.length > 0 && (
                                    <button 
                                        onClick={() => generateCSVForPayout(creatorPayoutList.map(([_, data]) => data))}
                                        className="flex items-center gap-2 text-xs text-neon-green hover:text-white border border-neon-green hover:bg-neon-green/20 px-3 py-2 transition-all"
                                    >
                                        <Download size={14} /> Download Mass Pay CSV
                                    </button>
                                )}
                            </div>

                            <div className="bg-black/50 border border-gray-700 p-1 h-[400px] overflow-y-auto custom-scrollbar relative">
                                {creatorPayoutList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <Wallet size={48} className="mb-2 opacity-50" />
                                        <p className="font-mono">NO PENDING PAYOUTS</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 p-4">
                                        {creatorPayoutList.map(([creatorId, data]) => (
                                            <div key={creatorId} className="bg-cyber-gray border border-gray-600 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neon-pink transition-colors">
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-white">{data.creatorName}</h4>
                                                        <span className="font-mono font-bold text-neon-pink">${data.total.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-1">
                                                        <span className="bg-gray-800 px-2 py-0.5 text-white">{data.payoutDetails?.method || 'UNKNOWN'}</span>
                                                        <span className="text-gray-500 truncate max-w-[200px]">{data.payoutDetails?.identifier}</span>
                                                        <button onClick={() => copyToClipboard(data.payoutDetails?.identifier || '')} className="text-neon-pink hover:text-white"><Copy size={12}/></button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 md:w-1/2">
                                                    <input 
                                                        className="flex-grow bg-black border border-gray-600 text-white px-2 py-1 text-xs font-mono focus:border-neon-pink outline-none"
                                                        placeholder="Individual TX ID"
                                                        value={batchCreatorTx[creatorId] || ''}
                                                        onChange={(e) => setBatchCreatorTx({...batchCreatorTx, [creatorId]: e.target.value})}
                                                    />
                                                    <Button size="sm" variant="secondary" className="whitespace-nowrap" onClick={() => handleBulkPayCreator(creatorId, data.saleIds)}>
                                                        Mark Sent
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mass Update Section */}
                            {creatorPayoutList.length > 0 && (
                                <div className="border-t-2 border-neon-pink pt-4 mt-4 bg-pink-900/10 p-4">
                                    <div className="flex items-start gap-2 mb-3">
                                        <AlertCircle size={20} className="text-neon-pink mt-0.5" />
                                        <div>
                                            <h4 className="text-white font-bold text-sm uppercase">Bulk Update: Mark All Paid</h4>
                                            <p className="text-[11px] text-gray-400 leading-tight">
                                                Use this ONLY if you used a "Mass Pay" feature (e.g. PayPal Payouts) to send funds to all creators above.
                                                <br/> <span className="text-neon-pink">You certify that you have sent the funds directly to them.</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <input 
                                            className="flex-grow bg-black border border-neon-pink/50 text-white px-4 py-2 text-sm font-mono focus:border-neon-pink outline-none"
                                            placeholder="Paste 'Mass Pay' Reference ID here..."
                                            value={markAllTx}
                                            onChange={(e) => setMarkAllTx(e.target.value)}
                                        />
                                        <Button variant="neon" onClick={() => handleMarkAllCreatorsPaid(allPendingCreatorSaleIds)}>
                                            Confirm All Sent
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Pending Requests Panel - CRITICAL ACTION ZONE */}
        {pendingLinks.length > 0 && (
            <div className="bg-white rounded-xl shadow-2xl border-2 border-neon-pink mb-10 overflow-hidden ring-4 ring-pink-100">
                <div className="p-6 border-b border-pink-200 bg-pink-50">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="text-neon-pink animate-bounce" size={24} />
                        <h2 className="text-xl font-display font-bold text-pink-700 uppercase tracking-wider">
                             Action Required: Link Assignments ({pendingLinks.length})
                        </h2>
                    </div>
                    <p className="text-sm text-pink-800 font-medium max-w-3xl">
                        Creators have applied to your campaign. You must generate a unique Affiliate/Tracking Link in your store's backend (Shopify/WooCommerce) and assign it to them below. They cannot start selling until you do this.
                    </p>
                </div>
                <div className="p-6 space-y-6 bg-white">
                    {pendingLinks.map(link => {
                        const campaign = campaigns.find(c => c.id === link.campaignId);
                        return (
                            <div key={link.id} className="bg-slate-50 p-6 rounded-lg border-2 border-slate-200 hover:border-neon-blue transition-all shadow-sm">
                                
                                {/* User Info */}
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-lg font-bold shadow-md">
                                        {link.creatorName.substring(0,1).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-slate-900">{link.creatorName}</p>
                                        <p className="text-xs text-slate-500">Applying for Campaign: <span className="font-medium text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{campaign?.productName}</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                    {/* Field 1: Affiliate Tracking ID */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                            1. Create & Enter Tracking ID
                                        </label>
                                        <input 
                                            placeholder="e.g. SARAH20" 
                                            className="w-full border-2 border-slate-300 p-3 rounded-md text-sm focus:border-neon-blue focus:ring-0 outline-none transition-all bg-white font-mono"
                                            value={assignInputs[link.id]?.code || ''}
                                            onChange={(e) => handleAssignChange(link.id, 'code', e.target.value)}
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            Create this code in your Shopify/Store dashboard first. It tracks the sale.
                                        </p>
                                    </div>

                                    {/* Field 2: Destination URL */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                            2. Enter Full Destination URL
                                        </label>
                                        <input 
                                            placeholder="e.g. https://yoursite.com/product?ref=SARAH20" 
                                            className="w-full border-2 border-slate-300 p-3 rounded-md text-sm focus:border-neon-blue focus:ring-0 outline-none transition-all bg-white font-mono"
                                            value={assignInputs[link.id]?.url || ''}
                                            onChange={(e) => handleAssignChange(link.id, 'url', e.target.value)}
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            The exact link the creator will share. Verify it works.
                                        </p>
                                    </div>
                                </div>

                                {/* Field 3: Optional Discount Code */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">
                                            3. Discount Code (Optional)
                                        </label>
                                        <button 
                                            onClick={() => toggleDiscountField(link.id)} 
                                            className="text-xs text-blue-600 hover:underline font-bold"
                                        >
                                            {showDiscountInput[link.id] ? 'Hide' : 'Add Discount Code?'}
                                        </button>
                                    </div>
                                    
                                    {showDiscountInput[link.id] ? (
                                        <input 
                                            placeholder="e.g. SARAH20 (If different from ID)" 
                                            className="w-full md:w-1/2 border border-blue-200 bg-blue-50 p-2.5 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={assignInputs[link.id]?.discountCode || ''}
                                            onChange={(e) => handleAssignChange(link.id, 'discountCode', e.target.value)}
                                        />
                                    ) : null}
                                </div>
                                
                                <div className="flex justify-end pt-6">
                                    <Button size="md" onClick={() => handleSaveLink(link)} className="shadow-lg w-full md:w-auto bg-neon-green text-black hover:bg-green-400 border-transparent">
                                        <Check size={18} className="mr-2"/> Activate Creator
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={24} /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Sales Volume</p>
                <h3 className="text-2xl font-bold text-slate-900">${sales.reduce((acc, s) => acc + s.saleAmount, 0).toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={24} /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Affiliates</p>
                <h3 className="text-2xl font-bold text-slate-900">{activeLinks.length}</h3>
              </div>
            </div>
          </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><i className="fas fa-receipt text-2xl"></i></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Reported Transactions</p>
                <h3 className="text-2xl font-bold text-slate-900">{sales.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Active Operatives (Affiliate List) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Active Network Operatives</h2>
                    <p className="text-sm text-slate-500">Manage assigned links for your creators.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                {activeLinks.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <p>No active affiliates yet. Wait for creators to apply.</p>
                    </div>
                ) : (
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-medium uppercase text-xs tracking-wider">Creator</th>
                                <th className="px-6 py-3 font-medium uppercase text-xs tracking-wider">Campaign</th>
                                <th className="px-6 py-3 font-medium uppercase text-xs tracking-wider">Tracking ID</th>
                                <th className="px-6 py-3 font-medium uppercase text-xs tracking-wider">Destination Link</th>
                                <th className="px-6 py-3 font-medium uppercase text-xs tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {activeLinks.map(link => (
                                <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                                                {link.creatorName.substring(0,1)}
                                            </div>
                                            {link.creatorName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {campaigns.find(c => c.id === link.campaignId)?.productName}
                                    </td>
                                    
                                    {/* Editable Columns */}
                                    {editingLinkId === link.id ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <input 
                                                    className="w-full p-2 border border-blue-300 rounded text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={editFormData.code}
                                                    onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                                                    placeholder="Tracking ID"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    className="w-full p-2 border border-blue-300 rounded text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={editFormData.url}
                                                    onChange={(e) => setEditFormData({...editFormData, url: e.target.value})}
                                                    placeholder="https://..."
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveEditing(link.id)} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={16} /></button>
                                                    <button onClick={cancelEditing} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={16} /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="bg-slate-100 border border-slate-200 rounded px-2 py-1 font-mono text-xs font-bold text-slate-700 inline-block w-fit">
                                                        ID: {link.code}
                                                    </span>
                                                    {link.discountCode && (
                                                        <span className="bg-blue-50 border border-blue-100 text-blue-600 rounded px-2 py-1 font-mono text-[10px] font-bold inline-block w-fit">
                                                            CODE: {link.discountCode}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 group">
                                                    <div className="max-w-[200px] truncate text-slate-500 text-xs font-mono bg-slate-50 p-1 rounded border border-transparent group-hover:border-slate-200 select-all">
                                                        {link.destinationUrl}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleCopyLink(link.destinationUrl, link.id)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                        title="Copy Link"
                                                    >
                                                        {copiedId === link.id ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                    <a 
                                                        href={link.destinationUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => startEditing(link)}
                                                    className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                                                >
                                                    <Pencil size={14} /> Edit
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Your Campaign Assets</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-medium text-slate-900">{campaign.productName}</h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-1">{campaign.description}</p>
                    <div className="flex gap-4 mt-2">
                        <p className="text-xs font-mono text-slate-400">Validation: {campaign.validationMethod}</p>
                        <p className="text-xs font-mono text-slate-400">Cycle: {campaign.paymentFrequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {campaign.totalCommissionRate}% Bounty
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && <div className="p-12 text-center text-slate-500">No active campaigns. Start by posting one!</div>}
          </div>
        </div>

        {/* Recent Sales Import Log */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Sales Imports</h2>
          </div>
          <div className="overflow-x-auto">
             <table className="min-w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 text-slate-500">
                 <tr>
                   <th className="px-6 py-3">Date</th>
                   <th className="px-6 py-3">Product</th>
                   <th className="px-6 py-3">Code</th>
                   <th className="px-6 py-3">Amount</th>
                   <th className="px-6 py-3">Method</th>
                   <th className="px-6 py-3">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 bg-white">
                 {sales.slice().reverse().slice(0, 5).map((sale) => (
                   <tr key={sale.id}>
                     <td className="px-6 py-4 text-slate-900">{new Date(sale.saleDate).toLocaleDateString()}</td>
                     <td className="px-6 py-4 text-slate-600">{sale.productName}</td>
                     <td className="px-6 py-4 font-mono text-xs text-slate-500">{sale.affiliateCode}</td>
                     <td className="px-6 py-4 text-slate-900 font-medium">${sale.saleAmount.toFixed(2)}</td>
                     <td className="px-6 py-4 text-xs text-slate-400">{sale.verificationMethod}</td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${sale.status === 'PAID' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'}`}>
                          {sale.status}
                        </span>
                     </td>
                   </tr>
                 ))}
                  {sales.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No sales recorded yet. Upload a CSV to start.</td></tr>}
               </tbody>
             </table>
          </div>
         </div>
      </div>
    </div>
  );
};
