import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../src/theme';
import { useBookingStore } from '../../src/store';
import { formatINR } from '../../src/lib/pricing';
import { canCancel } from '../../src/lib/bookingRules';
import { cooks } from '../../src/data/cooks';

const TIMELINE_STEPS = [
  { id: 1, title: 'Booked', desc: 'Booking confirmed & slot reserved' },
  { id: 2, title: 'Cook Assigned', desc: 'Cook confirmed availability' },
  { id: 3, title: 'Cook En Route', desc: 'Travelling to your location' },
  { id: 4, title: 'Arrived', desc: 'Arrived at your doorstep' },
  { id: 5, title: 'In Progress', desc: 'Cooking your fresh meal' },
  { id: 6, title: 'Completed', desc: 'Meal served & kitchen cleaned' },
];

const MEAL_NAMES: Record<string, string> = {
  breakfast: '🍳 Breakfast',
  lunch: '🍛 Lunch',
  dinner: '🍲 Dinner',
  snacks: '🥪 Evening Snacks',
  meal_prep: '🥗 Meal Prep',
  party: '🎉 Party Cooking',
  special_diet: '🥑 Special Diet',
};

export default function BookingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === id));
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const setDraft = useBookingStore((s) => s.setDraft);

  // Associated cook if available
  const cook = useMemo(() => {
    if (!booking) return null;
    return cooks.find((c) => c.id === booking.cookId) || null;
  }, [booking]);

  const initials = useMemo(() => {
    if (!booking) return 'CK';
    return booking.cookName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
  }, [booking]);

  // Determine active step index in timeline (Hook called before any conditional return)
  const activeStepIndex = useMemo(() => {
    if (!booking) return 0;
    switch (booking.status) {
      case 'completed':
        return 6; // all completed
      case 'in_progress':
        return 5; // step 5 in progress
      case 'upcoming':
        return 2; // cook assigned, en route next
      case 'cancelled':
      default:
        return 0; // cancelled
    }
  }, [booking]);

  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 16) + 10;
  const bottomPadding = Math.max(insets.bottom + 28, 40);

  // If booking not found
  if (!booking) {
    return (
      <View style={[screenStyles.container, { paddingTop: topPadding }]}>
        <View style={screenStyles.headerRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={screenStyles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={screenStyles.headerTitle}>Booking Details</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={notFoundStyles.container}>
          <View style={notFoundStyles.iconBox}>
            <Ionicons name="search-outline" size={44} color={colors.textSecondary} />
          </View>
          <Text style={notFoundStyles.title}>Booking Not Found</Text>
          <Text style={notFoundStyles.desc}>
            We couldn&apos;t locate booking #{id}. It may have been removed or does not exist.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Return to Bookings"
            onPress={() => router.replace('/(tabs)/bookings')}
            style={notFoundStyles.ctaBtn}
            activeOpacity={0.8}
          >
            <Text style={notFoundStyles.ctaBtnText}>Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Zapeat Booking #${booking.id}`,
        message: `I've booked ${booking.cookName} on Zapeat for ${booking.date} at ${booking.startTime} (${booking.durationMinutes} min session). Booking ID: #${booking.id}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleCancel = () => {
    const rule = canCancel(booking);
    const feeMsg = rule.fee > 0
      ? `A cancellation fee of ${formatINR(rule.fee)} applies as this session starts within 2 hours.`
      : 'Cancellation is completely free.';

    Alert.alert(
      'Cancel Booking?',
      `Are you sure you want to cancel booking #${booking.id}?\n\n${feeMsg}`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => {
            cancelBooking(booking.id);
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleReschedule = () => {
    setDraft({
      date: booking.date,
      startTime: booking.startTime,
      durationMinutes: booking.durationMinutes,
      cookId: booking.cookId,
      mealTypes: booking.mealTypes,
    });
    router.push({
      pathname: '/book/schedule',
      params: { rescheduleId: booking.id },
    });
  };

  const handleRebook = () => {
    setDraft({
      cookId: booking.cookId,
      mealTypes: booking.mealTypes,
      durationMinutes: booking.durationMinutes,
    });
    router.push('/book/schedule');
  };

  return (
    <View style={screenStyles.container}>
      {/* Navigation Header */}
      <View style={[screenStyles.headerRow, { paddingTop: topPadding }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={screenStyles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={screenStyles.headerCenter}>
          <Text style={screenStyles.headerTitle}>Booking Details</Text>
          <Text style={screenStyles.headerSubtitle}>#{booking.id}</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Share booking"
          onPress={handleShare}
          style={screenStyles.shareBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          screenStyles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Alert Banner */}
        {booking.status === 'cancelled' ? (
          <View style={bannerStyles.cancelledBanner}>
            <Ionicons name="alert-circle" size={22} color={colors.danger} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={bannerStyles.cancelledTitle}>Booking Cancelled</Text>
              <Text style={bannerStyles.cancelledDesc}>
                This session was cancelled. If eligible, refund has been credited to your Zapeat Wallet.
              </Text>
            </View>
          </View>
        ) : (
          <View style={bannerStyles.statusBanner}>
            <LinearGradient
              colors={booking.status === 'completed' ? ['#047857', '#059669'] : ['#059669', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={bannerStyles.statusGradient}
            >
              <View style={bannerStyles.bannerLeft}>
                <View style={bannerStyles.bannerIconBox}>
                  <Ionicons
                    name={
                      booking.status === 'completed'
                        ? 'checkmark-done-circle'
                        : booking.status === 'in_progress'
                        ? 'flame'
                        : 'calendar'
                    }
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={bannerStyles.bannerStatusText}>
                    {booking.status === 'completed'
                      ? 'Session Completed'
                      : booking.status === 'in_progress'
                      ? 'Cooking in Progress'
                      : 'Upcoming Session'}
                  </Text>
                  <Text style={bannerStyles.bannerMetaText}>
                    {booking.date} · {booking.startTime || '12:00 PM'}
                  </Text>
                </View>
              </View>

              <View style={bannerStyles.bannerPill}>
                <Text style={bannerStyles.bannerPillText}>
                  {booking.mode === 'instant' ? '⚡ Instant' : '📅 Scheduled'}
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Timeline Visual Status Steps */}
        {booking.status !== 'cancelled' && (
          <View style={cardStyles.card}>
            <View style={cardStyles.cardHeaderRow}>
              <Text style={cardStyles.cardTitle}>Live Tracking</Text>
              <View style={cardStyles.liveBadge}>
                <View style={cardStyles.liveDot} />
                <Text style={cardStyles.liveText}>Real-time</Text>
              </View>
            </View>

            <View style={timelineStyles.container}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = step.id <= activeStepIndex;
                const isCurrent = step.id === activeStepIndex + 1 && booking.status !== 'completed';
                const isLast = idx === TIMELINE_STEPS.length - 1;

                return (
                  <View key={step.id} style={timelineStyles.stepRow}>
                    {/* Indicator Column */}
                    <View style={timelineStyles.indicatorCol}>
                      <View
                        style={[
                          timelineStyles.circle,
                          isCompleted && timelineStyles.circleCompleted,
                          isCurrent && timelineStyles.circleCurrent,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        ) : isCurrent ? (
                          <View style={timelineStyles.currentInnerDot} />
                        ) : (
                          <Text style={timelineStyles.stepNumText}>{step.id}</Text>
                        )}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            timelineStyles.connectingLine,
                            isCompleted && timelineStyles.connectingLineCompleted,
                          ]}
                        />
                      )}
                    </View>

                    {/* Step Content */}
                    <View style={timelineStyles.stepContent}>
                      <View style={timelineStyles.stepTitleRow}>
                        <Text
                          style={[
                            timelineStyles.stepTitle,
                            (isCompleted || isCurrent) && timelineStyles.stepTitleActive,
                          ]}
                        >
                          {step.title}
                        </Text>
                        {isCurrent && (
                          <View style={timelineStyles.activePill}>
                            <Text style={timelineStyles.activePillText}>Current</Text>
                          </View>
                        )}
                      </View>
                      <Text style={timelineStyles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Cook Details Card */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Assigned Home Cook</Text>
          <View style={cookCardStyles.row}>
            <LinearGradient
              colors={['#D1FAE5', '#A7F3D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={cookCardStyles.avatar}
            >
              <Text style={cookCardStyles.avatarText}>{initials}</Text>
            </LinearGradient>

            <View style={cookCardStyles.info}>
              <View style={cookCardStyles.nameRow}>
                <Text style={cookCardStyles.name}>{booking.cookName}</Text>
                <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              </View>
              <Text style={cookCardStyles.rating}>
                ⭐ {cook?.rating || '4.9'} · Verified Master Cook
              </Text>
              {cook?.cuisines && (
                <Text style={cookCardStyles.cuisines}>
                  {cook.cuisines.join(' • ')}
                </Text>
              )}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Contact Cook"
              onPress={() =>
                Alert.alert(
                  'Contact Cook',
                  `Connecting you with ${booking.cookName} via ZapEat secure masked line...`,
                  [{ text: 'Dismiss' }]
                )
              }
              style={cookCardStyles.callBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Session & Menu Details Card */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Session Information</Text>

          <View style={detailStyles.grid}>
            <View style={detailStyles.gridItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent} />
              <View style={{ marginLeft: 10 }}>
                <Text style={detailStyles.itemLabel}>Date</Text>
                <Text style={detailStyles.itemValue}>{booking.date}</Text>
              </View>
            </View>

            <View style={detailStyles.gridItem}>
              <Ionicons name="time-outline" size={18} color={colors.accent} />
              <View style={{ marginLeft: 10 }}>
                <Text style={detailStyles.itemLabel}>Slot Time</Text>
                <Text style={detailStyles.itemValue}>
                  {booking.startTime || '12:00 PM'}
                </Text>
              </View>
            </View>

            <View style={detailStyles.gridItem}>
              <Ionicons name="hourglass-outline" size={18} color={colors.accent} />
              <View style={{ marginLeft: 10 }}>
                <Text style={detailStyles.itemLabel}>Duration</Text>
                <Text style={detailStyles.itemValue}>
                  {booking.durationMinutes} minutes
                </Text>
              </View>
            </View>

            <View style={detailStyles.gridItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
              <View style={{ marginLeft: 10 }}>
                <Text style={detailStyles.itemLabel}>Hygiene Shield</Text>
                <Text style={detailStyles.itemValue}>Sanitized Kit</Text>
              </View>
            </View>
          </View>

          {/* Meals */}
          <View style={detailStyles.mealsSection}>
            <Text style={detailStyles.subheading}>Meal Types</Text>
            <View style={detailStyles.mealChipsRow}>
              {booking.mealTypes.map((meal) => (
                <View key={meal} style={detailStyles.mealChip}>
                  <Text style={detailStyles.mealChipText}>
                    {MEAL_NAMES[meal] || meal}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={cardStyles.card}>
          <View style={cardStyles.cardHeaderRow}>
            <Text style={cardStyles.cardTitle}>Service Address</Text>
            <View style={cardStyles.addressTag}>
              <Text style={cardStyles.addressTagText}>
                {booking.address?.label || 'Home'}
              </Text>
            </View>
          </View>

          <View style={addressCardStyles.row}>
            <View style={addressCardStyles.iconBox}>
              <Ionicons name="location" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={addressCardStyles.line}>
                {booking.address?.line || 'ZapEat Residence, Bangalore'}
              </Text>
              {booking.address?.landmark && (
                <Text style={addressCardStyles.landmark}>
                  Landmark: {booking.address.landmark}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Price Breakdown Card */}
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Price Breakdown</Text>

          <View style={priceStyles.row}>
            <Text style={priceStyles.label}>
              Cooking Session ({booking.durationMinutes} mins)
            </Text>
            <Text style={priceStyles.value}>
              {formatINR(booking.amountPaid + (booking.savings || 0))}
            </Text>
          </View>

          {booking.savings > 0 && (
            <View style={priceStyles.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[priceStyles.label, { color: colors.accent, fontWeight: '700' }]}>
                  Zapeat Pass Discount
                </Text>
                <Ionicons name="sparkles" size={13} color={colors.accent} />
              </View>
              <Text style={[priceStyles.value, { color: colors.accent, fontWeight: '800' }]}>
                - {formatINR(booking.savings)}
              </Text>
            </View>
          )}

          <View style={priceStyles.row}>
            <Text style={priceStyles.label}>Platform & Hygiene Fee</Text>
            <Text style={priceStyles.value}>₹0 (Waived)</Text>
          </View>

          <View style={priceStyles.divider} />

          <View style={priceStyles.totalRow}>
            <View>
              <Text style={priceStyles.totalLabel}>Total Amount Paid</Text>
              <Text style={priceStyles.taxNote}>Inclusive of all taxes</Text>
            </View>
            <Text style={priceStyles.totalValue}>
              {formatINR(booking.amountPaid)}
            </Text>
          </View>
        </View>

        {/* Payment Receipt Section */}
        <View style={cardStyles.card}>
          <View style={cardStyles.cardHeaderRow}>
            <Text style={cardStyles.cardTitle}>Payment Receipt</Text>
            <View style={receiptStyles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={13} color={colors.accent} />
              <Text style={receiptStyles.verifiedText}>Paid & Verified</Text>
            </View>
          </View>

          <View style={receiptStyles.infoGrid}>
            <View style={receiptStyles.infoItem}>
              <Text style={receiptStyles.infoLabel}>Payment Mode</Text>
              <Text style={receiptStyles.infoVal}>Zapeat Pay / UPI</Text>
            </View>

            <View style={receiptStyles.infoItem}>
              <Text style={receiptStyles.infoLabel}>Reference ID</Text>
              <Text style={receiptStyles.infoVal}>{booking.paymentRef || `TXN-${booking.id}`}</Text>
            </View>

            <View style={receiptStyles.infoItem}>
              <Text style={receiptStyles.infoLabel}>Payment Date</Text>
              <Text style={receiptStyles.infoVal}>
                {booking.createdAt ? booking.createdAt.slice(0, 10) : booking.date}
              </Text>
            </View>

            <View style={receiptStyles.infoItem}>
              <Text style={receiptStyles.infoLabel}>Status</Text>
              <Text style={[receiptStyles.infoVal, { color: colors.accent }]}>
                Successful
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View style={screenStyles.actionsBox}>
          {booking.status === 'upcoming' && (
            <View style={actionStyles.column}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Reschedule Session"
                onPress={handleReschedule}
                style={actionStyles.rescheduleBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                <Text style={actionStyles.rescheduleBtnText}>Reschedule Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cancel Booking"
                onPress={handleCancel}
                style={actionStyles.cancelBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                <Text style={actionStyles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}

          {booking.status === 'completed' && (
            <View style={actionStyles.column}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Rate and Review"
                onPress={() => router.push(`/bookings/${booking.id}/rate` as any)}
                style={actionStyles.rateBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" />
                <Text style={actionStyles.rateBtnText}>Rate & Review Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Book Again"
                onPress={handleRebook}
                style={actionStyles.rebookBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color={colors.accent} />
                <Text style={actionStyles.rebookBtnText}>Book This Cook Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {booking.status === 'in_progress' && (
            <View style={actionStyles.column}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Support Concierge"
                onPress={() => router.push('/help')}
                style={actionStyles.helpBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubbles-outline" size={18} color={colors.accent} />
                <Text style={actionStyles.helpBtnText}>Need Help with Ongoing Session?</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Stylesheets ──────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.mint,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(5, 150, 105, 0.08)',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 1,
  },
  shareBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionsBox: {
    marginTop: 8,
  },
});

const bannerStyles = StyleSheet.create({
  statusBanner: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.soft,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerMetaText: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '600',
    marginTop: 2,
  },
  bannerPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  bannerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cancelledTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.danger,
  },
  cancelledDesc: {
    fontSize: 12.5,
    color: '#991B1B',
    lineHeight: 18,
    marginTop: 2,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  addressTag: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  addressTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

const timelineStyles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.accent,
  },
  circleCurrent: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  currentInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  connectingLineCompleted: {
    backgroundColor: colors.accent,
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepTitleActive: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activePill: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

const cookCardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.soft,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  rating: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  cuisines: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
});

const detailStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBF9',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  mealsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  mealChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  mealChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
});

const addressCardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  landmark: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

const priceStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  taxNote: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
  },
});

const receiptStyles = StyleSheet.create({
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '47%',
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 3,
  },
});

const actionStyles = StyleSheet.create({
  column: {
    gap: 12,
  },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 18,
    ...shadows.soft,
  },
  rescheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 18,
  },
  cancelBtnText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 18,
    ...shadows.soft,
  },
  rateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 18,
  },
  rebookBtnText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 18,
  },
  helpBtnText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});

const notFoundStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
