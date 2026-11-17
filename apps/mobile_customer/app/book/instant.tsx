import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Button, styles } from '../../src/components/ui';
import { useBookingStore } from '../../src/store';
import { isInstantAvailable, generateTimeSlots } from '../../src/lib/scheduling';
import { calculatePrice, formatINR } from '../../src/lib/pricing';
import { colors, shadows } from '../../src/theme';

export default function Instant() {
  const state = isInstantAvailable();
  const d = useBookingStore((s) => s.draft);
  const set = useBookingStore((s) => s.setDraft);
  const date = format(new Date(), 'yyyy-MM-dd');

  const price = calculatePrice({
    minutes: d.durationMinutes || 60,
    date: new Date(),
    isPassActive: true,
  });

  return (
    <Screen>
      <Header title="Instant Cook" />

      {!state.available ? (
        <View style={s.unavailableWrap}>
          <View style={s.moonCircle}>
            <Text style={{ fontSize: 54 }}>🌙</Text>
          </View>
          <Text style={s.unavailableTitle}>Instant slots open at {state.opensAt}</Text>
          <Text style={s.unavailableDesc}>
            Instant dispatch runs daily from 5:00 AM to 9:00 PM in Bengaluru. You can schedule a verified cook for tomorrow right now.
          </Text>
          <View style={{ width: '100%', marginTop: 24 }}>
            <Button
              title="Schedule for Tomorrow"
              onPress={() => router.push('/book/schedule')}
            />
          </View>
        </View>
      ) : (
        <>
          {/* Snabbit Arrival Banner */}
          <View style={s.arrivalCard}>
            <View style={s.arrivalIcon}>
              <Ionicons name="flash" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.arrivalTitle}>Instant Dispatch Live</Text>
              <Text style={s.arrivalSub}>
                A verified cook within 3 km will be dispatched to your kitchen in ~45 mins.
              </Text>
            </View>
          </View>

          {/* Cooking Duration Snabbit Cut */}
          <View style={{ marginBottom: 20 }}>
            <Text style={s.sectionTitle}>Select Cooking Duration</Text>
            <View style={s.durationRow}>
              {[60, 90, 120, 150].map((m) => {
                const isSelected = d.durationMinutes === m;
                const p = calculatePrice({
                  minutes: m,
                  date: new Date(),
                  isPassActive: true,
                });
                return (
                  <TouchableOpacity
                    key={m}
                    accessibilityRole="button"
                    accessibilityLabel={`${m} mins`}
                    onPress={() => set({ durationMinutes: m })}
                    activeOpacity={0.8}
                    style={[s.durationTile, isSelected && s.durationTileSelected]}
                  >
                    <Text style={[s.durationText, isSelected && s.textActive]}>
                      {m < 120 ? `${m}m` : `${m / 60}h`}
                    </Text>
                    <Text style={[s.durationPrice, isSelected && s.textActive]}>
                      {formatINR(p.payable)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Summary & Dispatch CTA */}
          <View style={s.summaryCard}>
            <View style={styles.row}>
              <View>
                <Text style={s.summaryLabel}>Total with Zapeat Pass</Text>
                <Text style={s.summaryPrice}>{formatINR(price.total)}</Text>
              </View>
              <View style={s.passPill}>
                <Text style={s.passPillText}>10% PASS SAVINGS</Text>
              </View>
            </View>

            <View style={{ marginTop: 18 }}>
              <Button
                title={`Request Instant Cook · ${formatINR(price.total)}`}
                onPress={() => {
                  const slots = generateTimeSlots(date, d.durationMinutes, 'instant');
                  const time = slots[0] || 'Immediately';
                  set({ mode: 'instant', date, startTime: time });
                  router.push('/book/confirm');
                }}
              />
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  unavailableWrap: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  moonCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.2)',
  },
  unavailableTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  unavailableDesc: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 300,
  },
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
    marginBottom: 20,
    ...shadows.soft,
  },
  arrivalIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  arrivalSub: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationTile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.soft,
  },
  durationTileSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  durationPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 2,
  },
  textActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 10,
    ...shadows.card,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  passPill: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  passPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
});
