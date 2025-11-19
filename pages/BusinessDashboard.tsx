import React, { useState, useRef, useEffect } from 'react';
import { Plus, TrendingUp, Users, Upload, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { store } from '../services/mockStore';
import { Campaign, SaleRecord, AffiliateLink } from '../types';
import { parseSalesCSV } from '../utils/validation';

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [assignInputs, setAssignInputs] = useState<Record<string, {code: string, url: string}>>({});
  
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

  const handleAssignChange = (linkId: string, field: 'code' | 'url', value: string) => {
      setAssignInputs(prev => ({
          ...prev,
          [linkId]: {
              ...prev[linkId],
              [field]: value
          }
      }));
  };

  const handleSaveLink = (link: AffiliateLink) => {
      const input = assignInputs[link.id];
      if (!input || !input.code || !input.url) {
          addToast('Code and Destination URL required.', 'error');
          return;
      }
      store.assignLink(link.id, input.code, input.url);
      addToast('Link assigned to Creator successfully.', 'success');
      if(user) setMyLinks(store.getBusinessLinks(user.id));
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Business Command</h1>
            <p className="text-slate-500">Manage campaigns and upload sales data.</p>
          </div>
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
            <Button variant="secondary" className="gap-2" onClick={triggerImport}><Upload size={18} /> Import CSV</Button>
            <Link to="/business"><Button className="gap-2"><Plus size={18} /> Post New Campaign</Button></Link>
          </div>
        </div>

        {/* Pending Requests Panel */}
        {pendingLinks.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-neon-pink mb-8 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-pink-50">
                    <h2 className="text-lg font-bold text-pink-700 flex items-center gap-2">
                        <Users size={20} /> Affiliate Link Requests ({pendingLinks.length})
                    </h2>
                    <p className="text-xs text-pink-600 mt-1">You must manually provide the unique affiliate link/code for these creators.</p>
                </div>
                <div className="p-6 space-y-4">
                    {pendingLinks.map(link => {
                        const campaign = campaigns.find(c => c.id === link.campaignId);
                        return (
                            <div key={link.id} className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="w-full md:w-1/4">
                                    <p className="font-bold text-slate-900">{link.creatorName}</p>
                                    <p className="text-xs text-slate-500">For: {campaign?.productName}</p>
                                </div>
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                    <input 
                                        placeholder="Assign Code (e.g. SARAH20)" 
                                        className="border p-2 rounded text-sm"
                                        value={assignInputs[link.id]?.code || ''}
                                        onChange={(e) => handleAssignChange(link.id, 'code', e.target.value)}
                                    />
                                    <input 
                                        placeholder="Full Destination URL (e.g. https://site.com/?ref=sarah)" 
                                        className="border p-2 rounded text-sm"
                                        value={assignInputs[link.id]?.url || ''}
                                        onChange={(e) => handleAssignChange(link.id, 'url', e.target.value)}
                                    />
                                </div>
                                <Button size="sm" onClick={() => handleSaveLink(link)}>Assign & Activate</Button>
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
                <h3 className="text-2xl font-bold text-slate-900">{myLinks.filter(l => l.status === 'ACTIVE').length}</h3>
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

        {/* Job Listings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Active Campaigns</h2>
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