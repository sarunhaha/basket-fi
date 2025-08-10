import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedChains, defaultChain } from './chains';

// RainbowKit Wallet Configuration
export const wagmiConfig = getDefaultConfig({
  appName: 'Basket.fi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: supportedChains,
  ssr: true, // If your dApp uses server side rendering (SSR)
});

// Default chain for the application
export { defaultChain, supportedChains };