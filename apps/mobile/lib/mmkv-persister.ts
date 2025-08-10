import { MMKV } from 'react-native-mmkv';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Creates a persister for React Query using MMKV storage
 * MMKV is much faster than AsyncStorage for React Native
 */
export function createMMKVPersister(storage: MMKV): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        storage.set('react-query-cache', JSON.stringify(client));
      } catch (error) {
        console.error('Failed to persist query client:', error);
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const cached = storage.getString('react-query-cache');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Failed to restore query client:', error);
      }
      return undefined;
    },
    removeClient: async () => {
      try {
        storage.delete('react-query-cache');
      } catch (error) {
        console.error('Failed to remove query client:', error);
      }
    },
  };
}