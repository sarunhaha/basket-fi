/**
 * Authentication utilities for Web3 wallet integration
 */

import { ethers } from 'ethers';
import { apiClient, setTokens, clearTokens, getTokens } from './api-client';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
}

// Web3 wallet connection
export async function connectWallet(): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

// Sign message for authentication
export async function signMessage(address: string, message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Ensure we're using the correct address
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Address mismatch');
    }

    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw error;
  }
}

// Generate authentication message
export function generateAuthMessage(address: string, nonce?: string): string {
  const timestamp = new Date().toISOString();
  const nonceStr = nonce || Math.random().toString(36).substring(2);
  
  return `Welcome to Basket.fi!

Please sign this message to authenticate your wallet.

Wallet: ${address}
Timestamp: ${timestamp}
Nonce: ${nonceStr}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

// Complete authentication flow
export async function authenticateWallet(): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
}> {
  try {
    // Connect wallet
    const address = await connectWallet();
    
    // Generate message
    const message = generateAuthMessage(address);
    
    // Sign message
    const signature = await signMessage(address, message);
    
    // Authenticate with backend
    const response = await apiClient.login(address, signature, message);
    
    // Store tokens
    setTokens(response.accessToken, response.refreshToken);
    
    return response;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}

// Logout
export function logout(): void {
  clearTokens();
  // Optionally disconnect wallet
  if (typeof window !== 'undefined' && window.ethereum) {
    // Note: MetaMask doesn't have a disconnect method
    // The user needs to disconnect manually from the extension
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const { accessToken } = getTokens();
  return !!accessToken;
}

// Get current user
export async function getCurrentUser() {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    return await apiClient.getCurrentUser();
  } catch (error) {
    console.error('Failed to get current user:', error);
    // Clear tokens if user fetch fails (token might be invalid)
    clearTokens();
    return null;
  }
}

// Wallet event listeners
export function setupWalletListeners() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return;
  }

  // Account changed
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      logout();
      window.location.href = '/sign-in';
    } else {
      // User switched accounts - might need to re-authenticate
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Check if the new account matches the authenticated user
        // If not, logout and redirect to sign-in
        window.location.reload();
      }
    }
  });

  // Chain changed
  window.ethereum.on('chainChanged', (chainId: string) => {
    // Reload the page when chain changes
    window.location.reload();
  });

  // Disconnect
  window.ethereum.on('disconnect', () => {
    logout();
    window.location.href = '/sign-in';
  });
}

// Initialize auth on app start
export function initializeAuth() {
  if (typeof window !== 'undefined') {
    setupWalletListeners();
  }
}

// Types for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}