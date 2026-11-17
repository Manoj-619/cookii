import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { addDays, format } from 'date-fns';
import { Sparkles, User, CheckCircle2 } from 'lucide-react-native';

import { Screen, Header, Button, styles } from '../../src/components/ui';
import { useBookingStore, useUserStore } from '../../src/store';
import { cooks } from '../../src/data/cooks';
import { services } from '../../src/data/services';
import { calculatePrice, formatINR } from '../../src/lib/pricing';
import { generateTimeSlots } from '../../src/lib/scheduling';
import { colors, shadows, fonts } from '../../src/theme';

export default function Schedule() {
  const d = useBookingStore((s) => s.draft);
  const set = useBookingStore((s) => s.setDraft);
  const favorites = useUserStore((s) => s.favoriteCookIds);
  const price = calculatePrice({
    minutes: d.durationMinutes,
    date: d.date,
    isPassActive: true,
  });
  const slots = generateTimeSlots(d.date, d.durationMinutes, 'scheduled');

  const dates = Array.from({ length: 21 }, (_, i) =>
    format(addDays(new Date(), i + 1), 'yyyy-MM-dd')
  );

  const selectedCook = cooks.find((c) => c.id === d.cookId);

  return (
    <Screen>
      <Header title="Schedule a Cook" />

      {/* Snabbit Step 1: Date Picker Pills */}
      <View style={{ marginBottom: 20 }}>
        <Text style={s.sectionTitle}>1. Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {dates.map((dateStr) => {
            const dateObj = new Date(dateStr + 'T12:00:00');
            const isSelected = d.date === dateStr;
            const dayName = format(dateObj, 'EEE');
            const dayNum = format(dateObj, 'd');
            const monthName = format(dateObj, 'MMM');

            return (
              <TouchableOpacity
                key={dateStr}
                accessibilityRole="button"
                accessibilityLabel={`Select ${dayName} ${dayNum} ${monthName}`}
                onPress={() => set({ date: dateStr, startTime: '' })}
                activeOpacity={0.8}
                style={[s.dateTile, isSelected && s.dateTileSelected]}
              >
                <Text style={[s.dateDayName, isSelected && s.textActive]}>{dayName}</Text>
                <Text style={[s.dateDayNum, isSelected && s.textActive]}>{dayNum}</Text>
                <Text style={[s.dateMonth, isSelected && s.textActive]}>{monthName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Snabbit Step 2: Duration Selector */}
      <View style={{ marginBottom: 20 }}>
        <Text style={s.sectionTitle}>2. Cooking Duration</Text>
        <View style={s.durationRow}>
          {[60, 90, 120, 150].map((m) => {
            const isSelected = d.durationMinutes === m;
            const p = calculatePrice({
              minutes: m,
              date: d.date,
              isPassActive: true,
            });

            return (
              <TouchableOpacity
                key={m}
                accessibilityRole="button"
                accessibilityLabel={`${m} minutes duration`}
                onPress={() => set({ durationMinutes: m, startTime: '' })}
                activeOpacity={0.8}
                style={[s.durationTile, isSelected && s.durationTileSelected]}
              >
                <Text style={[s.durationText, isSelected && s.textActive]}>
                  {m < 120 ? `${m}m` : `${m / 60}h`}
                </Text>
                <Text style={[s.durationPrice, isSelected && s.textActive]}>
                  {formatINR(p.payable)}
                </Text>
                <Text style={[s.durationOrig, isSelected && { color: 'rgba(255, 255, 255, 0.7)' }]}>
                  {formatINR(p.original)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Snabbit Step 3: Time Slot Grid */}
      <View style={{ marginBottom: 20 }}>
        <Text style={s.sectionTitle}>3. Arrival Time Slot</Text>
        {slots.length === 0 ? (
          <Text style={styles.muted}>No slots available for this date.</Text>
        ) : (
          <View style={s.slotGrid}>
            {slots.map((t) => {
              const isSelected = d.startTime === t;
              return (
                <TouchableOpacity
                  key={t}
                  accessibilityRole="button"
                  accessibilityLabel={`Select slot ${t}`}
                  onPress={() => set({ startTime: t })}
                  activeOpacity={0.75}
                  style={[s.slotChip, isSelected && s.slotChipSelected]}
                >
                  <Text style={[s.slotChipText, isSelected && s.textActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Snabbit Step 4: Meal Type */}
      <View style={{ marginBottom: 22 }}>
        <Text style={s.sectionTitle}>4. What Should We Cook?</Text>
        <View style={s.mealGrid}>
          {services.map((svc) => {
            const isSelected = d.mealTypes.includes(svc.id);
            return (
              <TouchableOpacity
                key={svc.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${svc.label}`}
                onPress={() =>
                  set({
                    mealTypes: isSelected
                      ? d.mealTypes.filter((x) => x !== svc.id)
                      : [...d.mealTypes, svc.id],
                  })
                }
                activeOpacity={0.8}
                style={[s.mealChip, isSelected && s.mealChipSelected]}
              >
                <Text style={{ fontSize: 18 }}>{svc.emoji}</Text>
                <Text style={[s.mealChipText, isSelected && s.textActive]}>
                  {svc.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Snabbit Step 5: Cook Preference */}
      <View style={{ marginBottom: 24 }}>
        <Text style={s.sectionTitle}>5. Cook Preference</Text>
        <View style={{ gap: 10 }}>
          {selectedCook ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Assigned Cook: ${selectedCook.name}`}
              activeOpacity={0.9}
              style={[s.cookChoice, s.cookChoiceSelected]}
            >
              <View style={s.cookChoiceIcon}>
                <User size={16} color={colors.accent} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.cookChoiceTitle}>{selectedCook.name}</Text>
                  <View
                    style={{
                      backgroundColor: '#EEF9F1',
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bold, fontSize: 9, color: colors.accent }}>
                      REQUESTED
                    </Text>
                  </View>
                </View>
                <Text style={s.cookChoiceSub}>
                  ★ {selectedCook.rating.toFixed(1)} • {selectedCook.cuisines.join(', ')}
                </Text>
              </View>
              <CheckCircle2 size={18} color={colors.accent} strokeWidth={2.4} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Match best available cook"
            onPress={() => set({ cookId: null })}
            activeOpacity={0.8}
            style={[s.cookChoice, !d.cookId && s.cookChoiceSelected]}
          >
            <View style={s.cookChoiceIcon}>
              <Sparkles size={16} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cookChoiceTitle}>Match Best Available Cook</Text>
              <Text style={s.cookChoiceSub}>Top-rated chef dispatched to your area</Text>
            </View>
            {!d.cookId && (
              <CheckCircle2 size={18} color={colors.accent} strokeWidth={2.4} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Snabbit Summary Footer Card */}
      <View style={s.footerCard}>
        <View style={styles.row}>
          <View>
            <Text style={s.footerLabel}>Total with Zapeat Pass</Text>
            <Text style={s.footerPrice}>{formatINR(price.total)}</Text>
          </View>
          <View style={s.passPill}>
            <Text style={s.passPillText}>10% OFF APPLIED</Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <Button
            title={d.startTime ? `Confirm for ${d.startTime}` : 'Pick an arrival time'}
            disabled={!d.startTime}
            onPress={() => router.push('/book/confirm')}
          />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  sectionTitle: {
    fontFamily: fonts.futura,
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  dateTile: {
    width: 64,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    ...shadows.soft,
  },
  dateTileSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dateDayName: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dateDayNum: {
    fontFamily: fonts.brand,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  dateMonth: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  textActive: {
    color: '#FFFFFF',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationTile: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    ...shadows.soft,
  },
  durationTileSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  durationText: {
    fontFamily: fonts.brand,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  durationPrice: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.accent,
    marginTop: 2,
  },
  durationOrig: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: colors.border,
    minWidth: 76,
    alignItems: 'center',
    ...shadows.soft,
  },
  slotChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  slotChipText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: colors.border,
    ...shadows.soft,
  },
  mealChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  mealChipText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cookChoice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  cookChoiceSelected: {
    borderColor: colors.accent,
    backgroundColor: '#EEF9F1',
  },
  cookChoiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cookChoiceTitle: {
    fontFamily: fonts.futura,
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cookChoiceSub: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  footerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 32,
    ...shadows.soft,
  },
  footerLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerPrice: {
    fontFamily: fonts.brand,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  passPill: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  passPillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.accent,
  },
});
