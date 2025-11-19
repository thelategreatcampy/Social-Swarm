import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { store } from '../services/mockStore';

export const RedirectBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Support legacy (c+m) for backwards compat if needed, but prioritize 'ref'
    const refCode = searchParams.get('ref');
    const c = searchParams.get('c');
    const m = searchParams.get('m');

    let link;

    if (refCode) {
      link = store.getLinkByCode(refCode);
    } else if (c && m) {
      link = store.findLinkForRedirect(c, m);
    } else {
      setError("PROTOCOL FAILURE: MISSING IDENTIFIER (ref).");
      return;
    }

    if (link) {
      store.recordClick(link.id);
      
      // Fetch the campaign to get the destination URL
      const campaign = store.getCampaignById(link.campaignId);
      
      if (campaign && campaign.targetUrl) {
        let finalUrl = campaign.targetUrl.trim();
        
        // SECURITY: Enforce HTTP/HTTPS protocol to prevent javascript: attacks
        if (!finalUrl.match(/^https?:\/\//i)) {
          finalUrl = `https://${finalUrl.replace(/^[a-z]+:\/\//i, '')}`;
        }

        // Append the affiliate code automatically so the creator gets credit/user gets discount
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}discount=${encodeURIComponent(link.code)}`;
        
        console.log(`[RedirectBridge] Jumping to: ${finalUrl}`);
        
        // Simulate a brief "loading" delay for the visual effect
        setTimeout(() => {
           window.location.replace(finalUrl);
        }, 1500);
      } else {
        setError("DESTINATION NODE NOT FOUND (Missing Target URL in Campaign).");
      }
      
    } else {
      setError("LINK DEAD OR INVALID. PLEASE VERIFY.");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="border border-neon-red p-8 text-center max-w-md bg-red-900/10 shadow-[0_0_30px_rgba(255,42,42,0.3)]">
          <i className="fas fa-radiation text-neon-red text-4xl mb-4 animate-pulse"></i>
          <h2 className="text-xl font-display font-bold text-white mb-2">CONNECTION TERMINATED</h2>
          <p className="text-neon-red font-mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>
      
      <div className="text-center z-10">
        <div className="relative inline-block">
           <div className="w-24 h-24 border-t-4 border-neon-green rounded-full animate-spin"></div>
           <div className="w-24 h-24 border-b-4 border-neon-blue rounded-full animate-spin absolute top-0 left-0 animation-delay-500"></div>
        </div>
        
        <h2 className="text-white font-display font-bold text-2xl mt-8 tracking-widest animate-pulse">INITIALIZING UPLINK</h2>
        
        <div className="mt-4 space-y-1 font-mono text-xs text-neon-green">
           <p className="typing-effect">>> Verifying Click Authenticity...</p>
           <p className="typing-effect delay-100">>> Attaching Discount Protocol...</p>
           <p className="typing-effect delay-200">>> Warping to Destination...</p>
        </div>
      </div>
    </div>
  );
};