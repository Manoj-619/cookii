import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, CalendarDays, User } from 'lucide-react-native';
import { colors, fonts } from '../../src/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 58 + bottomInset,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: 'rgba(21, 58, 39, 0.08)',
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 25,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bold,
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <View style={[s.iconBox, focused && s.iconBoxActive]}>
              <Compass
                size={21}
                color={focused ? colors.accent : colors.textSecondary}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <View style={[s.iconBox, focused && s.iconBoxActive]}>
              <CalendarDays
                size={21}
                color={focused ? colors.accent : colors.textSecondary}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <View style={[s.iconBox, focused && s.iconBoxActive]}>
              <User
                size={21}
                color={focused ? colors.accent : colors.textSecondary}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconBox: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#EEF9F1',
  },
});
