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
    method: 'STRIPE' | 'PAYPAL' | 'CRYPTO' | 'BANK';
    identifier: string;
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
    saleDate: string;
    productName: string;
    saleAmount: number;
    platformFee: number;
    creatorPay: number;
    status: 'PAID' | 'PENDING' | 'DUE' | 'DISPUTED' | 'PAYMENT_SENT';
    platformFeePaid: boolean;
    platformFeeTxId?: string;
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