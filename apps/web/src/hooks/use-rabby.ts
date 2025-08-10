'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    rabby?: {
      isRabby: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export function useRabby() {
  const [isRabbyInstalled, setIsRabbyInstalled] = useState(false);
  const [isRabbyConnected, setIsRabbyConnected] = useState(false);

  useEffect(() => {
    // Check if Rabby is installed
    if (typeof window !== 'undefined' && window.rabby) {
      setIsRabbyInstalled(true);
      
      // Check if already connected
      window.rabby.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          setIsRabbyConnected(accounts.length > 0);
        })
        .catch(() => {
          setIsRabbyConnected(false);
        });
    }
  }, []);

  const connectRabby = async () => {
    if (!window.rabby) {
      throw new Error('Rabby wallet is not installed');
    }

    try {
      const accounts = await window.rabby.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setIsRabbyConnected(true);
        return accounts[0];
      }
      
      throw new Error('No accounts found');
    } catch (error) {
      console.error('Failed to connect to Rabby:', error);
      throw error;
    }
  };

  return {
    isRabbyInstalled,
    isRabbyConnected,
    connectRabby,
  };
}