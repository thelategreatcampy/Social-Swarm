import React, { useState, useRef, useEffect } from 'react';
import { Plus, TrendingUp, Users, Upload, Copy, Check, ExternalLink, Link as LinkIcon, AlertCircle, Pencil, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { store } from '../services/mockStore';
import { Campaign, SaleRecord, AffiliateLink } from '../types';
import { parseSalesCSV } from '../utils/validation';
import { copyToClipboard } from '../utils/security';

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [assignInputs, setAssignInputs] = useState<Record<string, {code: string, url: string, discountCode?: string}>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDiscountInput, setShowDiscountInput] = useState<Record<string, boolean>>({});
  
  // Edit Mode State
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ code: '', url: '' });

  useEffect(() => {
    if (user) {
      const refresh = () => {
        setCampaigns(store.getBusinessCampaigns(user.id));
        setSales(store.getBusinessSales(user.id));
        setMyLinks(store.getBusinessLinks(user.id));
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
  
  const pendingLinks = myLinks.filter(l => l.status === 'PENDING_ASSIGNMENT');
  const activeLinks = myLinks.filter(l => l.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
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

        {/* WORKFLOW STATUS INDICATOR */}
        <div className="bg-cyber-black text-white p-4 mb-8 border border-neon-blue shadow-lg">
            <p className="text-xs text-neon-blue font-bold uppercase mb-3">Protocol Sequence // How it Works</p>
            <div className="flex flex-col md:flex-row justify-between gap-4 text-sm font-mono">
                <div className="flex-1 flex items-center gap-2 opacity-50">
                    <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">1</span>
                    <span>Post Product</span>
                </div>
                <div className="hidden md:block text-gray-600">→</div>
                <div className={`flex-1 flex items-center gap-2 ${pendingLinks.length > 0 ? 'text-neon-pink animate-pulse font-bold' : 'opacity-50'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${pendingLinks.length > 0 ? 'bg-neon-pink text-black' : 'bg-gray-700'}`}>2</span>
                    <span>Creator Requests Link</span>
                </div>
                <div className="hidden md:block text-gray-600">→</div>
                <div className={`flex-1 flex items-center gap-2 ${pendingLinks.length > 0 ? 'text-white font-bold border-b-2 border-neon-pink pb-1' : 'opacity-50'}`}>
                    <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">3</span>
                    <span>YOU Assign Link</span>
                </div>
                <div className="hidden md:block text-gray-600">→</div>
                <div className="flex-1 flex items-center gap-2 opacity-50">
                    <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">4</span>
                    <span>Creator Promotes</span>
                </div>
            </div>
        </div>

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