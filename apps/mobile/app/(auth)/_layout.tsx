import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="biometric-setup" />
      <Stack.Screen name="wallet-connect" />
    </Stack>
  );
}