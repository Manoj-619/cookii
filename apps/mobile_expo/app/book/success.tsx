import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, styles } from '../../src/components/ui';
import { useBookingStore } from '../../src/store';
import { colors, shadows } from '../../src/theme';

export default function Success() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const b = useBookingStore((s) => s.bookings.find((item) => item.id === id));

  return (
    <Screen>
      <View style={s.container}>
        {/* Animated Celebration Icon */}
        <View style={s.successCircle}>
          <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
        </View>

        <Text style={s.successTitle}>Booking Confirmed!</Text>
        <Text style={s.bookingId}>Booking #{id}</Text>

        {/* Confirmation Details Card */}
        <View style={s.detailsCard}>
          <View style={styles.row}>
            <Text style={s.detailLabel}>Cook Assigned</Text>
            <Text style={s.detailValue}>{b?.cookName || 'Verified Home Cook'}</Text>
          </View>
          <View style={s.divider} />
          <View style={styles.row}>
            <Text style={s.detailLabel}>Date & Time</Text>
            <Text style={s.detailValue}>
              {b?.date} · {b?.startTime}
            </Text>
          </View>
          <View style={s.divider} />
          <View style={styles.row}>
            <Text style={s.detailLabel}>Duration</Text>
            <Text style={s.detailValue}>{b?.durationMinutes || 60} mins</Text>
          </View>
        </View>

        {/* Safety OTP Reminder */}
        <View style={s.otpNotice}>
          <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
          <Text style={s.otpText}>
            For your kitchen's security, cooking will start only after sharing your OTP with the cook upon arrival.
          </Text>
        </View>

        {/* CTAs */}
        <View style={s.actions}>
          <Button
            title="Track Booking & View OTP"
            onPress={() => router.replace(`/bookings/${id}`)}
          />
          <View style={{ marginTop: 10 }}>
            <Button
              title="Back to Home"
              secondary
              onPress={() => router.replace('/(tabs)/home')}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...shadows.glow,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  bookingId: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 24,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.soft,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(21, 58, 39, 0.06)',
    marginVertical: 12,
  },
  otpNotice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF9F1',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.2)',
    marginBottom: 28,
  },
  otpText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 17,
    flex: 1,
  },
  actions: {
    width: '100%',
  },
});
