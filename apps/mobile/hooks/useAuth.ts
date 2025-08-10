/**
 * @fileoverview useAuth Hook - จัดการ authentication สำหรับ Mobile App
 * 
 * Hook นี้จัดการ:
 * - Web3 wallet authentication
 * - Biometric authentication (Face ID, Touch ID, Fingerprint)
 * - Token management และ auto-refresh
 * - Login/logout flows
 * - Navigation after auth state changes
 * 
 * รองรับ mobile-specific features เช่น biometric authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';  // Biometric auth
import { router } from 'expo-router';                              // Navigation

import { apiClient, TokenManager } from '../lib/api-client';       // API client
import { useWallet } from '../lib/wallet-provider';               // Wallet connection
import { useAnalytics } from './useAnalytics';                    // Analytics tracking
import type { User } from '../types/api';                         // Type definitions

/**
 * useAuth Hook - จัดการ authentication state และ actions
 * 
 * @returns Object ที่มี user data, loading states, และ auth actions
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const { address, signMessage, isConnected } = useWallet();  // Wallet connection
  const { track } = useAnalytics();                           // Analytics tracking

  // Query สำหรับดึงข้อมูล current user
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = await TokenManager.getAccessToken();
      if (!token) return null;
      
      try {
        return await apiClient.getCurrentUser();
      } catch (error) {
        // Clear tokens if user fetch fails
        await TokenManager.clearTokens();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Biometric Authentication - ใช้ Face ID, Touch ID, หรือ Fingerprint
   * 
   * @returns Promise<boolean> - true ถ้า authentication สำเร็จ
   */
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      // ตรวจสอบว่าอุปกรณ์มี biometric hardware หรือไม่
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        throw new Error('Biometric hardware not available');
      }

      // ตรวจสอบว่าผู้ใช้ได้ตั้งค่า biometric credentials แล้วหรือไม่
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        throw new Error('No biometric credentials enrolled');
      }

      // ทำ biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your portfolio',  // ข้อความที่แสดง
        cancelLabel: 'Cancel',                                   // ปุ่ม cancel
        disableDeviceFallback: false,                           // อนุญาต fallback เป็น passcode
      });

      track('biometric_auth_attempted', { success: result.success });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      track('biometric_auth_failed', { error: error.message });
      return false;
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      // Generate authentication message
      const message = generateAuthMessage(address);
      
      // Sign message with wallet
      const signature = await signMessage(message);
      
      // Authenticate with backend
      return await apiClient.login(address, signature, message);
    },
    onSuccess: (data) => {
      // Update the user query cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      track('login_success', { address });
      
      // Navigate to main app
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      track('login_failed', { error: error.message });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.logout();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      track('logout_success');
      
      // Navigate to auth
      router.replace('/(auth)/welcome');
    },
  });

  // Biometric login mutation
  const biometricLoginMutation = useMutation({
    mutationFn: async () => {
      const isAuthenticated = await authenticateWithBiometrics();
      if (!isAuthenticated) {
        throw new Error('Biometric authentication failed');
      }
      
      // Check if we have stored credentials
      const token = await TokenManager.getAccessToken();
      if (!token) {
        throw new Error('No stored credentials');
      }
      
      // Verify token is still valid
      return await apiClient.getCurrentUser();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user);
      track('biometric_login_success');
      router.replace('/(tabs)');
    },
    onError: (error) => {
      console.error('Biometric login failed:', error);
      track('biometric_login_failed', { error: error.message });
      // Fallback to regular login
      router.replace('/(auth)/wallet-connect');
    },
  });

  const login = () => {
    loginMutation.mutate();
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const loginWithBiometrics = () => {
    biometricLoginMutation.mutate();
  };

  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      isAvailable: hasHardware && isEnrolled,
    };
  };

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: error || loginMutation.error || logoutMutation.error,
    
    // Actions
    login,
    logout,
    loginWithBiometrics,
    refetch,
    checkBiometricAvailability,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isBiometricLogin: biometricLoginMutation.isPending,
    loginError: loginMutation.error,
  };
}

// Helper function to generate authentication message
function generateAuthMessage(address: string): string {
  const timestamp = new Date().toISOString();
  const nonce = Math.random().toString(36).substring(2);
  
  return `Welcome to Basket.fi Mobile!

Please sign this message to authenticate your wallet.

Wallet: ${address}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}