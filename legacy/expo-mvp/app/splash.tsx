
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  useEffect(() => {
    let active = true;

    const navigate = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const phone = await AsyncStorage.getItem('cookii-phone');

        if (!active) return;

        router.replace(
          phone ? '/(tabs)/home' : '/(auth)/login'
        );
      } catch (error) {
        console.error('Splash navigation error:', error);

        if (active) {
          router.replace('/(auth)/login');
        }
      }
    };

    navigate();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌿 Cookii</Text>
      <Text style={styles.subtitle}>
        Fresh cooking, right at home.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F3A2E',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7F72',
    marginTop: 12,
  },
});
