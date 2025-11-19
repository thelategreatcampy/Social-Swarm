import { Campaign, SaleRecord, User, UserRole, AffiliateLink, PaymentFrequency, SystemSettings } from '../types';
import { formatCurrency } from '../utils/validation';
import { generateUUID } from '../utils/security';

// --- Initial Mock Data ---
const ADMIN_USER: User = { 
  id: 'u_admin', 
  email: 'admin@socialswarm.net', 
  password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c312bf', 
  name: 'System Admin', 
  role: UserRole.ADMIN 
};

const MOCK_USERS: User[] = [
  ADMIN_USER,
  { id: 'u_creator_1', email: 'sarah@test.com', password: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Sarah Connor', role: UserRole.CREATOR, payoutDetails: { method: 'VENMO', identifier: '@sarah-c' } },
  { id: 'u_creator_2', email: 'neo@test.com', password: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Neo Anderson', role: UserRole.CREATOR, payoutDetails: { method: 'CRYPTO', identifier: '0x71C...F6d8', network: 'ETH' } },
  { id: 'u_business_1', email: 'cyberdyne@test.com', password: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Miles Dyson', companyName: 'Cyberdyne Systems', role: UserRole.BUSINESS }
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { 
    id: 'c_1', 
    businessId: 'u_business_1', 
    businessName: 'Cyberdyne Systems', 
    productName: 'Neural Network CPU', 
    productPrice: 199.99, 
    description: 'High-performance processing unit for autonomous systems.',
    targetUrl: 'https://cyberdyne.net/cpu', 
    totalCommissionRate: 25, 
    paymentFrequency: 'WEEKLY', 
    refundPolicy: 'FINAL_UPON_PAYMENT',
    contactPhone: '555-0199',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

const MOCK_SALES: SaleRecord[] = [
  {
    id: 'sale_001',
    campaignId: 'c_1',
    businessId: 'u_business_1',
    creatorId: 'u_creator_1',
    affiliateCode: 'SARAH2024',
    productName: 'Neural Network CPU',
    saleAmount: 199.99,
    saleDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalCommission: 50.00,
    platformFee: 16.50,
    creatorPay: 33.50,
    expectedPayoutDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'PENDING',
    platformFeePaid: false,
    verificationMethod: 'MANUAL_ENTRY'
  },
  {
    id: 'sale_002',
    campaignId: 'c_1',
    businessId: 'u_business_1',
    creatorId: 'u_creator_2',
    affiliateCode: 'NEO1',
    productName: 'Neural Network CPU',
    saleAmount: 199.99,
    saleDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    totalCommission: 50.00,
    platformFee: 16.50,
    creatorPay: 33.50,
    expectedPayoutDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'PAID',
    platformFeePaid: true,
    platformFeeTxId: 'tx_mock_123',
    creatorPayTxId: 'tx_mock_456',
    verificationMethod: 'CSV_IMPORT'
  }
];

const MOCK_LINKS: AffiliateLink[] = [
    { id: 'lnk_1', campaignId: 'c_1', creatorId: 'u_creator_1', code: 'SARAH2024', generatedUrl: 'http://localhost/go?ref=SARAH2024', clicks: 45 },
    { id: 'lnk_2', campaignId: 'c_1', creatorId: 'u_creator_2', code: 'NEO1', generatedUrl: 'http://localhost/go?ref=NEO1', clicks: 120 }
];

const DEFAULT_SETTINGS: SystemSettings = {
  adminPayoutMethod: 'STRIPE_LINK',
  adminPayoutIdentifier: 'https://buy.stripe.com/admin_placeholder',
};

interface ClickLog {
  id: string;
  creatorId: string;
  merchantName: string;
  timestamp: string;
  ipPlaceholder: string;
}

// --- IDB PERSISTENCE UTILITIES ---
const IDB_NAME = 'SocialSwarmSys';
const IDB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles', { keyPath: 'id' });
      }
    };
  });
};

const saveToIDB = async (storeName: string, data: any) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getFromIDB = async (storeName: string, key: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Store Logic ---

class MockStore {
  private users: User[] = MOCK_USERS;
  private campaigns: Campaign[] = MOCK_CAMPAIGNS;
  private links: AffiliateLink[] = MOCK_LINKS;
  private sales: SaleRecord[] = MOCK_SALES;
  private clickLogs: ClickLog[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;
  
  // Vault Handle (File System Access API)
  private vaultHandle: any = null; 
  public isVaultConnected: boolean = false;
  public vaultPermissionNeeded: boolean = false;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initPersistence();
    
    // Cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'commish_store') {
        this.loadFromStorage();
      }
    });
  }

  private async initPersistence() {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
    try {
      const backup = await getFromIDB('backups', 'master_snapshot');
      const local = localStorage.getItem('commish_store');
      
      let useIDB = false;
      if (backup && backup.timestamp) {
         if (!local) {
           useIDB = true;
         } else {
           const localData = JSON.parse(local);
           if (new Date(backup.timestamp).getTime() > new Date(localData.timestamp || 0).getTime()) {
             useIDB = true;
           }
         }
      }

      if (useIDB) {
        this.importData(JSON.stringify(backup.data));
      } else {
        this.loadFromStorage();
      }
    } catch (e) {
      console.error("IDB Init Failed", e);
      this.loadFromStorage();
    }
    this.restoreVaultConnection();
    this.ensureAdminExists();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('commish_store');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Array.isArray(data.users)) {
          this.users = data.users;
          this.campaigns = data.campaigns || MOCK_CAMPAIGNS;
          this.links = data.links || MOCK_LINKS;
          this.sales = data.sales || MOCK_SALES;
          this.clickLogs = data.clickLogs || [];
          this.settings = data.settings || DEFAULT_SETTINGS;
        }
      } catch(e) {
        console.error("Failed to parse store.", e);
      }
    }
  }

  ensureAdminExists() {
      const adminExists = this.users.some(u => u.email === ADMIN_USER.email);
      if (!adminExists) {
          this.users.unshift(ADMIN_USER);
          this.persist();
      }
  }

  private async persist() {
    const state = {
        users: this.users,
        campaigns: this.campaigns,
        links: this.links,
        sales: this.sales,
        clickLogs: this.clickLogs,
        settings: this.settings,
        timestamp: new Date().toISOString()
    };
    const dataStr = JSON.stringify(state);
    try { localStorage.setItem('commish_store', dataStr); } catch (e) {}
    try { await saveToIDB('backups', { id: 'master_snapshot', data: state, timestamp: state.timestamp }); } catch (e) {}
    if (this.vaultHandle) this.triggerVaultSave(dataStr);
  }

  async connectVault(mode: 'OPEN' | 'CREATE' | 'RESUME'): Promise<boolean> {
     try {
       const win = window as any;
       if (!win.showSaveFilePicker || !win.showOpenFilePicker) return false;
       let handle;
       if (mode === 'RESUME') {
          handle = this.vaultHandle;
          if (!handle) return false;
          const opts = { mode: 'readwrite' };
          if ((await handle.queryPermission(opts)) !== 'granted') {
             if ((await handle.requestPermission(opts)) !== 'granted') return false;
          }
       } else if (mode === 'CREATE') {
         const opts = {
           suggestedName: 'SOCIAL_SWARM_DB.json',
           types: [{ description: 'Social Swarm Database', accept: { 'application/json': ['.json'] } }],
         };
         handle = await win.showSaveFilePicker(opts);
       } else {
         const [fileHandle] = await win.showOpenFilePicker({
            types: [{ description: 'Social Swarm Database', accept: { 'application/json': ['.json'] } }],
           multiple: false
         });
         handle = fileHandle;
         const file = await handle.getFile();
         this.importData(await file.text());
       }
       this.vaultHandle = handle;
       this.isVaultConnected = true;
       this.vaultPermissionNeeded = false;
       await saveToIDB('handles', { id: 'default_vault', handle: handle });
       this.persist();
       return true;
     } catch (e) {
       return false;
     }
  }

  private async restoreVaultConnection() {
     try {
       const record = await getFromIDB('handles', 'default_vault');
       if (record && record.handle) {
         this.vaultHandle = record.handle;
         const perm = await this.vaultHandle.queryPermission({ mode: 'readwrite' });
         if (perm === 'granted') this.isVaultConnected = true;
         else { this.isVaultConnected = true; this.vaultPermissionNeeded = true; }
       }
     } catch (e) {}
  }

  private triggerVaultSave(jsonData: string) {
     if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
     this.saveDebounceTimer = setTimeout(async () => {
        if (!this.vaultHandle) return;
        if ((await this.vaultHandle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
           this.vaultPermissionNeeded = true; this.isVaultConnected = false; return;
        }
        try {
          const writable = await this.vaultHandle.createWritable();
          await writable.write(jsonData);
          await writable.close();
        } catch (e) { this.isVaultConnected = false; }
     }, 2000); 
  }
  
  importData(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      if (data.users && Array.isArray(data.users)) {
          this.users = data.users;
          this.campaigns = data.campaigns || [];
          this.links = data.links || [];
          this.sales = data.sales || [];
          this.clickLogs = data.clickLogs || [];
          this.settings = data.settings || DEFAULT_SETTINGS;
          this.persist();
      }
    } catch (e) { console.error("Import Failed", e); }
  }

  exportData(): string {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        users: this.users,
        campaigns: this.campaigns,
        sales: this.sales,
        links: this.links,
        settings: this.settings,
        clickLogs: this.clickLogs
      }, null, 2);
  }

  // --- System Settings ---
  getSystemSettings(): SystemSettings { return this.settings; }
  updateSystemSettings(newSettings: SystemSettings) { this.settings = newSettings; this.persist(); }

  // --- Auth & User ---
  login(email: string, passwordHash: string): User | null {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === passwordHash) || null;
  }

  register(user: User): User {
    if (this.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) throw new Error("IDENTITY_ALREADY_REGISTERED");
    this.users.push(user);
    this.persist();
    return user;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates };
    this.persist();
    return this.users[index];
  }

  getUserById(id: string): User | undefined { return this.users.find(u => u.id === id); }

  // --- Basic Getters ---
  getAllUsers() { return this.users; }
  getAllSales() { return this.sales; }
  getCampaigns() { return this.campaigns; }
  getBusinessCampaigns(businessId: string) { return this.campaigns.filter(c => c.businessId === businessId); }
  getCampaignById(id: string) { return this.campaigns.find(c => c.id === id); }
  getCreatorLinks(creatorId: string) { return this.links.filter(l => l.creatorId === creatorId); }
  getLinkByCode(code: string) { return this.links.find(l => l.code.toUpperCase() === code.toUpperCase()); }
  findLinkForRedirect(creatorId: string, merchantName: string) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.links.find(l => {
      const campaign = this.campaigns.find(c => c.id === l.campaignId);
      return campaign && l.creatorId === creatorId && normalize(campaign.businessName) === normalize(merchantName);
    });
  }
  
  // --- Actions ---
  banUser(userId: string) { this.users = this.users.filter(u => u.id !== userId); this.persist(); }
  resolveDispute(saleId: string, resolution: 'PAID' | 'PENDING') { const s = this.sales.find(s => s.id === saleId); if(s) { s.status = resolution; this.persist(); } }
  
  // Updated to accept optional transaction ID
  adminVerifyPlatformFee(saleId: string, txId?: string) { 
    const s = this.sales.find(s => s.id === saleId); 
    if(s) { 
      s.platformFeePaid = true; 
      if (txId) s.platformFeeTxId = txId;
      this.persist(); 
    } 
  }
  
  addCampaign(campaign: Campaign) { this.campaigns.push(campaign); this.persist(); }
  createLink(link: AffiliateLink) { this.links.push(link); this.persist(); }
  recordClick(linkId: string) { 
      const link = this.links.find(l => l.id === linkId); 
      if(link) { 
          link.clicks = (link.clicks||0)+1; 
          this.clickLogs.push({ id: generateUUID(), creatorId: link.creatorId, merchantName: '?', timestamp: new Date().toISOString(), ipPlaceholder: '127.0.0.1' });
          this.persist();
      }
  }

  recordSale(campaignId: string, affiliateCode: string, actualAmount?: number, verificationMethod: SaleRecord['verificationMethod'] = 'MANUAL_ENTRY'): SaleRecord | null {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    
    // Basic validation that code belongs to campaign, but allow import if we can verify code ownership via link
    let link = this.links.find(l => l.code.toUpperCase() === affiliateCode.toUpperCase());
    
    if (!campaign || !link || link.campaignId !== campaign.id) return null;

    const amount = Math.max(0, actualAmount || campaign.productPrice);
    const totalCommission = formatCurrency(amount * (campaign.totalCommissionRate / 100));

    const sale: SaleRecord = {
      id: generateUUID(),
      campaignId: campaign.id,
      businessId: campaign.businessId,
      creatorId: link.creatorId,
      affiliateCode: link.code,
      productName: campaign.productName,
      saleAmount: formatCurrency(amount),
      saleDate: new Date().toISOString(),
      totalCommission,
      platformFee: formatCurrency(totalCommission * (1/3)),
      creatorPay: formatCurrency(totalCommission * (2/3)),
      expectedPayoutDate: this.calculatePayoutDate(campaign.paymentFrequency),
      status: 'PENDING',
      platformFeePaid: false,
      verificationMethod: verificationMethod
    };

    this.sales.push(sale);
    this.persist();
    return sale;
  }

  getBusinessSales(businessId: string) { return this.sales.filter(s => s.businessId === businessId); }
  getCreatorSales(creatorId: string) { return this.sales.filter(s => s.creatorId === creatorId); }
  getSaleById(saleId: string) { return this.sales.find(s => s.id === saleId); }
  
  updateSaleStatus(saleId: string, newStatus: 'PENDING' | 'DUE' | 'PAYMENT_SENT' | 'PAID' | 'DISPUTED', txId?: string) {
    const sale = this.sales.find(s => s.id === saleId);
    if (sale) {
      sale.status = newStatus;
      if (txId) sale.creatorPayTxId = txId;
      this.persist();
    }
  }

  markPlatformFeePaid(saleId: string, txId?: string) {
    const sale = this.sales.find(s => s.id === saleId);
    if (sale) {
      sale.platformFeePaid = true;
      if (txId) sale.platformFeeTxId = txId;
      this.persist();
    }
  }

  private calculatePayoutDate(frequency: PaymentFrequency): string {
    const now = new Date();
    const date = new Date(now);
    if (frequency === 'WEEKLY') date.setDate(now.getDate() + 7);
    else if (frequency === 'BIWEEKLY') date.setDate(now.getDate() + 14);
    else if (frequency === 'MONTHLY') date.setMonth(now.getMonth() + 1);
    return date.toISOString();
  }
}

export const store = new MockStore();