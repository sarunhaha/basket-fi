/**
 * @fileoverview Web3 Authentication - จัดการ wallet authentication
 * 
 * ไฟล์นี้จัดการ Web3 authentication ผ่าน wallet signatures:
 * - รองรับ MetaMask และ Rabby wallet
 * - ใช้ message signing แทน private key
 * - จัดการ wallet events (account change, disconnect)
 * - Auto-refresh tokens เมื่อหมดอายุ
 * - Secure authentication flow
 * 
 * Flow: Connect Wallet → Sign Message → Get JWT Tokens → API Access
 */

import { createWalletClient, custom, getAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { apiClient, setTokens, clearTokens, getTokens } from './api-client';

/**
 * Authentication State Interface
 */
export interface AuthState {
  isAuthenticated: boolean;  // ผู้ใช้ login แล้วหรือไม่
  user: any | null;          // ข้อมูลผู้ใช้
  isLoading: boolean;        // กำลังโหลดข้อมูล auth
}

/**
 * เชื่อมต่อ Web3 wallet (รองรับ MetaMask และ Rabby)
 * 
 * @returns Wallet address ที่เชื่อมต่อ
 * @throws Error ถ้าไม่สามารถเชื่อมต่อได้
 */
export async function connectWallet(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available');
  }

  // ลอง Rabby wallet ก่อน (ถ้ามี)
  if (window.rabby) {
    try {
      const accounts = await window.rabby.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
    } catch (error) {
      console.warn('Failed to connect with Rabby, trying MetaMask:', error);
    }
  }

  // Fallback ไป MetaMask/Ethereum provider
  if (!window.ethereum) {
    throw new Error('No wallet found. Please install MetaMask or Rabby wallet.');
  }

  try {
    // ขอสิทธิ์เข้าถึง accounts
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

/**
 * ลงนาม message สำหรับ authentication
 * ใช้ wallet signature แทนการส่ง private key
 * 
 * @param address - Wallet address ที่ต้องการลงนาม
 * @param message - ข้อความที่ต้องการลงนาม
 * @returns Signature string
 */
export async function signMessage(address: string, message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const walletClient = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum)
    });
    
    // Get accounts to verify address
    const [account] = await walletClient.getAddresses();
    if (!account || getAddress(account) !== getAddress(address)) {
      throw new Error('Address mismatch');
    }

    const signature = await walletClient.signMessage({
      account,
      message
    });
    
    return signature;
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw error;
  }
}

/**
 * สร้าง authentication message สำหรับลงนาม
 * Message จะมี wallet address, timestamp, และ nonce เพื่อความปลอดภัย
 * 
 * @param address - Wallet address
 * @param nonce - Random nonce (optional)
 * @returns Authentication message
 */
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

/**
 * Authentication flow ที่สมบูรณ์
 * ทำทุกขั้นตอนตั้งแต่ connect wallet จนได้ JWT tokens
 * 
 * @returns Object ที่มี tokens และ user data
 */
export async function authenticateWallet(): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
}> {
  try {
    // 1. เชื่อมต่อ wallet
    const address = await connectWallet();
    
    // 2. สร้าง message สำหรับลงนาม
    const message = generateAuthMessage(address);
    
    // 3. ลงนาม message
    const signature = await signMessage(address, message);
    
    // 4. ส่งไป backend เพื่อ authenticate
    const response = await apiClient.login(address, signature, message);
    
    // 5. เก็บ tokens
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

/**
 * ตั้งค่า event listeners สำหรับ wallet events
 * จัดการเมื่อผู้ใช้เปลี่ยน account, chain, หรือ disconnect wallet
 */
export function setupWalletListeners() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return;
  }

  // เมื่อผู้ใช้เปลี่ยน account
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      // ผู้ใช้ disconnect wallet
      logout();
      window.location.href = '/sign-in';
    } else {
      // ผู้ใช้เปลี่ยน account - อาจต้อง re-authenticate
      const currentUser = getCurrentUser();
      if (currentUser) {
        // ตรวจสอบว่า account ใหม่ตรงกับ user ที่ login อยู่หรือไม่
        // ถ้าไม่ตรงให้ logout และไปหน้า sign-in
        window.location.reload();
      }
    }
  });

  // เมื่อผู้ใช้เปลี่ยน blockchain network
  window.ethereum.on('chainChanged', (chainId: string) => {
    // Reload หน้าเมื่อเปลี่ยน chain
    window.location.reload();
  });

  // เมื่อ wallet disconnect
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

// Types for window.ethereum and window.rabby
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
    rabby?: {
      isRabby: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}