import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.mint },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="book/address" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
