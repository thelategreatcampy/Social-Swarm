import { User, Campaign, SaleRecord, SystemSettings, UserRole, AffiliateLink } from '../types';

class MockStore {
  private users: User[] = [];
  private campaigns: Campaign[] = [];
  private affiliateLinks: AffiliateLink[] = [];
  
  // Stub for sales/settings for Admin dashboard compatibility
  private sales: SaleRecord[] = [];
  private systemSettings: SystemSettings = {
      adminPayoutMethod: 'STRIPE_LINK',
      adminPayoutIdentifier: 'https://stripe.com/pay/social-swarm-treasury'
  };
  
  // Vault stubs
  public isVaultConnected = false;
  public vaultPermissionNeeded = false;

  private STORAGE_KEY = 'social_swarm_db_users';
  private CAMPAIGN_KEY = 'social_swarm_db_campaigns';
  private LINK_KEY = 'social_swarm_db_links';
  private SALES_KEY = 'social_swarm_db_sales';

  constructor() {
    this.load();
    
    // Mock data for demo if empty
    if (this.sales.length === 0) {
      this.sales = [
        {
           id: 'tx_demo_1',
           campaignId: 'c1',
           creatorId: 'u_demo_creator',
           businessId: 'b1',
           saleDate: new Date().toISOString(),
           productName: 'Neon Serum',
           saleAmount: 100.00,
           platformFee: 10.00,
           creatorPay: 20.00,
           status: 'PAID',
           platformFeePaid: true,
           platformFeeTxId: 'tx_plat_demo_1',
           creatorPayTxId: 'demo_pay_123'
        },
        {
           id: 'tx_demo_2',
           campaignId: 'c2',
           creatorId: 'u_demo_creator',
           businessId: 'b2',
           saleDate: new Date().toISOString(),
           productName: 'Cyber Deck',
           saleAmount: 500.00,
           platformFee: 50.00,
           creatorPay: 100.00,
           status: 'PENDING',
           platformFeePaid: false
        }
      ];
    }
  }

  private load() {
    try {
      const storedUsers = localStorage.getItem(this.STORAGE_KEY);
      if (storedUsers) this.users = JSON.parse(storedUsers);
      
      const storedCampaigns = localStorage.getItem(this.CAMPAIGN_KEY);
      if (storedCampaigns) this.campaigns = JSON.parse(storedCampaigns);

      const storedLinks = localStorage.getItem(this.LINK_KEY);
      if (storedLinks) this.affiliateLinks = JSON.parse(storedLinks);
      
      const storedSales = localStorage.getItem(this.SALES_KEY);
      if (storedSales) this.sales = JSON.parse(storedSales);

    } catch (e) {
      console.error("Failed to load db", e);
    }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    localStorage.setItem(this.CAMPAIGN_KEY, JSON.stringify(this.campaigns));
    localStorage.setItem(this.LINK_KEY, JSON.stringify(this.affiliateLinks));
    localStorage.setItem(this.SALES_KEY, JSON.stringify(this.sales));
  }

  ensureAdminExists() {
     const adminEmail = 'admin@socialswarm.net';
     if (!this.users.find(u => u.email === adminEmail)) {
        // Admin logic handled primarily in AuthContext
     }
  }

  login(email: string, passwordHash: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === passwordHash);
  }

  register(user: User): void {
     if (this.users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
       throw new Error("User already exists");
     }
     // Auto-activate store connection for business users for demo/testing purposes
     if (user.role === UserRole.BUSINESS) {
         user.storeConnection = { status: 'ACTIVE', platform: 'DEMO_MODE' };
     }
     this.users.push(user);
     this.save();
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...updates };
    this.save();
    return this.users[index];
  }
  
  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
      return this.users.find(u => u.id === id);
  }

  // Campaign Methods
  addCampaign(campaign: Campaign): void {
      this.campaigns.push(campaign);
      this.save();
  }

  getCampaigns(): Campaign[] {
      return this.campaigns;
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  // Link Methods
  createLink(link: AffiliateLink): void {
      this.affiliateLinks.push(link);
      this.save();
  }

  getCreatorLinks(creatorId: string): AffiliateLink[] {
      return this.affiliateLinks.filter(l => l.creatorId === creatorId);
  }

  getLinkByCode(code: string): AffiliateLink | undefined {
    return this.affiliateLinks.find(l => l.code === code);
  }

  recordClick(linkId: string): void {
    const link = this.affiliateLinks.find(l => l.id === linkId);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      this.save();
    }
  }

  findLinkForRedirect(campaignId: string, creatorId: string): AffiliateLink | undefined {
     return this.affiliateLinks.find(l => l.campaignId === campaignId && l.creatorId === creatorId);
  }

  // Sales Methods
  getSaleById(id: string): SaleRecord | undefined {
      return this.sales.find(s => s.id === id);
  }

  getCreatorSales(creatorId: string): SaleRecord[] {
      // If user is a demo creator, return all demo sales
      if (this.users.find(u => u.id === creatorId)?.email === 'operative@socialswarm.net') {
          return this.sales;
      }
      return this.sales.filter(s => s.creatorId === creatorId);
  }

  getAllSales(): SaleRecord[] { return this.sales; }
  
  updateSaleStatus(id: string, status: string, txId?: string) {
      const s = this.sales.find(x => x.id === id);
      if(s) {
          s.status = status as any;
          if (txId) s.creatorPayTxId = txId;
          this.save();
      }
  }

  markPlatformFeePaid(id: string, txId: string) {
      const s = this.sales.find(x => x.id === id);
      if(s) {
          s.platformFeePaid = true;
          s.platformFeeTxId = txId;
          this.save();
      }
  }

  // Admin / Vault Stubs
  getSystemSettings(): SystemSettings { return this.systemSettings; }
  updateSystemSettings(s: SystemSettings) { this.systemSettings = s; }
  
  adminVerifyPlatformFee(id: string, txId?: string) {
      const s = this.sales.find(x => x.id === id);
      if(s) {
          s.platformFeePaid = true;
          if (txId) s.platformFeeTxId = txId;
          this.save();
      }
  }
  resolveDispute(id: string, resolution: 'PAID' | 'PENDING') {
      const s = this.sales.find(x => x.id === id);
      if(s) {
          s.status = resolution;
          this.save();
      }
  }
  banUser(id: string) {
      this.users = this.users.filter(u => u.id !== id);
      this.save();
  }
  async connectVault(mode: any) { this.isVaultConnected = true; return true; }
}

export const store = new MockStore();