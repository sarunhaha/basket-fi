import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { QueryProvider } from '../lib/query-provider';
import { AuthProvider } from '../lib/auth-provider';
import { WalletProvider } from '../lib/wallet-provider';
import { NotificationProvider } from '../lib/notification-provider';
import { AnalyticsProvider } from '../lib/analytics-provider';
import { toastConfig } from '../lib/toast-config';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AnalyticsProvider>
        <QueryProvider>
          <AuthProvider>
            <WalletProvider>
              <NotificationProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen 
                    name="basket/[id]" 
                    options={{ 
                      headerShown: true,
                      title: 'Basket Details',
                      presentation: 'card'
                    }} 
                  />
                  <Stack.Screen 
                    name="rebalance/[id]" 
                    options={{ 
                      headerShown: true,
                      title: 'Quick Rebalance',
                      presentation: 'modal'
                    }} 
                  />
                  <Stack.Screen 
                    name="add-basket" 
                    options={{ 
                      headerShown: true,
                      title: 'Create Basket',
                      presentation: 'modal'
                    }} 
                  />
                </Stack>
                <StatusBar style="auto" />
                <Toast config={toastConfig} />
              </NotificationProvider>
            </WalletProvider>
          </AuthProvider>
        </QueryProvider>
      </AnalyticsProvider>
    </GestureHandlerRootView>
  );
}