import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { store } from '../services/mockStore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, SaleRecord, UserRole, Campaign, SystemSettings } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'users' | 'campaigns' | 'disputes' | 'treasury'>('overview');
  
  // Data Containers
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(store.getSystemSettings());
  
  // Vault State
  const [isVaultConnected, setIsVaultConnected] = useState(store.isVaultConnected);
  const [vaultPermissionNeeded, setVaultPermissionNeeded] = useState(store.vaultPermissionNeeded);

  // Treasury Form State
  const [treasuryForm, setTreasuryForm] = useState<SystemSettings>(store.getSystemSettings());

  // Force data refresh
  const refreshData = () => {
    setSales([...store.getAllSales()]);
    setUsers([...store.getAllUsers()]);
    setCampaigns([...store.getCampaigns()]);
    setSettings(store.getSystemSettings());
    setIsVaultConnected(store.isVaultConnected);
    setVaultPermissionNeeded(store.vaultPermissionNeeded);
  };

  useEffect(() => {
    refreshData();
    // Polling for vault status
    const interval = setInterval(() => {
        if (store.isVaultConnected !== isVaultConnected || store.vaultPermissionNeeded !== vaultPermissionNeeded) {
            setIsVaultConnected(store.isVaultConnected);
            setVaultPermissionNeeded(store.vaultPermissionNeeded);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [isVaultConnected, vaultPermissionNeeded]);

  if (!user || user.role !== UserRole.ADMIN) {
    return <div className="p-20 text-center text-neon-red font-display text-3xl animate-pulse">UNAUTHORIZED // INCIDENT LOGGED</div>;
  }

  // --- ACTIONS ---
  const handleVerifyFee = (saleId: string) => {
    store.adminVerifyPlatformFee(saleId);
    addToast("Platform fee marked as verified.", 'success');
    refreshData();
  };

  const handleResolveDispute = (saleId: string, resolution: 'PAID' | 'PENDING') => {
      store.resolveDispute(saleId, resolution);
      const msg = resolution === 'PAID' ? 'Transaction Forced to PAID' : 'Transaction Reset to PENDING';
      addToast(msg, resolution === 'PAID' ? 'success' : 'info');
      refreshData();
  };

  const handleBanUser = (userId: string, name: string) => {
      if(window.confirm(`TERMINATE USER: ${name}? This will wipe their access immediately.`)) {
          store.banUser(userId);
          addToast(`User ${name} terminated from the network.`, 'error');
          refreshData();
      }
  };

  const handleSaveTreasury = (e: React.FormEvent) => {
      e.preventDefault();
      store.updateSystemSettings(treasuryForm);
      setSettings(treasuryForm);
      addToast('Treasury Routes Updated', 'success');
  };

  const handleConnectVault = async (mode: 'CREATE' | 'OPEN' | 'RESUME') => {
      const success = await store.connectVault(mode);
      if (success) {
          setIsVaultConnected(true);
          setVaultPermissionNeeded(false);
          addToast("IRON-VAULT CONNECTED: LIVE SYNC ACTIVE", 'success');
          if (mode === 'OPEN') refreshData(); 
      } else {
          if (mode === 'RESUME') {
              addToast("Resume Failed. Please re-connect manually.", 'error');
          } else {
              addToast("Vault Connection Failed.", 'error');
          }
      }
  };

  // --- CALCULATIONS ---
  const totalCreators = users.filter(u => u.role === UserRole.CREATOR).length;
  const totalBusinesses = users.filter(u => u.role === UserRole.BUSINESS).length;
  const totalGrossSales = sales.reduce((acc, s) => acc + s.saleAmount, 0);
  const platformRevenueCollected = sales.reduce((acc, s) => acc + (s.platformFeePaid ? s.platformFee : 0), 0);
  const platformRevenuePending = sales.reduce((acc, s) => acc + (!s.platformFeePaid ? s.platformFee : 0), 0);
  const creatorPayoutsPending = sales.filter(s => s.status === 'PENDING' || s.status === 'DUE').reduce((acc, s) => acc + s.creatorPay, 0);
  const creatorPayoutsPaid = sales.filter(s => s.status === 'PAID').reduce((acc, s) => acc + s.creatorPay, 0);
  const activeDisputes = sales.filter(s => s.status === 'DISPUTED');

  const isBlocked = !isVaultConnected || vaultPermissionNeeded;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
        
        {/* SAFETY LOCKOUT MODAL */}
        {isBlocked && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-8 text-center">
                <div className="max-w-xl w-full border-4 border-neon-red p-12 bg-red-900/10 shadow-[0_0_100px_rgba(255,0,0,0.5)] relative overflow-hidden">
                     <div className="absolute inset-0 scanlines opacity-50 pointer-events-none"></div>
                     
                     <i className="fas fa-lock text-8xl text-neon-red mb-8 animate-pulse"></i>
                     <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-4">SECURITY LOCKDOWN</h1>
                     
                     <p className="text-neon-red font-mono text-lg mb-8 border-y border-neon-red/30 py-4">
                        {vaultPermissionNeeded 
                           ? "BROWSER PERMISSION EXPIRED. SYSTEM HALTED TO PREVENT DATA LOSS." 
                           : "DATABASE VAULT NOT CONNECTED. OPERATIONS SUSPENDED."}
                     </p>
                     
                     <div className="flex flex-col gap-4 max-w-xs mx-auto relative z-10">
                        {vaultPermissionNeeded ? (
                            <button onClick={() => handleConnectVault('RESUME')} className="bg-neon-yellow text-black font-bold py-4 uppercase font-mono hover:bg-white transition-colors shadow-[0_0_30px_rgba(252,238,10,0.4)] animate-pulse">
                                >> RESUME CONNECTION
                            </button>
                        ) : (
                            <>
                                <button onClick={() => handleConnectVault('OPEN')} className="bg-neon-blue text-black font-bold py-3 uppercase font-mono hover:bg-white transition-colors">
                                    MOUNT EXISTING DB
                                </button>
                                <button onClick={() => handleConnectVault('CREATE')} className="bg-transparent border border-gray-500 text-gray-400 py-3 uppercase font-mono hover:text-white hover:border-white transition-colors text-xs">
                                    INITIALIZE NEW SYSTEM
                                </button>
                            </>
                        )}
                     </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b-4 border-neon-red pb-4 gap-4">
            <div>
                <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Overseer Terminal</h1>
                <p className="text-neon-red font-mono text-sm">>> ROOT ACCESS: GRANTED</p>
            </div>
            
            {/* VAULT STATUS INDICATOR */}
            <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-3 px-4 py-2 border bg-neon-green/10 border-neon-green">
                    <div className="w-3 h-3 rounded-full bg-neon-green"></div>
                    <div>
                        <p className="text-xs font-bold font-mono uppercase text-neon-green">VAULT: ONLINE (SYNCING)</p>
                    </div>
                 </div>
                 <p className="text-[9px] text-gray-500 font-mono uppercase">Auto-Mirror: IndexedDB + HDD</p>
            </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="mb-8">
            <div className="flex space-x-1 bg-gray-900 p-1 border border-gray-800 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold font-mono uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-neon-red text-black' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>Overview</button>
                <button onClick={() => setActiveTab('ledger')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold font-mono uppercase tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-neon-blue text-black' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>Ledger</button>
                <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold font-mono uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-neon-green text-black' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>Identity</button>
                <button onClick={() => setActiveTab('campaigns')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold font-mono uppercase tracking-widest transition-all ${activeTab === 'campaigns' ? 'bg-neon-pink text-black' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>Contracts</button>
                <button onClick={() => setActiveTab('disputes')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold font-mono uppercase tracking-widest transition-all ${activeTab === 'disputes' ? 'bg-neon-yellow text-black animate-pulse' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>Disputes ({activeDisputes.length})</button>
                <button onClick={() => setActiveTab('treasury')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold font-mono uppercase tracking-widest transition-all ${activeTab === 'treasury' ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>Treasury Config</button>
            </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => setActiveTab('users')} className="bg-cyber-gray border border-gray-700 p-6 shadow-lg relative overflow-hidden cursor-pointer group hover:border-neon-green transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-users text-6xl text-white"></i></div>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2 group-hover:text-neon-green">Total Network Users</p>
                        <h2 className="text-4xl font-display font-bold text-white">{users.length}</h2>
                        <div className="mt-4 flex gap-4 text-xs font-mono">
                            <span className="text-neon-pink"><i className="fas fa-user-astronaut mr-1"></i> {totalCreators} Creators</span>
                            <span className="text-neon-blue"><i className="fas fa-building mr-1"></i> {totalBusinesses} Businesses</span>
                        </div>
                    </div>
                    <div onClick={() => setActiveTab('campaigns')} className="bg-cyber-gray border border-gray-700 p-6 shadow-lg relative overflow-hidden cursor-pointer group hover:border-neon-pink transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-cube text-6xl text-white"></i></div>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2 group-hover:text-neon-pink">Active Campaigns</p>
                        <h2 className="text-4xl font-display font-bold text-white">{campaigns.length}</h2>
                    </div>
                    <div onClick={() => setActiveTab('ledger')} className="bg-cyber-gray border border-gray-700 p-6 shadow-lg relative overflow-hidden cursor-pointer group hover:border-neon-blue transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-dollar-sign text-6xl text-white"></i></div>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2 group-hover:text-neon-blue">Gross Sales Volume</p>
                        <h2 className="text-4xl font-display font-bold text-white">${totalGrossSales.toFixed(2)}</h2>
                    </div>
                </div>
                {/* Finances */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black border border-neon-blue p-6">
                         <h3 className="text-neon-blue font-display font-bold uppercase mb-4 text-xl">Platform Revenue (1/3 Split)</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-gray-900 border border-gray-800">
                                 <span className="block text-xs text-gray-500 uppercase mb-1">Collected</span>
                                 <span className="text-2xl font-mono font-bold text-neon-green">${platformRevenueCollected.toFixed(2)}</span>
                             </div>
                             <div className="p-4 bg-gray-900 border border-gray-800">
                                 <span className="block text-xs text-gray-500 uppercase mb-1">Pending / Unpaid</span>
                                 <span className="text-2xl font-mono font-bold text-neon-yellow">${platformRevenuePending.toFixed(2)}</span>
                             </div>
                         </div>
                    </div>
                    <div className="bg-black border border-neon-pink p-6">
                         <h3 className="text-neon-pink font-display font-bold uppercase mb-4 text-xl">Creator Payouts (2/3 Split)</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-gray-900 border border-gray-800">
                                 <span className="block text-xs text-gray-500 uppercase mb-1">Paid</span>
                                 <span className="text-2xl font-mono font-bold text-neon-green">${creatorPayoutsPaid.toFixed(2)}</span>
                             </div>
                             <div className="p-4 bg-gray-900 border border-gray-800">
                                 <span className="block text-xs text-gray-500 uppercase mb-1">Pending</span>
                                 <span className="text-2xl font-mono font-bold text-neon-red">${creatorPayoutsPending.toFixed(2)}</span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- LEDGER TAB --- */}
        {activeTab === 'ledger' && (
            <div className="bg-cyber-gray border border-gray-700 p-6">
                <h3 className="text-white font-display font-bold uppercase mb-6">Global Transaction Matrix</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs font-mono">
                        <thead className="border-b border-gray-600 text-gray-400 bg-black/50">
                            <tr>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">ID / Hash</th>
                                <th className="py-3 px-4">Item</th>
                                <th className="py-3 px-4 text-right">Sale Amt</th>
                                <th className="py-3 px-4 text-right">Plat. Fee</th>
                                <th className="py-3 px-4 text-right">Creator Fee</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4">Platform Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-300">
                            {sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-black/30 transition-colors">
                                    <td className="py-3 px-4 text-gray-500">{new Date(sale.saleDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <span className="block text-neon-blue">#{sale.id.slice(0,6)}</span>
                                        {sale.platformFeeTxId && <span className="block text-[9px] text-gray-500">TX: {sale.platformFeeTxId.slice(0,8)}...</span>}
                                    </td>
                                    <td className="py-3 px-4">{sale.productName}</td>
                                    <td className="py-3 px-4 text-right font-bold">${sale.saleAmount.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-neon-blue">${sale.platformFee.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-neon-pink">${sale.creatorPay.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 ${sale.status === 'PAID' ? 'text-neon-green' : sale.status === 'DISPUTED' ? 'text-neon-red' : 'text-neon-yellow'}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {sale.platformFeePaid ? (
                                            <span className="text-neon-green font-bold"><i className="fas fa-check"></i> PAID</span>
                                        ) : (
                                            <button onClick={() => handleVerifyFee(sale.id)} className="text-gray-500 hover:text-white underline">Mark Received</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- TREASURY CONFIG TAB --- */}
        {activeTab === 'treasury' && (
            <div className="bg-black border border-white p-8 max-w-2xl">
                 <h3 className="text-white font-display font-bold uppercase mb-6 text-2xl"><i className="fas fa-university mr-2"></i> Central Treasury Configuration</h3>
                 <p className="font-mono text-sm text-gray-400 mb-8 border-l-2 border-neon-blue pl-4">
                     This is where Businesses will be instructed to send the 33% Platform Fee. Ensure these details are accurate to prevent revenue loss.
                 </p>
                 
                 <form onSubmit={handleSaveTreasury} className="space-y-6 font-mono">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-2">Receive Method</label>
                        <select 
                           className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                           value={treasuryForm.adminPayoutMethod}
                           onChange={(e) => setTreasuryForm({...treasuryForm, adminPayoutMethod: e.target.value as any})}
                        >
                            <option value="STRIPE_LINK">Stripe Payment Link (Recommended)</option>
                            <option value="CRYPTO">Crypto Wallet Address</option>
                            <option value="BANK_WIRE">Bank Wire Instructions</option>
                        </select>
                    </div>
                    
                    {treasuryForm.adminPayoutMethod === 'CRYPTO' && (
                         <div>
                            <label className="block text-xs text-gray-400 uppercase mb-2">Network</label>
                            <input 
                                className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                                value={treasuryForm.adminPayoutNetwork || ''}
                                placeholder="e.g. ERC-20 / TRC-20"
                                onChange={(e) => setTreasuryForm({...treasuryForm, adminPayoutNetwork: e.target.value})}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-400 uppercase mb-2">
                            {treasuryForm.adminPayoutMethod === 'STRIPE_LINK' ? 'Stripe Buy URL' : 
                             treasuryForm.adminPayoutMethod === 'CRYPTO' ? 'Wallet Address' : 'Wire Details'}
                        </label>
                        <textarea 
                           className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
                           rows={3}
                           value={treasuryForm.adminPayoutIdentifier}
                           onChange={(e) => setTreasuryForm({...treasuryForm, adminPayoutIdentifier: e.target.value})}
                        />
                    </div>

                    <Button type="submit" variant="primary" className="w-full">Update Treasury Route</Button>
                 </form>
            </div>
        )}

        {/* --- OTHER TABS --- */}
        {activeTab === 'users' && (
             <div className="bg-cyber-gray border border-gray-700 p-6">
                 <h3 className="text-white font-display font-bold uppercase mb-6">Identity Database</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs font-mono text-gray-300">
                        <thead><tr><th className="py-2">Role</th><th className="py-2">Name</th><th className="py-2">Email</th><th className="py-2">Action</th></tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-black/30">
                                    <td className="py-3"><span className={`font-bold ${u.role === 'ADMIN' ? 'text-neon-red' : 'text-neon-green'}`}>{u.role}</span></td>
                                    <td className="py-3">{u.companyName || u.name}</td>
                                    <td className="py-3">{u.email}</td>
                                    <td className="py-3">{u.role !== 'ADMIN' && <button onClick={() => handleBanUser(u.id, u.name)} className="text-red-500 border border-red-500 px-2 hover:bg-red-500 hover:text-white transition-colors">BAN</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
        )}

        {activeTab === 'campaigns' && (
             <div className="bg-cyber-gray border border-gray-700 p-6">
                 <h3 className="text-white font-display font-bold uppercase mb-6">Contract Registry</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs font-mono text-gray-300">
                        <thead><tr><th className="py-2">Entity</th><th className="py-2">Product</th><th className="py-2">Rate</th><th className="py-2">Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {campaigns.map(c => (
                                <tr key={c.id} className="hover:bg-black/30">
                                    <td className="py-3 text-neon-blue">{c.businessName}</td>
                                    <td className="py-3 font-bold">{c.productName}</td>
                                    <td className="py-3 text-neon-green">{c.totalCommissionRate}%</td>
                                    <td className="py-3">{c.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
        )}

        {activeTab === 'disputes' && (
            <div className="space-y-4">
                {activeDisputes.length === 0 ? <div className="text-center py-12 text-gray-500 font-mono">NO ACTIVE CONFLICTS.</div> : 
                 activeDisputes.map(sale => (
                    <div key={sale.id} className="bg-black border-l-4 border-neon-red p-6 flex justify-between items-center">
                        <div>
                             <h4 className="text-white font-bold">{sale.productName}</h4>
                             <p className="text-xs text-neon-red font-mono">TX ID: {sale.id}</p>
                        </div>
                        <div className="flex gap-2">
                             <Button size="sm" variant="secondary" onClick={() => handleResolveDispute(sale.id, 'PENDING')}>Reject (Reset)</Button>
                             <Button size="sm" variant="neon" onClick={() => handleResolveDispute(sale.id, 'PAID')}>Force Close (Paid)</Button>
                        </div>
                    </div>
                 ))
                }
            </div>
        )}
    </div>
  );
};