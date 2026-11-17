import React from 'react';
import { Text, TouchableOpacity, Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, styles } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, shadows } from '../../src/theme';

export default function Manage() {
  const logout = useAuthStore((s) => s.logout);

  const policyItems = [
    {
      title: 'Terms of Service',
      body: 'Zapeat provides transparent on-demand and scheduled home cooking services across Bengaluru.',
    },
    {
      title: 'Privacy Policy',
      body: 'Your personal information and addresses are encrypted and secured in accordance with Indian IT laws.',
    },
    {
      title: 'Refund & Cancellation Policy',
      body: 'Free cancellation up to 2 hours prior to scheduled session time. A nominal fee of ₹50 applies thereafter.',
    },
  ];

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data?',
      'This will remove your cached Zapeat app session and preferences from this device.',
      [
        { text: 'Keep Data', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <Header title="Manage Account" />

      <Text style={[styles.muted, { marginBottom: 14 }]}>
        Security, legal disclosures, and device storage preferences.
      </Text>

      {policyItems.map((item) => (
        <TouchableOpacity
          accessibilityRole="button"
          key={item.title}
          onPress={() => Alert.alert(item.title, item.body)}
          activeOpacity={0.8}
          style={[styles.card, styles.row, { paddingVertical: 16 }]}
        >
          <Text style={[styles.body, { fontWeight: '700' }]}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: 12 }}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Clear local device data"
          onPress={handleClearData}
          activeOpacity={0.8}
          style={[styles.card, styles.row, { paddingVertical: 16, borderColor: 'rgba(239, 68, 68, 0.2)' }]}
        >
          <Text style={[styles.body, { color: colors.danger, fontWeight: '700' }]}>
            Clear Local Cache & Data
          </Text>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
          activeOpacity={0.8}
          style={[styles.card, styles.row, { paddingVertical: 16, borderColor: 'rgba(239, 68, 68, 0.2)' }]}
        >
          <Text style={[styles.body, { color: colors.danger, fontWeight: '700' }]}>
            Log Out of Account
          </Text>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
