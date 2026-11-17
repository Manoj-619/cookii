import React from 'react';
import { Redirect } from 'expo-router';
import { useCookAuthStore } from '../src/store';

export default function Index() {
  const isLoggedIn = useCookAuthStore((s) => s.isLoggedIn);
  return <Redirect href={isLoggedIn ? '/(tabs)/dashboard' : '/(auth)/login'} />;
}
