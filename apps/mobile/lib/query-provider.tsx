import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';

import { createMMKVPersister } from './mmkv-persister';

// Initialize MMKV storage
const storage = new MMKV({
  id: 'basket-fi-cache',
  encryptionKey: 'basket-fi-encryption-key', // In production, use a secure key
});

// Create persister
const persister = createMMKVPersister(storage);

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
            networkMode: 'offlineFirst', // Enable offline-first behavior
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
            networkMode: 'offlineFirst',
          },
        },
      })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        buster: '1.0.0', // Increment to invalidate cache on app updates
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries
            return query.state.status === 'success';
          },
        },
      }}
      onSuccess={() => {
        // Invalidate queries when coming back online
        NetInfo.addEventListener((state) => {
          if (state.isConnected) {
            queryClient.invalidateQueries();
          }
        });
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}