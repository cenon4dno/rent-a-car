import '../global.css';
import { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { loadAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAuth()
      .then(() => {})
      .finally(() => {
        setLoaded(true);
        SplashScreen.hideAsync();
      });
  }, []);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2563EB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', presentation: 'modal' }} />
        <Stack.Screen name="vehicle/[id]" options={{ title: 'Vehicle Details' }} />
        <Stack.Screen name="booking/review" options={{ title: 'Review Booking' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Booking Confirmed' }} />
      </Stack>
    </>
  );
}
