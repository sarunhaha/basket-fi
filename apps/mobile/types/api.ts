/**
 * API types for the mobile app
 * These should match the backend API types
 */

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  displayName?: string;
  role: 'USER' | 'ADMIN';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Basket {
  id: string;
  name: string;
  description?: string;
  totalValue?: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BasketAsset {
  id: string;
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
}

export interface Allocation {
  id: string;
  basketId: string;
  tokenAddress: string;
  targetPercentage: string;
  currentPercentage: string;
  amount: string;
  basketAsset: BasketAsset;
}

export interface BasketWithAllocations extends Basket {
  allocations: Allocation[];
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'SWAP' | 'REBALANCE';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  amount: string;
  tokenAddress: string;
  transactionHash?: string;
  gasUsed?: string;
  gasPrice?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  basketId?: string;
  tokenAddress?: string;
  type: 'PRICE' | 'PERCENTAGE_CHANGE' | 'REBALANCE_NEEDED' | 'PORTFOLIO_VALUE';
  condition: 'ABOVE' | 'BELOW' | 'CHANGE_UP' | 'CHANGE_DOWN';
  value: string;
  isActive: boolean;
  isTriggered: boolean;
  lastTriggered?: string;
  createdAt: string;
}

export interface Rebalance {
  id: string;
  basketId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalValue?: string;
  trades: Trade[];
  estimatedGas?: string;
  transactionHash?: string;
  executedAt?: string;
  createdAt: string;
}

export interface Trade {
  from: string;
  to: string;
  amount: string;
  estimatedGas?: string;
}

export interface Pagination {
  hasNext: boolean;
  nextCursor?: string;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API Error types
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// Push notification payload types
export interface PushNotificationData {
  type: 'price_alert' | 'rebalance_alert' | 'transaction_update' | 'market_update';
  basketId?: string;
  alertId?: string;
  transactionId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Deep link types
export interface DeepLinkParams {
  basketId?: string;
  alertId?: string;
  screen?: string;
}

// Biometric authentication types
export interface BiometricConfig {
  isEnabled: boolean;
  supportedTypes: string[];
  hasHardware: boolean;
  isEnrolled: boolean;
}