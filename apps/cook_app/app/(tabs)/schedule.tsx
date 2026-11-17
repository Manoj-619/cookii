import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../src/theme';
import { useCookStore } from '../../src/store';

const DAYS = [
  { day: 'Mon', date: '16', isToday: true },
  { day: 'Tue', date: '17', isToday: false },
  { day: 'Wed', date: '18', isToday: false },
  { day: 'Thu', date: '19', isToday: false },
  { day: 'Fri', date: '20', isToday: false },
  { day: 'Sat', date: '21', isToday: false },
  { day: 'Sun', date: '22', isToday: false },
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(0);

  const scheduleSlots = useCookStore((s) => s.scheduleSlots);
  const toggleSlotStatus = useCookStore((s) => s.toggleSlotStatus);

  const handleToggleSlot = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleSlotStatus(id);
  };

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: 100, // room for floating tab bar
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.pageTitle}>Cooking Schedule</Text>
          <Text style={s.pageSubtitle}>Manage your daily time slots and availability</Text>
        </View>

        {/* Day Selector Ribbon */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.dayRibbon}
        >
          {DAYS.map((d, index) => {
            const isSelected = selectedDay === index;
            return (
              <TouchableOpacity
                key={d.day}
                style={[s.dayPill, isSelected && s.dayPillSelected]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedDay(index);
                }}
                activeOpacity={0.8}
              >
                <Text style={[s.dayPillName, isSelected && s.dayPillTextSelected]}>
                  {d.day}
                </Text>
                <Text style={[s.dayPillDate, isSelected && s.dayPillTextSelected]}>
                  {d.date}
                </Text>
                {d.isToday && (
                  <View style={[s.todayDot, isSelected && s.todayDotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Schedule Summary Card */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>1</Text>
              <Text style={s.summaryLabel}>Booked</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>3</Text>
              <Text style={s.summaryLabel}>Available</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>0</Text>
              <Text style={s.summaryLabel}>Blocked</Text>
            </View>
          </View>
        </View>

        {/* Time Slots List */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Daily Time Slots</Text>

          {scheduleSlots.map((slot) => {
            const isBooked = slot.status === 'booked';
            const isBlocked = slot.status === 'blocked';

            return (
              <View key={slot.id} style={s.slotCard}>
                <View style={s.slotHeader}>
                  <View style={s.timeRow}>
                    <Ionicons name="time" size={16} color={colors.accent} />
                    <Text style={s.slotTimeText}>{slot.timeSlot}</Text>
                  </View>

                  {/* Status badge */}
                  <View
                    style={[
                      s.statusBadge,
                      isBooked && s.badgeBooked,
                      isBlocked && s.badgeBlocked,
                      !isBooked && !isBlocked && s.badgeAvailable,
                    ]}
                  >
                    <Text
                      style={[
                        s.statusBadgeText,
                        isBooked && s.textBooked,
                        isBlocked && s.textBlocked,
                        !isBooked && !isBlocked && s.textAvailable,
                      ]}
                    >
                      {isBooked ? 'BOOKED' : isBlocked ? 'BLOCKED' : 'AVAILABLE'}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={s.slotBody}>
                  <Text style={s.mealTitle}>{slot.mealType} Session</Text>
                  {isBooked ? (
                    <View style={s.bookedDetails}>
                      <View style={s.detailRow}>
                        <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                        <Text style={s.detailText}>Customer: {slot.customerName}</Text>
                      </View>
                      <View style={s.detailRow}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={s.detailText}>Location: {slot.area}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={s.slotDesc}>
                      {isBlocked
                        ? 'This slot is marked as busy. Customers cannot book you during this hour.'
                        : 'Open for automatic matching with customer requests in your preferred areas.'}
                    </Text>
                  )}
                </View>

                {/* Slot toggle action */}
                {!isBooked && (
                  <View style={s.slotActionRow}>
                    <TouchableOpacity
                      style={[s.toggleActionBtn, isBlocked ? s.btnMakeAvailable : s.btnBlock]}
                      activeOpacity={0.75}
                      onPress={() => handleToggleSlot(slot.id)}
                    >
                      <Ionicons
                        name={isBlocked ? 'checkmark-circle-outline' : 'close-circle-outline'}
                        size={16}
                        color={isBlocked ? colors.accent : colors.danger}
                      />
                      <Text
                        style={[
                          s.toggleActionBtnText,
                          isBlocked ? s.textMakeAvailable : s.textBlock,
                        ]}
                      >
                        {isBlocked ? 'Make Slot Available' : 'Block Slot (Mark Busy)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Tip Banner */}
        <View style={s.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={colors.accent} />
          <Text style={s.tipText}>
            Keep all slots available during peak lunch (12–2 PM) and dinner (7–9 PM) hours to maximize your daily income.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayRibbon: {
    gap: 8,
    paddingBottom: 16,
  },
  dayPill: {
    width: 54,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  dayPillSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayPillName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayPillDate: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  dayPillTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeBooked: {
    backgroundColor: '#EFF6FF',
  },
  badgeBlocked: {
    backgroundColor: '#F3F4F6',
  },
  badgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textBooked: {
    color: '#2563EB',
  },
  textBlocked: {
    color: '#6B7280',
  },
  textAvailable: {
    color: colors.accent,
  },
  slotBody: {
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bookedDetails: {
    gap: 4,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  slotDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  slotActionRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  toggleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnMakeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  btnBlock: {
    backgroundColor: '#FEF2F2',
  },
  toggleActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textMakeAvailable: {
    color: colors.accent,
  },
  textBlock: {
    color: colors.danger,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 18,
  },
});
