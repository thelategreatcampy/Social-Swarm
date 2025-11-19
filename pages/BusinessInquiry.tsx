import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { analyzeCommissionOffer } from '../services/gemini';
import { PaymentFrequency, Campaign } from '../types';
import { store } from '../services/mockStore';
import { useAuth } from '../contexts/AuthContext';
import { isValidPrice, isValidCommission, isValidUrl } from '../utils/validation';
import { generateUUID } from '../utils/security';

export const BusinessInquiry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Gating State
  const [hasConnection, setHasConnection] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    productName: '',
    productPrice: '',
    targetUrl: '',
    baseCommissionRate: '',
    paymentFrequency: 'WEEKLY' as PaymentFrequency,
    description: '',
    email: user?.email || '',
    phone: '',
    refundPolicy: 'FINAL_UPON_PAYMENT' as 'FINAL_UPON_PAYMENT' | 'CLAWBACK_30_DAYS'
  });

  const [calculatedTotalRate, setCalculatedTotalRate] = useState<number>(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementText, setAgreementText] = useState('');
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check for Watchdog Connection
    if (user) {
      // Re-fetch fresh user data from store to ensure connection status is current
      const freshUser = store.getUserById(user.id);
      if (freshUser?.storeConnection?.status === 'ACTIVE') {
        setHasConnection(true);
      }
    }

    const base = parseFloat(formData.baseCommissionRate) || 0;
    let multiplier = 1;
    if (formData.paymentFrequency === 'MONTHLY') {
      multiplier = 1.10; 
    }
    setCalculatedTotalRate(Math.round(base * multiplier * 100) / 100);
  }, [formData.baseCommissionRate, formData.paymentFrequency, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors on change for better UX
    if (formErrors.length > 0) setFormErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!isValidPrice(formData.productPrice)) {
      errors.push("Price invalid: Must be a positive number.");
    }
    if (!isValidCommission(formData.baseCommissionRate)) {
      errors.push("Base Commission invalid: Must be between 5% and 90%.");
    }
    if (calculatedTotalRate > 95) {
       errors.push("Total Commission Liability is critically high (>95%). Business model unsustainable.");
    }
    if (!isValidUrl(formData.targetUrl)) {
      errors.push("Target URL invalid: Must include http:// or https://");
    }
    if (formData.description.length < 20) {
      errors.push("Description too short. Please provide detailed specs.");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;
    setIsAnalyzing(true);
    const analysis = await analyzeCommissionOffer(
      parseFloat(formData.productPrice),
      calculatedTotalRate,
      formData.description
    );
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const generateStandardizedAgreement = () => {
     const date = new Date().toLocaleDateString();
     
     return `DIGITAL ASSET LISTING AGREEMENT // SOCIAL SWARM PROTOCOL
DATE: ${date}

PARTIES:
1. PROVIDER: ${formData.companyName} (Hereinafter "Business")
2. PLATFORM: SOCIAL SWARM NETWORK

SECTION 1: ASSET SPECIFICATIONS
Product Name: ${formData.productName}
Unit Price: $${parseFloat(formData.productPrice).toFixed(2)}
Target URL: ${formData.targetUrl}

SECTION 2: COMMISSION STRUCTURE & SPLIT
Total Commission Liability: ${calculatedTotalRate}% of Gross Sale Price.
Platform Split: 33% of Commission to Social Swarm.
Creator Split: 66% of Commission to Creator (Netrunner).

SECTION 3: WATCHDOG AUDIT & PAYMENTS
A. The Business grants Social Swarm permanent read-only access to their sales ledger via the Watchdog API.
B. Revoking this access constitutes a breach of contract and immediate platform ban.
C. The Business agrees to settle debts manually via the interface within 48 hours of the selected cycle end (${formData.paymentFrequency}).

SECTION 4: COLLECTIONS CLAUSE
The Business explicitly agrees that if payment is not received within 7 days of the due date, Social Swarm is authorized to:
   1. Immediately ban the Business from the network.
   2. Sell the debt to a third-party collections agency.
   3. Pursue legal action for the full amount plus all associated legal and collection fees.

SECTION 5: COMMUNICATIONS
The Business consents to direct contact from Social Swarm Administration via provided uplinks:
Email: ${formData.email}
Phone: ${formData.phone}

By digitally signing below, the Business acknowledges these terms are binding legal obligations.`;
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingAgreement(true);
    // Simulate processing delay for effect
    setTimeout(() => {
        const text = generateStandardizedAgreement();
        setAgreementText(text);
        setLoadingAgreement(false);
        setShowAgreement(true);
    }, 1000);
  };

  const handleFinalSubmit = () => {
    if (agreed) {
      const newCampaign: Campaign = {
        id: generateUUID(),
        businessId: user?.id || 'temp_biz',
        businessName: formData.companyName || 'Unknown Business',
        productName: formData.productName,
        productPrice: parseFloat(formData.productPrice),
        description: formData.description,
        targetUrl: formData.targetUrl,
        totalCommissionRate: calculatedTotalRate,
        paymentFrequency: formData.paymentFrequency,
        refundPolicy: formData.refundPolicy,
        contactPhone: formData.phone,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      
      store.addCampaign(newCampaign);
      setShowAgreement(false);
      navigate('/business-dashboard');
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-cyber-black border border-gray-700 text-neon-blue font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-none outline-none transition-all invalid:border-neon-red";
  const labelClasses = "block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1";

  // --- LOCK SCREEN IF NO WATCHDOG CONNECTION ---
  if (!hasConnection) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="border-2 border-neon-red bg-black/80 p-12 relative overflow-hidden shadow-[0_0_50px_rgba(255,42,42,0.2)]">
           <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>
           
           <i className="fas fa-lock text-6xl text-neon-red mb-6"></i>
           <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest mb-4">Protocol Locked</h1>
           
           <p className="text-gray-300 font-mono max-w-2xl mx-auto mb-8 leading-relaxed">
             <span className="text-neon-red font-bold">SECURITY ALERT:</span> To ensure the integrity of the network, you cannot launch a campaign without connecting your Sales Ledger (Shopify/WooCommerce/Stripe).
             <br/><br/>
             Social Swarm requires automated read-access to verify commissions. This protects our creators and ensures you only pay for verified sales.
           </p>
           
           <Link to="/business-dashboard">
             <Button variant="primary" size="lg" className="animate-pulse">
               <i className="fas fa-plug mr-2"></i> Connect Watchdog Uplink
             </Button>
           </Link>
           <p className="text-[10px] text-gray-500 mt-4 font-mono uppercase">Return to Command Center to establish connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative">
      <div className="text-center mb-12 border-b border-gray-800 pb-8">
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-wider">Initialize Campaign</h1>
        <p className="text-neon-green font-mono mt-2">>> Protocol: Pay_On_Success // Secured by Watchdog</p>
      </div>

      <div className="bg-cyber-gray border border-gray-700 overflow-hidden flex flex-col md:flex-row shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Sidebar / Info */}
        <div className="bg-cyber-dark border-r border-gray-700 p-8 md:w-1/3 text-white flex flex-col justify-between relative overflow-hidden">
           {/* Background Grid effect */}
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0xIDFoMXYxSDF6IiBmaWxsPSIjMzNmZjE0IiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
           
          <div className="relative z-10">
            <h3 className="text-xl font-display font-bold text-neon-pink mb-4 uppercase">Bounty Structure</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6 border-l-2 border-neon-pink pl-4">
              Define the parameters of the contract. The Swarm prioritizes high-yield targets.
            </p>
          </div>
          
          <div className="relative z-10 p-4 border border-neon-blue/30 bg-neon-blue/5 mt-auto">
            <p className="text-xs text-neon-blue uppercase tracking-widest font-bold mb-4 border-b border-neon-blue/30 pb-2">Contract Summary</p>
            
            <div className="flex justify-between items-center mb-2 font-mono text-sm">
               <span className="opacity-75 text-gray-400">CYCLE:</span>
               <span className="text-white">{formData.paymentFrequency}</span>
            </div>

            <div className="flex justify-between items-end pt-2">
              <span className="text-sm opacity-75 text-gray-400 font-mono">TOTAL COST:</span>
              <span className={`text-3xl font-display font-bold text-shadow-glow ${calculatedTotalRate > 90 ? 'text-neon-red' : 'text-neon-green'}`}>
                {calculatedTotalRate > 0 ? `${calculatedTotalRate}%` : '--'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-2 uppercase">
              *Percentage of gross sales price.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:w-2/3 bg-cyber-gray">
          <form onSubmit={handleReview} className="space-y-6">
            
            {formErrors.length > 0 && (
              <div className="bg-red-900/20 border border-neon-red p-4 mb-4">
                <h4 className="text-neon-red font-bold uppercase text-xs mb-2"><i className="fas fa-bug mr-2"></i>Input Logic Failure</h4>
                <ul className="list-disc pl-4">
                  {formErrors.map((err, i) => (
                    <li key={i} className="text-gray-300 text-xs font-mono">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Company Entity</label>
                <input required name="companyName" value={formData.companyName} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Contact Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} />
              </div>
            </div>
            
            <div>
                <label className={labelClasses}>Contact Phone (Direct Line)</label>
                <input required type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>Product Asset Name</label>
              <input required name="productName" onChange={handleChange} className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>Product Page URL (Destination)</label>
              <input required type="url" name="targetUrl" placeholder="https://myshop.com/product/serum" value={formData.targetUrl} onChange={handleChange} className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>Asset Description</label>
              <textarea required name="description" rows={3} onChange={handleChange} className={inputClasses} placeholder="Input product specifications..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Unit Price ($)</label>
                <input required type="number" min="0.01" step="0.01" name="productPrice" onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Base Bounty (%)</label>
                <input required type="number" min="5" max="90" name="baseCommissionRate" onChange={handleChange} placeholder="e.g. 25" className={inputClasses} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Payout Cycle</label>
                  <select name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange} className={inputClasses}>
                    <option value="WEEKLY">Weekly Cycle</option>
                    <option value="BIWEEKLY">Bi-Weekly Cycle</option>
                    <option value="MONTHLY">Monthly (+10% Surcharge)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Commission Refund Policy</label>
                  <select name="refundPolicy" value={formData.refundPolicy} onChange={handleChange} className={inputClasses}>
                    <option value="FINAL_UPON_PAYMENT">Final Upon Payment (Recommended)</option>
                    <option value="CLAWBACK_30_DAYS">30-Day Clawback Period</option>
                  </select>
                </div>
            </div>

            <div className="flex justify-end pt-2">
               <Button type="button" variant="outline" size="sm" onClick={handleAnalyze} loading={isAnalyzing}>
                 <i className="fas fa-microchip mr-2"></i> Run Analysis
               </Button>
            </div>

            {aiAnalysis && (
              <div className="bg-neon-green/10 border border-neon-green p-4 text-sm font-mono text-neon-green flex gap-3">
                <i className="fas fa-robot mt-1"></i>
                <p>{aiAnalysis}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-700">
              <Button type="submit" className="w-full" variant="primary" loading={loadingAgreement}>Review Agreement</Button>
            </div>
          </form>
        </div>
      </div>

      {showAgreement && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-black border border-neon-red shadow-[0_0_50px_rgba(255,42,42,0.2)] max-w-lg w-full flex flex-col max-h-[90vh] relative">
             {/* Holographic header */}
            <div className="p-6 border-b border-neon-red/30 bg-red-900/10">
              <h2 className="text-xl font-display font-bold text-neon-red uppercase tracking-widest">Contract & Liability</h2>
              <p className="text-xs font-mono text-red-400">BINDING FINANCIAL AGREEMENT</p>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm">
              <div className="text-gray-300 bg-black border border-gray-700 p-4 mb-4 shadow-inner">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{agreementText}</pre>
              </div>
              <label className="flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-700 bg-red-900/10 border-neon-red/30">
                <input type="checkbox" className="mt-1 bg-black border-neon-red checked:bg-neon-red" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span className="text-gray-300 text-xs font-bold">
                  I, representing {formData.companyName}, accept personal liability for these payments and acknowledge that unpaid commissions will be sent to collections.
                </span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-cyber-dark">
              <Button variant="secondary" onClick={() => setShowAgreement(false)}>Abort</Button>
              <Button disabled={!agreed} variant="danger" onClick={handleFinalSubmit}>Sign & Initialize</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};