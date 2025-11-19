import React from 'react';

// Define shared types here to keep things organized

export enum UserRole {
  BUSINESS = 'BUSINESS',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
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

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}