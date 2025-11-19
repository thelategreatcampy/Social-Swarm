import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    refundPolicy: 'FINAL_UPON_PAYMENT' as 'FINAL_UPON_PAYMENT' | 'CLAWBACK_30_DAYS',
    validationMethod: '',
    advertisingGuidelines: '',
    prohibitedActs: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementText, setAgreementText] = useState('');
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [agreedLinks, setAgreedLinks] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Derived State Calculation (Optimized)
  const base = parseFloat(formData.baseCommissionRate) || 0;
  const multiplier = formData.paymentFrequency === 'MONTHLY' ? 1.10 : 1;
  const calculatedTotalRate = Math.round(base * multiplier * 100) / 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (formData.validationMethod.length < 10) {
        errors.push("Validation Method required. Explain how you track sales.");
    }
    if (formData.advertisingGuidelines.length < 10) {
        errors.push("Advertising Guidelines required.");
    }
    if (formData.prohibitedActs.length < 10) {
        errors.push("Prohibited Practices required (Compliance).");
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
Platform Fee: 30% of Total Commission.
Creator Payout: 70% of Total Commission.

SECTION 3: AFFILIATE TRACKING & VALIDATION
A. The Business acknowledges it is SOLELY RESPONSIBLE for generating and providing unique affiliate links/codes to creators.
B. The Business utilizes the following method for revenue validation: "${formData.validationMethod}".
C. The Business agrees to provide transparent access to this data upon audit request.

SECTION 4: NON-CIRCUMVENTION & NON-BYPASS
A. The Business agrees NOT to bypass the Social Swarm platform to transact directly with creators discovered via this network.
B. VIOLATION PENALTY: If a bypass attempt is detected, the Business agrees to forfeit ALL pending sales revenue and accepts immediate blacklisting.
C. CLAWBACK: Social Swarm reserves the right to legally pursue the Business for lost platform fees resulting from off-platform transactions.

SECTION 5: COLLECTIONS CLAUSE
The Business explicitly agrees that if payment is not received within 7 days of the due date, Social Swarm is authorized to:
   1. Immediately ban the Business from the network.
   2. Sell the debt to a third-party collections agency.
   3. Pursue legal action for the full amount plus all associated legal and collection fees.

By digitally signing below, the Business acknowledges these terms are binding legal obligations.`;
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingAgreement(true);
    setTimeout(() => {
        const text = generateStandardizedAgreement();
        setAgreementText(text);
        setLoadingAgreement(false);
        setShowAgreement(true);
    }, 1000);
  };

  const handleFinalSubmit = () => {
    if (agreed && agreedLinks) {
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
        createdAt: new Date().toISOString(),
        validationMethod: formData.validationMethod,
        advertisingGuidelines: formData.advertisingGuidelines,
        prohibitedActs: formData.prohibitedActs
      };
      
      store.addCampaign(newCampaign);
      setShowAgreement(false);
      navigate('/business-dashboard');
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-cyber-black border border-gray-700 text-neon-blue font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue rounded-none outline-none transition-all invalid:border-neon-red";
  const labelClasses = "block text-xs font-mono text-gray-500 uppercase tracking-widest mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative">
      <div className="text-center mb-12 border-b border-gray-800 pb-8">
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-wider">Initialize Campaign</h1>
        <p className="text-neon-green font-mono mt-2">>> Protocol: Pay_On_Success // Secured by Contract</p>
      </div>

      <div className="bg-cyber-gray border border-gray-700 overflow-hidden flex flex-col md:flex-row shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Sidebar / Info */}
        <div className="bg-cyber-dark border-r border-gray-700 p-8 md:w-1/3 text-white flex flex-col justify-between relative overflow-hidden">
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

            {/* Basic Info */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Product Asset Name</label>
                  <input required name="productName" onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Unit Price ($)</label>
                  <input required type="number" min="0.01" step="0.01" name="productPrice" onChange={handleChange} className={inputClasses} />
                </div>
            </div>

            <div>
              <label className={labelClasses}>Product Page URL (Destination)</label>
              <input required type="url" name="targetUrl" placeholder="https://myshop.com/product/serum" value={formData.targetUrl} onChange={handleChange} className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>Asset Description</label>
              <textarea required name="description" rows={3} onChange={handleChange} className={inputClasses} placeholder="Input product specifications..."></textarea>
            </div>

            {/* Validation & Compliance Section */}
            <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-neon-yellow font-display font-bold uppercase mb-4 text-sm">Validation & Compliance Protocols</h3>
                
                <div className="mb-6">
                    <label className={labelClasses}>Revenue Validation Method</label>
                    <p className="text-[10px] text-gray-400 mb-1">Explain how you track sales from our affiliates (e.g. Shopify Dashboard, Refersion, Custom Script). You must be able to provide this data.</p>
                    <input required name="validationMethod" placeholder="e.g. Shopify Sales Report by Referral Tag" value={formData.validationMethod} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Advertising Guidelines (Approved Actions)</label>
                        <textarea required name="advertisingGuidelines" rows={4} placeholder="e.g. Focus on the organic ingredients. Mention the 30-day money back guarantee." value={formData.advertisingGuidelines} onChange={handleChange} className={inputClasses}></textarea>
                    </div>
                    <div>
                        <label className={`${labelClasses} text-neon-red`}>Prohibited Practices (Restricted Actions)</label>
                        <textarea required name="prohibitedActs" rows={4} placeholder="e.g. DO NOT make medical claims. DO NOT use false testimonials." value={formData.prohibitedActs} onChange={handleChange} className={`${inputClasses} border-red-900/50 focus:border-neon-red`}></textarea>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
              <div>
                <label className={labelClasses}>Base Bounty (%)</label>
                <input required type="number" min="5" max="90" name="baseCommissionRate" onChange={handleChange} placeholder="e.g. 25" className={inputClasses} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Payout Cycle</label>
                    <select name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange} className={inputClasses}>
                        <option value="WEEKLY">Weekly</option>
                        <option value="BIWEEKLY">Bi-Weekly</option>
                        <option value="MONTHLY">Monthly (+10%)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Refund Policy</label>
                    <select name="refundPolicy" value={formData.refundPolicy} onChange={handleChange} className={inputClasses}>
                        <option value="FINAL_UPON_PAYMENT">Final</option>
                        <option value="CLAWBACK_30_DAYS">30-Day Clawback</option>
                    </select>
                  </div>
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
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-700 bg-red-900/10 border-neon-red/30">
                  <input type="checkbox" className="mt-1 bg-black border-neon-red checked:bg-neon-red" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span className="text-gray-300 text-xs font-bold">
                    I, representing {formData.companyName}, accept strict liability for these payments.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-700 bg-neon-blue/10 border-neon-blue/30">
                  <input type="checkbox" className="mt-1 bg-black border-neon-blue checked:bg-neon-blue" checked={agreedLinks} onChange={(e) => setAgreedLinks(e.target.checked)} />
                  <span className="text-gray-300 text-xs font-bold">
                    I agree to MANUALLY CREATE and ASSIGN unique affiliate links to all Creators who join my dashboard.
                  </span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-cyber-dark">
              <Button variant="secondary" onClick={() => setShowAgreement(false)}>Abort</Button>
              <Button disabled={!agreed || !agreedLinks} variant="danger" onClick={handleFinalSubmit}>Sign & Initialize</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};