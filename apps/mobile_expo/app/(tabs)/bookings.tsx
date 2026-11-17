import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  Flame,
  CheckCheck,
  XCircle,
  Plus,
  ChevronRight,
  Calendar,
  MapPin,
  CheckCircle2,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react-native';

import { colors, shadows, fonts } from '../../src/theme';
import { useBookingStore } from '../../src/store';
import { formatINR } from '../../src/lib/pricing';
import { Booking } from '../../src/types';
import { canCancel } from '../../src/lib/bookingRules';

type FilterTab = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

const FILTER_TABS: { key: FilterTab; label: string; icon: any }[] = [
  { key: 'upcoming', label: 'Upcoming', icon: Clock },
  { key: 'in_progress', label: 'In Progress', icon: Flame },
  { key: 'completed', label: 'Completed', icon: CheckCheck },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🍳 Breakfast',
  lunch: '🍛 Lunch',
  dinner: '🍲 Dinner',
  snacks: '🥪 Snacks',
  meal_prep: '🥗 Meal Prep',
  party: '🎉 Party',
  special_diet: '🥑 Diet',
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bookings = useBookingStore((s) => s.bookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  // Animation values for list entrance
  const [listFadeAnim] = useState(() => new Animated.Value(0));
  const [listSlideAnim] = useState(() => new Animated.Value(14));

  const animateEntrance = useCallback(() => {
    listFadeAnim.setValue(0);
    listSlideAnim.setValue(14);
    Animated.parallel([
      Animated.timing(listFadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(listSlideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [listFadeAnim, listSlideAnim]);

  // Counts for each tab
  const counts = useMemo(() => {
    const map: Record<FilterTab | 'total', number> = {
      upcoming: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total: bookings.length,
    };
    bookings.forEach((b) => {
      if (b.status in map) {
        map[b.status as FilterTab]++;
      }
    });
    return map;
  }, [bookings]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => b.status === selectedFilter);
  }, [bookings, selectedFilter]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    animateEntrance();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [animateEntrance]);

  const handleCancelBooking = (booking: Booking) => {
    const check = canCancel(booking);
    if (!check.allowed) {
      Alert.alert(
        'Cancellation Not Available',
        'This booking cannot be cancelled once cooking has commenced or past the slot window.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel booking #${booking.id} with ${booking.cookName}?\n\n${
        check.fee === 0
          ? 'Full refund will be credited to your Zapeat wallet instantly.'
          : `A cancellation fee of ${formatINR(check.fee)} applies.`
      }`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: () => {
            cancelBooking(booking.id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const androidStatusBar = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, androidStatusBar) : insets.top;
  const topPadding = topInset + 14;

  return (
    <View style={screenStyles.container}>
      {/* ─── Top Safe Area Edge Shield (Solid White) ─────────────────────────── */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topInset,
          backgroundColor: '#FFFFFF',
          zIndex: 9999,
          borderBottomWidth: Platform.OS === 'android' ? 0.5 : 0,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        }}
      />

      {/* Top Header */}
      <View style={[screenStyles.header, { paddingTop: topPadding }]}>
        <View style={screenStyles.titleRow}>
          <View style={screenStyles.titleGroup}>
            <Text style={screenStyles.title}>My Bookings</Text>
            <View style={screenStyles.badgeContainer}>
              <Text style={screenStyles.badgeText}>{counts.total}</Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="New Booking"
            onPress={() => router.push('/book/schedule')}
            style={screenStyles.addBookingBtn}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={screenStyles.addBookingText}>Book Cook</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={screenStyles.filterScrollContent}
          style={screenStyles.filterScrollView}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            const count = counts[tab.key];
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="button"
                accessibilityLabel={`${tab.label} filter, ${count} bookings`}
                onPress={() => setSelectedFilter(tab.key)}
                activeOpacity={0.75}
                style={[
                  screenStyles.filterChip,
                  isSelected && screenStyles.filterChipActive,
                ]}
              >
                <Icon
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  strokeWidth={2.2}
                  style={screenStyles.filterIcon}
                />
                <Text
                  style={[
                    screenStyles.filterChipText,
                    isSelected && screenStyles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    screenStyles.filterCountBadge,
                    isSelected && screenStyles.filterCountBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      screenStyles.filterCountText,
                      isSelected && screenStyles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        contentContainerStyle={[
          screenStyles.listContent,
          { paddingBottom: Math.max(insets.bottom + 90, 115) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <Animated.View
          style={{
            opacity: listFadeAnim,
            transform: [{ translateY: listSlideAnim }],
          }}
        >
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingCardItem
                key={booking.id}
                booking={booking}
                onPress={() => router.push(`/bookings/${booking.id}`)}
                onCancel={() => handleCancelBooking(booking)}
              />
            ))
          ) : (
            <EmptyStateView
              filter={selectedFilter}
              onBookCook={() => router.push('/book/schedule')}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-Component: Individual Booking Card ───────────────────────────────────

interface BookingCardItemProps {
  booking: Booking;
  onPress: () => void;
  onCancel: () => void;
}

function BookingCardItem({ booking, onPress, onCancel }: BookingCardItemProps) {
  const initials = useMemo(() => {
    return booking.cookName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
  }, [booking.cookName]);

  const statusConfig = useMemo(() => {
    switch (booking.status) {
      case 'upcoming':
        return {
          label: 'Upcoming',
          bg: '#ECFDF5',
          text: colors.accent,
          icon: Calendar,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: '#FEF3C7',
          text: '#D97706',
          icon: Flame,
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: '#F0FDF4',
          text: '#047857',
          icon: CheckCircle2,
        };
      case 'cancelled':
      default:
        return {
          label: 'Cancelled',
          bg: '#FEF2F2',
          text: colors.danger,
          icon: XCircle,
        };
    }
  }, [booking.status]);

  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Booking with ${booking.cookName} on ${booking.date}`}
      onPress={onPress}
      activeOpacity={0.88}
      style={cardStyles.card}
    >
      {/* Top Header: Cook info + Status badge */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.cookInfoRow}>
          <LinearGradient
            colors={['#D1FAE5', '#A7F3D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={cardStyles.avatarCircle}
          >
            <Text style={cardStyles.avatarText}>{initials || 'CK'}</Text>
          </LinearGradient>
          <View style={cardStyles.nameContainer}>
            <View style={cardStyles.nameBadgeRow}>
              <Text style={cardStyles.cookName} numberOfLines={1}>
                {booking.cookName}
              </Text>
              <ShieldCheck size={13} color={colors.accent} strokeWidth={2.4} />
            </View>
            <Text style={cardStyles.modeText}>
              {booking.mode === 'instant' ? '⚡ Instant 45m Cook' : '📅 Scheduled Chef'}
            </Text>
          </View>
        </View>

        <View style={[cardStyles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <StatusIcon size={12} color={statusConfig.text} strokeWidth={2.4} style={{ marginRight: 4 }} />
          <Text style={[cardStyles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Session Meta */}
      <View style={cardStyles.sessionMetaBox}>
        <View style={cardStyles.metaItem}>
          <Calendar size={13} color={colors.accent} strokeWidth={2.2} />
          <Text style={cardStyles.metaText}>{booking.date}</Text>
        </View>
        <View style={cardStyles.metaDivider} />
        <View style={cardStyles.metaItem}>
          <Clock size={13} color={colors.accent} strokeWidth={2.2} />
          <Text style={cardStyles.metaText}>{booking.startTime}</Text>
        </View>
        <View style={cardStyles.metaDivider} />
        <View style={cardStyles.metaItem}>
          <Text style={cardStyles.metaText}>{booking.durationMinutes} mins</Text>
        </View>
      </View>

      {/* Meals Prepared */}
      {booking.mealTypes && booking.mealTypes.length > 0 && (
        <View style={cardStyles.mealRow}>
          {booking.mealTypes.map((m) => (
            <View key={m} style={cardStyles.mealChip}>
              <Text style={cardStyles.mealChipText}>{MEAL_EMOJIS[m] || m}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Service Address */}
      {booking.address && (
        <View style={cardStyles.addressRow}>
          <MapPin size={13} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={cardStyles.addressText} numberOfLines={1}>
            <Text style={{ fontFamily: fonts.bold }}>{booking.address.label}: </Text>
            {booking.address.line}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={cardStyles.footerRow}>
        <View>
          <Text style={cardStyles.priceLabel}>TOTAL PAID</Text>
          <View style={cardStyles.priceRow}>
            <Text style={cardStyles.priceValue}>{formatINR(booking.amountPaid)}</Text>
            {booking.savings > 0 && (
              <View style={cardStyles.savingsPill}>
                <Text style={cardStyles.savingsText}>Saved {formatINR(booking.savings)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={cardStyles.actionsContainer}>
          {booking.status === 'upcoming' && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cancel this booking"
              onPress={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              style={cardStyles.cancelBtn}
              activeOpacity={0.75}
            >
              <Text style={cardStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View details"
            onPress={onPress}
            style={cardStyles.detailsBtn}
            activeOpacity={0.8}
          >
            <Text style={cardStyles.detailsBtnText}>Details</Text>
            <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Sub-Component: Empty State ───────────────────────────────────────────────

function EmptyStateView({
  filter,
  onBookCook,
}: {
  filter: FilterTab;
  onBookCook: () => void;
}) {
  const meta = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return {
          emoji: '🍳',
          title: 'No Upcoming Sessions',
          desc: 'Schedule a verified home cook or book instant 45-min arrival for delicious home-cooked meals.',
        };
      case 'in_progress':
        return {
          emoji: '👨‍🍳',
          title: 'No Session in Progress',
          desc: 'When your cook is preparing your meal, you can track their status here live.',
        };
      case 'completed':
        return {
          emoji: '🍲',
          title: 'No Completed Bookings',
          desc: 'All your past home culinary experiences will be archived here.',
        };
      case 'cancelled':
        return {
          emoji: '🍃',
          title: 'No Cancelled Bookings',
          desc: 'You have no cancelled bookings. All clean and tidy!',
        };
    }
  }, [filter]);

  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.emojiContainer}>
        <Text style={emptyStyles.emoji}>{meta.emoji}</Text>
      </View>
      <Text style={emptyStyles.title}>{meta.title}</Text>
      <Text style={emptyStyles.desc}>{meta.desc}</Text>

      {filter !== 'cancelled' && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Book a Cook"
          onPress={onBookCook}
          style={emptyStyles.ctaButton}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.accent, '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={emptyStyles.gradientBtn}
          >
            <UtensilsCrossed size={17} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={emptyStyles.ctaBtnText}>Book a Cook</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Stylesheets ──────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  header: {
    backgroundColor: colors.mint,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(5, 150, 105, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 25,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.accent,
  },
  addBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    ...shadows.soft,
  },
  addBookingText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 12.5,
  },
  filterScrollView: {
    marginBottom: 12,
  },
  filterScrollContent: {
    gap: 8,
    paddingRight: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  filterCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#EDF5F0',
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCountText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 22,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cookInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.soft,
  },
  avatarText: {
    fontFamily: fonts.brand,
    fontSize: 15,
    fontWeight: '800',
    color: colors.accent,
  },
  nameContainer: {
    marginLeft: 11,
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cookName: {
    fontFamily: fonts.futura,
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modeText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  sessionMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 252, 249, 0.9)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 11,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  mealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  mealChip: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  mealChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    color: colors.accent,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  addressText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 58, 39, 0.06)',
  },
  priceLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 1,
  },
  priceValue: {
    fontFamily: fonts.brand,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  savingsPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  savingsText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.accent,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: colors.danger,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 11,
    ...shadows.soft,
  },
  detailsBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emojiContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...shadows.soft,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    maxWidth: 280,
  },
  ctaButton: {
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.soft,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  ctaBtnText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 14.5,
  },
});
