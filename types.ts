import React from 'react';

export enum UserRole {
  BUSINESS = 'BUSINESS',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN'
}

export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  companyName?: string; // Only for Business
  payoutDetails?: {
    method: 'PAYPAL' | 'VENMO' | 'ZELLE' | 'BANK_WIRE' | 'CRYPTO' | 'STRIPE_LINK';
    identifier: string; // Email, Handle, Wallet Address, or URL
    network?: string; // Only for Crypto (ETH, SOL, BTC)
  };
}

export interface SystemSettings {
  adminPayoutMethod: 'STRIPE_LINK' | 'CRYPTO' | 'BANK_WIRE';
  adminPayoutIdentifier: string;
  adminPayoutNetwork?: string;
}

export interface Campaign {
  id: string;
  businessId: string; // Link to the business user
  businessName: string;
  productName: string;
  productPrice: number;
  description: string;
  targetUrl: string; // The actual landing page for the product
  totalCommissionRate: number; // The total percentage (e.g. 30)
  paymentFrequency: PaymentFrequency;
  refundPolicy: 'FINAL_UPON_PAYMENT' | 'CLAWBACK_30_DAYS';
  contactPhone: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
}

export interface AffiliateLink {
  id: string;
  campaignId: string;
  creatorId: string;
  code: string;
  generatedUrl: string; // This is the BRIDGE url shared by creator
  clicks: number;
}

export interface SaleRecord {
  id: string;
  campaignId: string;
  creatorId: string;
  businessId: string;
  affiliateCode: string;
  productName: string;
  saleAmount: number;
  saleDate: string;
  
  // Financials
  totalCommission: number;
  platformFee: number; // 1/3
  creatorPay: number; // 2/3
  
  // Payout Status
  expectedPayoutDate: string;
  status: 'PENDING' | 'DUE' | 'PAYMENT_SENT' | 'PAID' | 'DISPUTED';
  
  platformFeePaid?: boolean; // Track if the platform fee was already handled
  
  // Evidence
  platformFeeTxId?: string; // Proof of payment to platform
  creatorPayTxId?: string; // Proof of payment to creator
  
  // Verification Source
  verificationMethod?: 'MANUAL_ENTRY' | 'CSV_IMPORT';
}

// UI Helper Types (Retained for Dashboard compatibility)
export interface JobListing {
  id: string;
  title: string;
  brandName: string;
  commissionRate: number;
  description: string;
  requirements: string[];
  postedDate: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}