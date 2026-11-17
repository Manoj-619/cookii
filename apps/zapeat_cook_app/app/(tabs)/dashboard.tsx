import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../src/theme';
import { useCookStore, useJobStore } from '../../src/store';

export default function CookDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isOnline = useCookStore((s) => s.isOnline);
  const toggleOnline = useCookStore((s) => s.toggleOnline);
  const todayEarnings = useCookStore((s) => s.todayEarnings);
  const thisWeekEarnings = useCookStore((s) => s.thisWeekEarnings);
  const rating = useCookStore((s) => s.rating);
  const jobsCompleted = useCookStore((s) => s.jobsCompleted);
  const profile = useCookStore((s) => s.profile);

  const pendingOffers = useJobStore((s) => s.pendingOffers);
  const activeJobs = useJobStore((s) => s.activeJobs);
  const advanceActiveJobStatus = useJobStore((s) => s.advanceActiveJobStatus);
  const completeActiveJob = useJobStore((s) => s.completeActiveJob);

  const currentActiveJob = activeJobs[0];

  const handleToggleOnline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toggleOnline();
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
  const androidStatusBar = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, androidStatusBar) : insets.top;
  const topPadding = topInset + 14;
  const bottomPadding = 75 + insets.bottom;

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Greeting & Online Toggle Switch */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Namaste 🙏</Text>
            <Text style={s.cookName}>{profile.name}</Text>
          </View>

          {/* Big Online/Offline Switch Component */}
          <View style={[s.onlineCard, isOnline ? s.onlineActive : s.onlineInactive]}>
            <View style={s.onlineStatusDotRow}>
              <View style={[s.statusDot, isOnline ? s.dotGreen : s.dotGray]} />
              <Text style={[s.onlineStatusText, isOnline ? s.textGreen : s.textGray]}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#D1DDD6', true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Offline Banner if not accepting jobs */}
        {!isOnline && (
          <View style={s.offlineAlert}>
            <Ionicons name="moon" size={18} color={colors.warning} />
            <Text style={s.offlineAlertText}>
              You are offline. Toggle switch to Online to receive high-paying customer bookings.
            </Text>
          </View>
        )}

        {/* Pending Job Offers Alert Banner */}
        {pendingOffers.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/jobs')}
            style={s.urgentAlert}
          >
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.urgentGradient}
            >
              <View style={s.urgentLeft}>
                <View style={s.bellIconCircle}>
                  <Ionicons name="notifications" size={18} color="#B45309" />
                </View>
                <View style={s.urgentTextWrap}>
                  <Text style={s.urgentTitle}>
                    {pendingOffers.length} New Job Offer{pendingOffers.length > 1 ? 's' : ''}!
                  </Text>
                  <Text style={s.urgentSubtitle}>
                    Earn up to ₹{pendingOffers.reduce((sum, o) => sum + o.earnings, 0)} • 25s timer running
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B45309" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Today's Earnings Card */}
        <LinearGradient
          colors={['#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.earningsCard}
        >
          <View style={s.earningsHeader}>
            <View>
              <Text style={s.earningsLabel}>TODAY'S EARNINGS</Text>
              <Text style={s.earningsAmount}>₹{todayEarnings.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/earnings')}
              style={s.breakdownButton}
              activeOpacity={0.8}
            >
              <Text style={s.breakdownText}>Breakdown</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Daily Goal Progress Bar */}
          <View style={s.progressContainer}>
            <View style={s.progressLabelRow}>
              <Text style={s.progressMuted}>Daily Goal (₹2,000)</Text>
              <Text style={s.progressPercent}>
                {Math.min(100, Math.round((todayEarnings / 2000) * 100))}%
              </Text>
            </View>
            <View style={s.progressBarTrack}>
              <View
                style={[
                  s.progressBarFill,
                  { width: `${Math.min(100, (todayEarnings / 2000) * 100)}%` },
                ]}
              />
            </View>
          </View>

          <View style={s.earningsStatsFooter}>
            <View style={s.footerMetric}>
              <Text style={s.footerMetricVal}>₹{thisWeekEarnings.toLocaleString('en-IN')}</Text>
              <Text style={s.footerMetricLabel}>This Week</Text>
            </View>
            <View style={s.footerMetricDivider} />
            <View style={s.footerMetric}>
              <Text style={s.footerMetricVal}>Daily Bank Payout</Text>
              <Text style={s.footerMetricLabel}>Auto-settles 11 PM</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Active Booking Card (if any) */}
        {currentActiveJob ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Active Cooking Session</Text>
              <View style={s.liveBadge}>
                <View style={s.pulsingGreenDot} />
                <Text style={s.liveBadgeText}>NOW LIVE</Text>
              </View>
            </View>

            <View style={s.activeJobCard}>
              <View style={s.activeJobTop}>
                <View style={s.mealTypeBadge}>
                  <Ionicons name="restaurant" size={14} color={colors.accent} />
                  <Text style={s.mealTypeText}>{currentActiveJob.mealType}</Text>
                </View>
                <Text style={s.activeJobFee}>+₹{currentActiveJob.earnings}</Text>
              </View>

              <Text style={s.customerNameText}>{currentActiveJob.customerName}</Text>
              <View style={s.locationRow}>
                <Ionicons name="location" size={15} color={colors.accent} />
                <Text style={s.locationText} numberOfLines={1}>
                  {currentActiveJob.fullAddress}
                </Text>
              </View>

              {/* Dishes tags */}
              <View style={s.dishesList}>
                {currentActiveJob.dishes.map((dish, i) => (
                  <View key={i} style={s.dishTag}>
                    <Text style={s.dishTagText}>🍽️ {dish}</Text>
                  </View>
                ))}
              </View>

              {/* Status progression bar */}
              <View style={s.statusStepContainer}>
                {[
                  { key: 'accepted', label: 'Accepted' },
                  { key: 'on_the_way', label: 'On Way' },
                  { key: 'arrived', label: 'Arrived' },
                  { key: 'cooking', label: 'Cooking' },
                ].map((step, idx) => {
                  const stepIndex = ['accepted', 'on_the_way', 'arrived', 'cooking'].indexOf(
                    currentActiveJob.status,
                  );
                  const isDone = stepIndex >= idx;
                  return (
                    <View key={step.key} style={s.statusStepItem}>
                      <View style={[s.stepCircle, isDone && s.stepCircleActive]}>
                        {isDone ? (
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        ) : (
                          <Text style={s.stepIndexNumber}>{idx + 1}</Text>
                        )}
                      </View>
                      <Text style={[s.stepLabel, isDone && s.stepLabelActive]}>
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Primary action button for current active job */}
              <View style={s.actionBtnRow}>
                <TouchableOpacity
                  style={s.advanceBtn}
                  activeOpacity={0.85}
                  onPress={() => handleStatusAdvance(currentActiveJob.id, currentActiveJob.status)}
                >
                  <Ionicons
                    name={
                      currentActiveJob.status === 'cooking'
                        ? 'checkmark-done-circle'
                        : 'arrow-forward-circle'
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={s.advanceBtnText}>
                    {currentActiveJob.status === 'accepted' && 'Start Travel (On Way)'}
                    {currentActiveJob.status === 'on_the_way' && 'Mark Arrived at Home'}
                    {currentActiveJob.status === 'arrived' && 'Start Cooking Session'}
                    {currentActiveJob.status === 'cooking' && 'Finish & Complete Job'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Today's Schedule Preview */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
              <Text style={s.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={s.scheduleList}>
            {[
              {
                time: '7:30 AM - 9:00 AM',
                meal: 'Breakfast',
                area: 'HSR Layout Sector 2',
                status: 'Completed',
                statusColor: colors.accent,
                statusBg: colors.successBg,
              },
              {
                time: '12:30 PM - 2:00 PM',
                meal: 'Lunch',
                area: 'Indiranagar 100ft Rd',
                status: 'Confirmed',
                statusColor: '#2563EB',
                statusBg: '#EFF6FF',
              },
              {
                time: '7:30 PM - 8:45 PM',
                meal: 'Dinner',
                area: 'Koramangala 4th Block',
                status: 'Available',
                statusColor: colors.textSecondary,
                statusBg: '#F3F4F6',
              },
            ].map((item, idx) => (
              <View key={idx} style={s.scheduleItem}>
                <View style={s.timeBadge}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={s.timeText}>{item.time}</Text>
                </View>
                <View style={s.scheduleItemDetails}>
                  <Text style={s.scheduleMealTitle}>{item.meal}</Text>
                  <Text style={s.scheduleAreaText}>{item.area}</Text>
                </View>
                <View style={[s.scheduleStatusPill, { backgroundColor: item.statusBg }]}>
                  <Text style={[s.scheduleStatusPillText, { color: item.statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Performance & Stats</Text>
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <View style={[s.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="checkmark-done" size={20} color={colors.accent} />
              </View>
              <Text style={s.statValue}>{jobsCompleted}</Text>
              <Text style={s.statLabel}>Total Jobs</Text>
            </View>

            <View style={s.statBox}>
              <View style={[s.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="star" size={20} color="#D97706" />
              </View>
              <Text style={s.statValue}>★ {rating}</Text>
              <Text style={s.statLabel}>Partner Rating</Text>
            </View>

            <View style={s.statBox}>
              <View style={[s.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="trophy" size={20} color="#2563EB" />
              </View>
              <Text style={s.statValue}>Top 5%</Text>
              <Text style={s.statLabel}>Bangalore Cook</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── Top Safe Area Edge Shield (Solid Pure White) ─────────────────────── */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topInset,
          backgroundColor: '#FFFFFF',
          zIndex: 99999,
          elevation: 25,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        }}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cookName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  onlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 8,
    ...shadows.soft,
  },
  onlineActive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  onlineInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  onlineStatusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: colors.accent,
  },
  dotGray: {
    backgroundColor: '#9CA3AF',
  },
  onlineStatusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textGreen: {
    color: colors.accent,
  },
  textGray: {
    color: '#6B7280',
  },
  offlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warningBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  offlineAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
  urgentAlert: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.soft,
  },
  urgentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  urgentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bellIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.2)',
  },
  urgentTextWrap: {
    flex: 1,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  urgentSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  earningsCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    ...shadows.floating,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
  },
  earningsAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginTop: 2,
  },
  breakdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  breakdownText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressMuted: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  earningsStatsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  footerMetric: {
    flex: 1,
  },
  footerMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerMetricLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },
  footerMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 14,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  activeJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.card,
  },
  activeJobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  activeJobFee: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.accent,
  },
  customerNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  dishesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  dishTag: {
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishTagText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statusStepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statusStepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.accent,
  },
  stepIndexNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  actionBtnRow: {
    marginTop: 4,
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    ...shadows.soft,
  },
  advanceBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.05)',
    gap: 12,
    ...shadows.soft,
  },
  timeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 80,
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  scheduleItemDetails: {
    flex: 1,
  },
  scheduleMealTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scheduleAreaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduleStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  scheduleStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
