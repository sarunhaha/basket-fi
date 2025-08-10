/**
 * Mobile API Client for Basket.fi
 * Extends the web API client with mobile-specific features
 */

import { z } from 'zod';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

// Base configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Token management with secure storage
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  static async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
  }

  static async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
  }

  static async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
    ]);
  }
}

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

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Mobile-specific API client
class MobileApiClient {
  private async checkNetworkConnection(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    // Check network connectivity
    const isConnected = await this.checkNetworkConnection();
    if (!isConnected) {
      throw new NetworkError('No internet connection');
    }

    const accessToken = await TokenManager.getAccessToken();
    
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
        if (error.status === 401) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            return this.request(endpoint, options, schema);
          } catch (refreshError) {
            await TokenManager.clearTokens();
            throw error;
          }
        }
        throw error;
      }
      throw new NetworkError('Network request failed');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = await TokenManager.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
    await TokenManager.setTokens(newAccessToken, newRefreshToken);
  }

  // Auth endpoints
  async login(walletAddress: string, signature: string, message: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });

    // Store tokens securely
    if (response.accessToken && response.refreshToken) {
      await TokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    await TokenManager.clearTokens();
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
  ) {
    return this.request(`/baskets/${id}/rebalance`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(data),
    });
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

  // Network status
  async getNetworkStatus() {
    return await NetInfo.fetch();
  }
}

export const apiClient = new MobileApiClient();
export { TokenManager };