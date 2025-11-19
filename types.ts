import React from 'react';

// Define shared types here to keep things organized

export enum UserRole {
  BUSINESS = 'BUSINESS',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface StoreConnection {
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  platform?: string;
  apiKey?: string;
  storeUrl?: string;
  lastSyncTime?: string;
  scopes?: string[];
  provider?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Added for mock auth
  companyName?: string; // Added for Business role
  storeConnection?: StoreConnection; // Added for Watchdog
  payoutDetails?: {
    method: 'STRIPE' | 'PAYPAL' | 'CRYPTO' | 'BANK' | 'VENMO' | 'ZELLE' | 'STRIPE_LINK' | 'BANK_WIRE';
    identifier: string;
    network?: string;
  };
}

export interface JobListing {
  id: string;
  title: string;
  brandName: string;
  commissionRate: number;
  description: string;
  requirements: string[];
  postedDate: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  productName: string;
  productPrice: number;
  description: string;
  targetUrl: string;
  totalCommissionRate: number;
  paymentFrequency: PaymentFrequency;
  refundPolicy: string;
  contactPhone: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  createdAt: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Added for Admin Dashboard compatibility
export interface SaleRecord {
    id: string;
    campaignId?: string;
    creatorId?: string;
    businessId?: string;
    affiliateCode?: string;
    saleDate: string;
    productName: string;
    saleAmount: number;
    totalCommission: number;
    platformFee: number;
    creatorPay: number;
    expectedPayoutDate?: string;
    status: 'PAID' | 'PENDING' | 'DUE' | 'DISPUTED' | 'PAYMENT_SENT';
    platformFeePaid: boolean;
    platformFeeTxId?: string;
    creatorPayTxId?: string;
    verificationMethod?: 'MANUAL_ENTRY' | 'WATCHDOG_AUTO';
}

export interface AffiliateLink {
  id: string;
  campaignId: string;
  creatorId: string;
  code: string;
  generatedUrl: string;
  clicks: number;
}

export interface SystemSettings {
    adminPayoutMethod: 'STRIPE_LINK' | 'CRYPTO' | 'BANK_WIRE';
    adminPayoutNetwork?: string;
    adminPayoutIdentifier: string;
}