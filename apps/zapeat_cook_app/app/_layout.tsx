import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { useCookAuthStore } from '../src/store';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useCookAuthStore((s) => s.isLoggedIn);
  const hydrate = useCookAuthStore((s) => s.hydrate);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    hydrate();
    setIsReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isLoggedIn, segments, isReady, router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.mint },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
