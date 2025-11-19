import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 border-b border-neon-blue pb-4">
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Master Protocol Agreement</h1>
        <p className="text-neon-blue font-mono text-xs">LAST UPDATED: CURRENT_CYCLE</p>
      </div>

      <div className="space-y-8 font-mono text-sm text-gray-300 bg-black border border-gray-800 p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        
        <section>
          <h2 className="text-lg text-white font-bold uppercase mb-2 border-l-4 border-neon-green pl-3">1. Platform Structure & Fees</h2>
          <p className="leading-relaxed">
            Social Swarm ("The Platform") operates on a zero-overhead model for listing. 
            <br/><br/>
            <strong>A. No Listing Fees:</strong> Businesses pay $0.00 to list products.
            <br/>
            <strong>B. Commission-Only:</strong> Payments are only triggered upon a verified sale.
            <br/>
            <strong>C. The Split:</strong> All commissions are strictly divided: 
            <span className="text-neon-green"> 33% to Social Swarm</span> (Platform Fee) and 
            <span className="text-neon-pink"> 66% to the Creator</span> (Netrunner Payout).
          </p>
        </section>

        <section>
          <h2 className="text-lg text-white font-bold uppercase mb-2 border-l-4 border-neon-green pl-3">2. Watchdog Protocol & Verification</h2>
          <p className="leading-relaxed">
            <strong>A. Mandatory API Access:</strong> To ensure total transparency, all Business Entities MUST connect their store (Shopify/WooCommerce/Stripe) to the Social Swarm Watchdog Protocol.
            <br/>
            <strong>B. Automated Auditing:</strong> The Platform reserves the right to query the Business's sales ledger at any time to verify the use of affiliate discount codes.
            <br/>
            <strong>C. Anti-Fraud:</strong> Any attempt to revoke API access while active campaigns are running will result in an immediate permanent ban and blacklisting.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-white font-bold uppercase mb-2 border-l-4 border-neon-green pl-3">3. Tax Liability & Contractor Status</h2>
          <p className="leading-relaxed">
            <strong>A. Independent Contractors:</strong> All Creators (Netrunners) act as independent contractors. No employment relationship exists between the Creator and Social Swarm or the Business.
            <br/>
            <strong>B. Tax Responsibility:</strong> 
            Social Swarm does <u>NOT</u> issue Form 1099 or W-9 documentation. The Business pays the Creator directly via the Platform's interface.
            <br/>
            <span className="text-neon-yellow bg-yellow-900/20 p-1 block mt-2 border border-neon-yellow">
              WARNING: Both Businesses and Creators are solely responsible for reporting their own income and expenses to relevant tax authorities. Social Swarm functions strictly as a connection and tracking protocol, not a financial employer.
            </span>
          </p>
        </section>

        <section>
          <h2 className="text-lg text-neon-red font-bold uppercase mb-2 border-l-4 border-neon-red pl-3">4. Payments, Collections & Debt</h2>
          <p className="leading-relaxed">
            <strong>A. Mandatory Payments:</strong> Businesses must adhere to their selected payout cycle. Failure to pay within 48 hours of the cycle end date results in immediate blacklisting.
            <br/><br/>
            <strong>B. Collections & Legal Action:</strong> 
            <span className="text-white font-bold"> By using this platform, the Business Entity agrees that unpaid commissions constitute a legally binding debt.</span>
            <br/>
            If payment is not received, Social Swarm reserves the right to transfer this debt to a third-party collections agency and pursue legal action. The Business agrees to be liable for all collection fees, legal costs, and interest incurred.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-neon-red font-bold uppercase mb-2 border-l-4 border-neon-red pl-3">5. Platform Indemnification (For Creators)</h2>
          <p className="leading-relaxed">
            <strong>A. Non-Liability:</strong> 
            Social Swarm is a software provider. We do not hold funds. We do not process payroll.
            <br/>
            <strong>B. Release of Claims:</strong>
            By joining as a Creator, you explicitly agree that <span className="text-white font-bold">Social Swarm is NOT liable for unpaid commissions.</span> Your legal recourse for non-payment lies solely with the Business Entity that contracted your services. You agree to hold Social Swarm harmless in any dispute regarding non-payment.
          </p>
        </section>

      </div>

      <div className="mt-8 text-center">
        <Link to="/">
          <Button variant="secondary">Acknowledge & Return</Button>
        </Link>
      </div>
    </div>
  );
};