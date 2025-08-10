import React, { createContext, useContext, useEffect, useState } from 'react';
import { WalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';

import { useAnalytics } from '../hooks/useAnalytics';

// WalletConnect configuration
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id';

const providerMetadata = {
  name: 'Basket.fi',
  description: 'DeFi Portfolio Management',
  url: 'https://basket.fi',
  icons: ['https://basket.fi/logo.png'],
  redirect: {
    native: 'basketfi://',
    universal: 'https://basket.fi',
  },
};

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  isConnecting: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { track } = useAnalytics();

  useEffect(() => {
    // Initialize WalletConnect
    initializeWalletConnect();
  }, []);

  const initializeWalletConnect = async () => {
    try {
      // Check if there's a previous session
      // This would be handled by WalletConnect's session management
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      track('wallet_connect_initiated');

      // Open WalletConnect modal
      const result = await WalletConnectModal.open({
        projectId,
        providerMetadata,
      });

      if (result?.accounts?.[0]) {
        const walletAddress = result.accounts[0];
        setAddress(walletAddress);
        setIsConnected(true);
        
        // Create provider instance
        const web3Provider = new ethers.providers.Web3Provider(result.provider);
        setProvider(web3Provider);

        track('wallet_connected', { address: walletAddress });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError('Failed to connect wallet');
      track('wallet_connect_failed', { error: error.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      track('wallet_disconnect_initiated');
      
      await WalletConnectModal.disconnect();
      
      setIsConnected(false);
      setAddress(null);
      setProvider(null);
      setError(null);

      track('wallet_disconnected');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      setError('Failed to disconnect wallet');
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      track('wallet_sign_message_initiated');
      
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      
      track('wallet_message_signed');
      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      track('wallet_sign_message_failed', { error: error.message });
      throw error;
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    provider,
    connect,
    disconnect,
    signMessage,
    isConnecting,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={providerMetadata}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}