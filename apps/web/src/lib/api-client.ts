/**
 * API Client generated from OpenAPI spec
 * Provides type-safe API calls for Basket.fi
 */

import { z } from 'zod';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Auth token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const getTokens = () => {
  if (typeof window !== 'undefined' && !accessToken) {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');
  }
  return { accessToken, refreshToken };
};

// Schemas (from OpenAPI spec)
export const UserSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN']),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  language: z.string(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BasketSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  totalValue: z.string().nullable(),
  isPublic: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AllocationSchema = z.object({
  id: z.string(),
  basketId: z.string(),
  tokenAddress: z.string(),
  targetPercentage: z.string(),
  currentPercentage: z.string(),
  amount: z.string(),
  basketAsset: z.object({
    id: z.string(),
    tokenAddress: z.string(),
    symbol: z.string(),
    name: z.string(),
    decimals: z.number(),
    logoUri: z.string().nullable(),
  }),
});

export const BasketWithAllocationsSchema = BasketSchema.extend({
  allocations: z.array(AllocationSchema),
});

export const TransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'SWAP', 'REBALANCE']),
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED']),
  amount: z.string(),
  tokenAddress: z.string(),
  transactionHash: z.string().nullable(),
  gasUsed: z.string().nullable(),
  gasPrice: z.string().nullable(),
  createdAt: z.string(),
});

export const AlertSchema = z.object({
  id: z.string(),
  basketId: z.string().nullable(),
  tokenAddress: z.string().nullable(),
  type: z.enum(['PRICE', 'PERCENTAGE_CHANGE', 'REBALANCE_NEEDED', 'PORTFOLIO_VALUE']),
  condition: z.enum(['ABOVE', 'BELOW', 'CHANGE_UP', 'CHANGE_DOWN']),
  value: z.string(),
  isActive: z.boolean(),
  isTriggered: z.boolean(),
  lastTriggered: z.string().nullable(),
  createdAt: z.string(),
});

export const RebalanceSchema = z.object({
  id: z.string(),
  basketId: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
  totalValue: z.string().nullable(),
  trades: z.array(z.object({
    from: z.string(),
    to: z.string(),
    amount: z.string(),
    estimatedGas: z.string(),
  })),
  estimatedGas: z.string().nullable(),
  transactionHash: z.string().nullable(),
  executedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const PaginationSchema = z.object({
  hasNext: z.boolean(),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Basket = z.infer<typeof BasketSchema>;
export type BasketWithAllocations = z.infer<typeof BasketWithAllocationsSchema>;
export type Allocation = z.infer<typeof AllocationSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type Rebalance = z.infer<typeof RebalanceSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

// API Error types
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP client with auth and error handling
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const { accessToken } = getTokens();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.message || response.statusText,
          errorData.details
        );
      }

      const data = await response.json();
      return schema ? schema.parse(data) : data;
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle token refresh for 401 errors
        if (error.status === 401 && refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            return this.request(endpoint, options, schema);
          } catch (refreshError) {
            clearTokens();
            throw error;
          }
        }
        throw error;
      }
      throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const { refreshToken: token } = getTokens();
    if (!token) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
    setTokens(newAccessToken, newRefreshToken);
  }

  // Auth endpoints
  async login(walletAddress: string, signature: string, message: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request('/users/me', {}, UserSchema);
  }

  async updateUser(data: Partial<User>): Promise<User> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, UserSchema);
  }

  // Basket endpoints
  async getBaskets(params?: {
    cursor?: string;
    limit?: number;
    isPublic?: boolean;
  }): Promise<{ data: Basket[]; pagination: Pagination }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.isPublic !== undefined) searchParams.set('isPublic', params.isPublic.toString());

    const query = searchParams.toString();
    return this.request(`/baskets${query ? `?${query}` : ''}`, {}, z.object({
      data: z.array(BasketSchema),
      pagination: PaginationSchema,
    }));
  }

  async getBasket(id: string): Promise<BasketWithAllocations> {
    return this.request(`/baskets/${id}`, {}, BasketWithAllocationsSchema);
  }

  async createBasket(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    allocations: Array<{
      tokenAddress: string;
      targetPercentage: number;
    }>;
  }): Promise<Basket> {
    return this.request('/baskets', {
      method: 'POST',
      body: JSON.stringify(data),
    }, BasketSchema);
  }

  async updateBasket(id: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Basket> {
    return this.request(`/baskets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, BasketSchema);
  }

  async deleteBasket(id: string): Promise<void> {
    await this.request(`/baskets/${id}`, { method: 'DELETE' });
  }

  async rebalanceBasket(
    id: string,
    data: { dryRun?: boolean },
    idempotencyKey: string
  ): Promise<Rebalance> {
    return this.request(`/baskets/${id}/rebalance`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(data),
    }, RebalanceSchema);
  }

  // Allocation endpoints
  async updateAllocations(basketId: string, allocations: Array<{
    tokenAddress: string;
    targetPercentage: number;
  }>): Promise<Allocation[]> {
    return this.request(`/baskets/${basketId}/allocations`, {
      method: 'PUT',
      body: JSON.stringify({ allocations }),
    }, z.array(AllocationSchema));
  }

  // Transaction endpoints
  async getTransactions(params?: {
    cursor?: string;
    limit?: number;
    basketId?: string;
    type?: string;
  }): Promise<{ data: Transaction[]; pagination: Pagination }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.basketId) searchParams.set('basketId', params.basketId);
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`, {}, z.object({
      data: z.array(TransactionSchema),
      pagination: PaginationSchema,
    }));
  }

  // Alert endpoints
  async getAlerts(params?: {
    cursor?: string;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ data: Alert[]; pagination: Pagination }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());

    const query = searchParams.toString();
    return this.request(`/alerts${query ? `?${query}` : ''}`, {}, z.object({
      data: z.array(AlertSchema),
      pagination: PaginationSchema,
    }));
  }

  async createAlert(data: {
    basketId?: string;
    tokenAddress?: string;
    type: Alert['type'];
    condition: Alert['condition'];
    value: number;
  }): Promise<Alert> {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }, AlertSchema);
  }

  async updateAlert(id: string, data: {
    condition?: Alert['condition'];
    value?: number;
    isActive?: boolean;
  }): Promise<Alert> {
    return this.request(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, AlertSchema);
  }

  async deleteAlert(id: string): Promise<void> {
    await this.request(`/alerts/${id}`, { method: 'DELETE' });
  }

  // Price endpoints (public)
  async getTokenPrices(tokenAddress: string, params?: {
    from?: string;
    to?: string;
    interval?: '1h' | '1d' | '1w';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.interval) searchParams.set('interval', params.interval);

    const query = searchParams.toString();
    return this.request(`/prices/${tokenAddress}${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient();