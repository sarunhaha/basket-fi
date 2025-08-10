/**
 * @fileoverview Root Layout - Layout หลักของ Basket.fi Mobile App
 * 
 * ไฟล์นี้เป็น root layout ของ Expo Router ที่:
 * - จัดการ font loading และ splash screen
 * - ครอบ providers ทั้งหมด (Analytics, Query, Auth, Wallet, Notification)
 * - กำหนด navigation structure
 * - ตั้งค่า status bar และ toast notifications
 * 
 * ใช้ Expo Router สำหรับ file-based routing
 */

import { useEffect } from 'react';
import { useFonts } from 'expo-font';                    // Font loading
import { SplashScreen, Stack } from 'expo-router';      // Expo Router components
import { StatusBar } from 'expo-status-bar';            // Status bar configuration
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Gesture handling
import Toast from 'react-native-toast-message';        // Toast notifications

// Providers
import { QueryProvider } from '../lib/query-provider';           // TanStack Query
import { AuthProvider } from '../lib/auth-provider';             // Authentication
import { WalletProvider } from '../lib/wallet-provider';         // Web3 wallet
import { NotificationProvider } from '../lib/notification-provider'; // Push notifications
import { AnalyticsProvider } from '../lib/analytics-provider';   // Analytics tracking
import { toastConfig } from '../lib/toast-config';               // Toast configuration

// ป้องกัน splash screen หายไปก่อนที่ assets จะโหลดเสร็จ
SplashScreen.preventAutoHideAsync();

/**
 * Root Layout Component
 * ครอบ providers ทั้งหมดและจัดการ navigation structure
 */
export default function RootLayout() {
  // โหลด fonts ที่ใช้ในแอป
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router ใช้ Error Boundaries เพื่อจับ errors ใน navigation tree
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // ซ่อน splash screen เมื่อ fonts โหลดเสร็จ
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // แสดง loading screen จนกว่า fonts จะโหลดเสร็จ
  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Provider Hierarchy - เรียงตามลำดับความสำคัญ */}
      <AnalyticsProvider>
        <QueryProvider>
          <AuthProvider>
            <WalletProvider>
              <NotificationProvider>
                {/* Navigation Stack */}
                <Stack
                  screenOptions={{
                    headerShown: false,  // ซ่อน header เป็นค่าเริ่มต้น
                  }}
                >
                  {/* Authentication screens */}
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  
                  {/* Main app tabs */}
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  
                  {/* Basket detail screen */}
                  <Stack.Screen 
                    name="basket/[id]" 
                    options={{ 
                      headerShown: true,
                      title: 'Basket Details',
                      presentation: 'card'      // แสดงเป็น card transition
                    }} 
                  />
                  
                  {/* Rebalance modal */}
                  <Stack.Screen 
                    name="rebalance/[id]" 
                    options={{ 
                      headerShown: true,
                      title: 'Quick Rebalance',
                      presentation: 'modal'     // แสดงเป็น modal
                    }} 
                  />
                  
                  {/* Create basket modal */}
                  <Stack.Screen 
                    name="add-basket" 
                    options={{ 
                      headerShown: true,
                      title: 'Create Basket',
                      presentation: 'modal'
                    }} 
                  />
                </Stack>
                
                {/* Status bar configuration */}
                <StatusBar style="auto" />
                
                {/* Toast notifications */}
                <Toast config={toastConfig} />
              </NotificationProvider>
            </WalletProvider>
          </AuthProvider>
        </QueryProvider>
      </AnalyticsProvider>
    </GestureHandlerRootView>
  );
}