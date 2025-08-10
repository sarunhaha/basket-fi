/**
 * @fileoverview Wallet Provider - จัดการ Web3 wallet connections
 * 
 * Component นี้ครอบ providers ทั้งหมดที่เกี่ยวข้องกับ Web3:
 * - WagmiProvider: จัดการ wallet connections และ blockchain interactions
 * - QueryClientProvider: จัดการ data fetching และ caching
 * - RainbowKitProvider: UI สำหรับ wallet connection
 * 
 * ใช้ RainbowKit + Wagmi stack สำหรับ Web3 integration
 */

'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';      // Wallet UI components
import { WagmiProvider } from 'wagmi';                            // Web3 React hooks
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Data fetching
import { wagmiConfig } from '@/lib/wallet-config';               // Wagmi configuration
import '@rainbow-me/rainbowkit/styles.css';                      // RainbowKit styles

// สร้าง QueryClient instance สำหรับ TanStack Query
const queryClient = new QueryClient();

/**
 * Wallet Provider Component
 * ครอบ providers ทั้งหมดที่เกี่ยวข้องกับ Web3
 * 
 * @param children - Child components ที่จะได้รับ Web3 context
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}