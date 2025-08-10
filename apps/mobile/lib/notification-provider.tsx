import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { useAnalytics } from '../hooks/useAnalytics';
import { apiClient } from './api-client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermissions: () => Promise<boolean>;
  scheduleLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  isPermissionGranted: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  const { track } = useAnalytics();

  useEffect(() => {
    // Initialize notifications
    initializeNotifications();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      track('notification_received', {
        title: notification.request.content.title,
        categoryId: notification.request.content.categoryIdentifier,
      });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      track('notification_tapped', { data });
      
      // Handle notification tap navigation
      handleNotificationTap(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        // Send token to backend for push notifications
        // await apiClient.updatePushToken(token);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        setIsPermissionGranted(false);
        return null;
      }
      
      setIsPermissionGranted(true);
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        track('push_token_registered', { token });
      } catch (error) {
        console.error('Failed to get push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setIsPermissionGranted(granted);
      
      track('notification_permission_requested', { granted });
      
      if (granted && !expoPushToken) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
        }
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  };

  const scheduleLocalNotification = async (
    title: string, 
    body: string, 
    data?: any
  ): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
      
      track('local_notification_scheduled', { title });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    try {
      await Notifications.dismissAllNotificationsAsync();
      track('notifications_cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleNotificationTap = (data: any) => {
    // Handle deep linking based on notification data
    if (data?.basketId) {
      // Navigate to basket detail
      // router.push(`/basket/${data.basketId}`);
    } else if (data?.alertId) {
      // Navigate to alerts
      // router.push('/alerts');
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    requestPermissions,
    scheduleLocalNotification,
    clearAllNotifications,
    isPermissionGranted,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}