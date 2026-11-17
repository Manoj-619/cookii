import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../src/theme';
import { useJobStore } from '../../src/store';
import { JobOffer } from '../../src/types';

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const pendingOffers = useJobStore((s) => s.pendingOffers);
  const activeJobs = useJobStore((s) => s.activeJobs);
  const completedToday = useJobStore((s) => s.completedToday);
  const acceptJob = useJobStore((s) => s.acceptJob);
  const declineJob = useJobStore((s) => s.declineJob);
  const advanceActiveJobStatus = useJobStore((s) => s.advanceActiveJobStatus);
  const completeActiveJob = useJobStore((s) => s.completeActiveJob);

  // 25-second countdown timer for each pending offer
  const [timers, setTimers] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    // Initialize timers for offers
    setTimers((prev) => {
      const next = { ...prev };
      pendingOffers.forEach((o) => {
        if (next[o.id] === undefined) {
          next[o.id] = o.expiresInSeconds || 25;
        }
      });
      return next;
    });

    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated: { [id: string]: number } = {};
        let changed = false;
        Object.keys(prev).forEach((id) => {
          const val = prev[id];
          if (val > 0) {
            updated[id] = val - 1;
            changed = true;
          } else {
            updated[id] = 0;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingOffers]);

  const handleAccept = (offer: JobOffer) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    acceptJob(offer.id);
  };

  const handleDecline = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    declineJob(offerId);
  };

  const handleStatusAdvance = (jobId: string, currentStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (currentStatus === 'cooking') {
      Alert.alert(
        'Complete Session?',
        'Mark this cooking session as completed and collect payout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Complete',
            style: 'default',
            onPress: () => completeActiveJob(jobId),
          },
        ],
      );
    } else {
      advanceActiveJobStatus(jobId);
    }
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
          <Text style={s.pageTitle}>Job Orders & Bookings</Text>
          <Text style={s.pageSubtitle}>Review instant offers and track active cooking sessions</Text>
        </View>

        {/* ─── 1. PENDING OFFERS SECTION ──────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>Pending Job Offers</Text>
            {pendingOffers.length > 0 ? (
              <View style={s.counterBadge}>
                <Text style={s.counterBadgeText}>{pendingOffers.length} urgent</Text>
              </View>
            ) : null}
          </View>

          {pendingOffers.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="sparkles" size={32} color={colors.accent} />
              <Text style={s.emptyTitle}>No pending offers right now</Text>
              <Text style={s.emptyDesc}>
                Stay online to receive instant booking requests nearby.
              </Text>
            </View>
          ) : (
            pendingOffers.map((offer) => {
              const secondsLeft = timers[offer.id] ?? 25;
              const isUrgent = secondsLeft <= 10;

              return (
                <View key={offer.id} style={s.offerCard}>
                  {/* Countdown Timer Header */}
                  <View style={s.offerTopRow}>
                    <View style={s.mealTypeBadge}>
                      <Ionicons name="restaurant" size={13} color={colors.accent} />
                      <Text style={s.mealTypeBadgeText}>{offer.mealType}</Text>
                    </View>

                    <View style={s.durationPill}>
                      <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                      <Text style={s.durationText}>{offer.durationMinutes} mins</Text>
                    </View>

                    <View
                      style={[
                        s.timerPill,
                        isUrgent ? s.timerUrgentBg : s.timerNormalBg,
                      ]}
                    >
                      <Ionicons
                        name="hourglass-outline"
                        size={13}
                        color={isUrgent ? colors.danger : '#D97706'}
                      />
                      <Text
                        style={[
                          s.timerText,
                          isUrgent ? s.timerUrgentText : s.timerNormalText,
                        ]}
                      >
                        {secondsLeft > 0 ? `${secondsLeft}s left` : 'Expired'}
                      </Text>
                    </View>
                  </View>

                  {/* Earnings highlight & Area */}
                  <View style={s.offerBody}>
                    <View style={s.offerMain}>
                      <Text style={s.areaText}>{offer.customerArea}</Text>
                      <Text style={s.customerNameSub}>{offer.customerName} • {offer.requestedTime}</Text>
                    </View>
                    <View style={s.payoutBlock}>
                      <Text style={s.payoutLabel}>YOU EARN</Text>
                      <Text style={s.payoutValue}>₹{offer.earnings}</Text>
                    </View>
                  </View>

                  {/* Address preview */}
                  {offer.fullAddress && (
                    <View style={s.addressRow}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Text style={s.addressText} numberOfLines={1}>
                        {offer.fullAddress}
                      </Text>
                    </View>
                  )}

                  {/* Dishes requested */}
                  <View style={s.dishesContainer}>
                    <Text style={s.dishesLabel}>Requested Dishes:</Text>
                    <View style={s.dishesChipsRow}>
                      {offer.dishes.map((dish, i) => (
                        <View key={i} style={s.dishChip}>
                          <Text style={s.dishChipText}>• {dish}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Accept / Decline CTA Buttons with Haptic feedback */}
                  <View style={s.btnRow}>
                    <TouchableOpacity
                      style={s.declineBtn}
                      activeOpacity={0.7}
                      onPress={() => handleDecline(offer.id)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                      <Text style={s.declineBtnText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={s.acceptBtn}
                      activeOpacity={0.85}
                      onPress={() => handleAccept(offer)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={s.acceptBtnText}>Accept Job (₹{offer.earnings})</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ─── 2. ACTIVE JOBS SECTION ─────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Active Jobs</Text>

          {activeJobs.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="briefcase-outline" size={28} color={colors.textSecondary} />
              <Text style={s.emptyDesc}>No active job right now. Accepted jobs will appear here.</Text>
            </View>
          ) : (
            activeJobs.map((job) => (
              <View key={job.id} style={s.activeCard}>
                <View style={s.activeCardHeader}>
                  <View>
                    <Text style={s.activeCustomerName}>{job.customerName}</Text>
                    <Text style={s.activeMealType}>{job.mealType} • {job.scheduledTime}</Text>
                  </View>
                  <Text style={s.activeEarningsText}>₹{job.earnings}</Text>
                </View>

                <View style={s.activeLocationRow}>
                  <Ionicons name="navigate-outline" size={15} color={colors.accent} />
                  <Text style={s.activeAddress}>{job.fullAddress}</Text>
                </View>

                {/* Progress bar */}
                <View style={s.progressSteps}>
                  {[
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'on_the_way', label: 'On Way' },
                    { key: 'arrived', label: 'Arrived' },
                    { key: 'cooking', label: 'Cooking' },
                  ].map((step, idx) => {
                    const stepIdx = ['accepted', 'on_the_way', 'arrived', 'cooking'].indexOf(
                      job.status,
                    );
                    const done = stepIdx >= idx;
                    return (
                      <View key={step.key} style={s.stepItem}>
                        <View style={[s.stepDot, done && s.stepDotActive]}>
                          {done ? (
                            <Ionicons name="checkmark" size={10} color="#FFF" />
                          ) : (
                            <Text style={s.stepNum}>{idx + 1}</Text>
                          )}
                        </View>
                        <Text style={[s.stepText, done && s.stepTextActive]}>{step.label}</Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={s.statusActionBtn}
                  activeOpacity={0.85}
                  onPress={() => handleStatusAdvance(job.id, job.status)}
                >
                  <Ionicons
                    name={
                      job.status === 'cooking' ? 'checkmark-done-circle' : 'arrow-forward-circle'
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={s.statusActionText}>
                    {job.status === 'accepted' && 'Start Travel (On the Way)'}
                    {job.status === 'on_the_way' && 'I Have Arrived'}
                    {job.status === 'arrived' && 'Start Cooking Session'}
                    {job.status === 'cooking' && 'Finish & Complete Session'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ─── 3. COMPLETED JOBS SECTION ──────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Completed Today & Recent</Text>

          {completedToday.map((item) => (
            <View key={item.id} style={s.completedCard}>
              <View style={s.completedLeft}>
                <View style={s.checkCircle}>
                  <Ionicons name="checkmark" size={16} color={colors.accent} />
                </View>
                <View style={s.completedMeta}>
                  <Text style={s.completedCustomer}>{item.customerName}</Text>
                  <Text style={s.completedSub}>
                    {item.mealType} • {item.customerArea} • {item.completedAt}
                  </Text>
                </View>
              </View>
              <View style={s.completedRight}>
                <Text style={s.completedAmount}>+₹{item.earnings}</Text>
                {item.rating && (
                  <View style={s.ratingBadge}>
                    <Ionicons name="star" size={11} color="#D97706" />
                    <Text style={s.ratingBadgeText}>{item.rating}.0</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
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
    marginBottom: 18,
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
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  counterBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
    textTransform: 'uppercase',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.05)',
    ...shadows.soft,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    ...shadows.card,
  },
  offerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timerPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerNormalBg: {
    backgroundColor: '#FEF3C7',
  },
  timerUrgentBg: {
    backgroundColor: '#FEE2E2',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timerNormalText: {
    color: '#B45309',
  },
  timerUrgentText: {
    color: colors.danger,
  },
  offerBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  offerMain: {
    flex: 1,
  },
  areaText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  customerNameSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  payoutBlock: {
    alignItems: 'flex-end',
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  payoutValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.accent,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  dishesContainer: {
    backgroundColor: colors.mint,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  dishesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dishesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dishChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.accent,
    ...shadows.soft,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeCustomerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activeMealType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeEarningsText: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.accent,
  },
  activeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  activeAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.accent,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  statusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 14,
  },
  statusActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  completedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.05)',
    ...shadows.soft,
  },
  completedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedMeta: {
    flex: 1,
  },
  completedCustomer: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  completedSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  completedRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  completedAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.accent,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
});
