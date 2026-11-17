import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../src/theme';
import { useCookStore } from '../../src/store';

type Period = 'week' | 'month';

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');

  const thisWeekEarnings = useCookStore((s) => s.thisWeekEarnings);
  const totalEarnings = useCookStore((s) => s.totalEarnings);
  const payoutStatus = useCookStore((s) => s.payoutStatus);
  const transactions = useCookStore((s) => s.transactions);
  const profile = useCookStore((s) => s.profile);

  const displayedEarnings = period === 'week' ? thisWeekEarnings : 38200;

  const handlePeriodChange = (next: Period) => {
    Haptics.selectionAsync().catch(() => {});
    setPeriod(next);
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
          <Text style={s.pageTitle}>Earnings & Payouts</Text>
          <Text style={s.pageSubtitle}>Track your completed bookings, tips and direct bank transfers</Text>
        </View>

        {/* Week / Month Toggle Pill */}
        <View style={s.toggleContainer}>
          <TouchableOpacity
            style={[s.toggleBtn, period === 'week' && s.toggleBtnActive]}
            onPress={() => handlePeriodChange('week')}
            activeOpacity={0.8}
          >
            <Text style={[s.toggleBtnText, period === 'week' && s.toggleBtnTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.toggleBtn, period === 'month' && s.toggleBtnActive]}
            onPress={() => handlePeriodChange('month')}
            activeOpacity={0.8}
          >
            <Text style={[s.toggleBtnText, period === 'month' && s.toggleBtnTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Earnings Card */}
        <LinearGradient
          colors={['#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroCardTop}>
            <View>
              <Text style={s.heroCardLabel}>
                TOTAL EARNED ({period === 'week' ? 'THIS WEEK' : 'THIS MONTH'})
              </Text>
              <Text style={s.heroAmount}>₹{displayedEarnings.toLocaleString('en-IN')}</Text>
            </View>

            {/* Payout Status Badge */}
            <View style={s.payoutBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
              <Text style={s.payoutBadgeText}>{payoutStatus.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={s.heroSubtitleText}>
            100% of booking fees and customer tips go directly to your account.
          </Text>

          {/* Breakdown row */}
          <View style={s.breakdownRow}>
            <View style={s.breakdownCol}>
              <Text style={s.breakdownVal}>
                ₹{period === 'week' ? '6,850' : '35,400'}
              </Text>
              <Text style={s.breakdownLabel}>Cooking Fees</Text>
            </View>
            <View style={s.breakdownDivider} />
            <View style={s.breakdownCol}>
              <Text style={s.breakdownVal}>
                ₹{period === 'week' ? '600' : '2,800'}
              </Text>
              <Text style={s.breakdownLabel}>Customer Tips</Text>
            </View>
            <View style={s.breakdownDivider} />
            <View style={s.breakdownCol}>
              <Text style={s.breakdownVal}>₹0</Text>
              <Text style={s.breakdownLabel}>Commission (0%)</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Bank Account Linked Indicator */}
        <View style={s.bankCard}>
          <View style={s.bankIconCircle}>
            <Ionicons name="business" size={22} color={colors.accent} />
          </View>
          <View style={s.bankDetails}>
            <View style={s.bankTitleRow}>
              <Text style={s.bankNameText}>{profile.bankAccount.bankName}</Text>
              <View style={s.verifiedChip}>
                <Ionicons name="checkmark-circle" size={12} color={colors.accent} />
                <Text style={s.verifiedChipText}>Verified</Text>
              </View>
            </View>
            <Text style={s.accountNumberText}>
              Account: {profile.bankAccount.accountNumberMasked} • {profile.bankAccount.ifsc}
            </Text>
            <Text style={s.autoSettlementText}>
              Automatic settlement daily at 11:00 PM
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Transaction History</Text>
            <Text style={s.lifetimeTotal}>Lifetime: ₹{totalEarnings.toLocaleString('en-IN')}</Text>
          </View>

          <View style={s.transactionsList}>
            {transactions.map((txn) => {
              const isPayout = txn.type === 'payout';

              return (
                <View key={txn.id} style={s.txnCard}>
                  <View style={s.txnLeft}>
                    <View
                      style={[
                        s.txnIconBox,
                        isPayout ? s.txnIconPayout : s.txnIconCredit,
                      ]}
                    >
                      <Ionicons
                        name={isPayout ? 'arrow-up-circle' : 'arrow-down-circle'}
                        size={20}
                        color={isPayout ? '#2563EB' : colors.accent}
                      />
                    </View>
                    <View style={s.txnInfo}>
                      <Text style={s.txnTitle}>{txn.title}</Text>
                      <Text style={s.txnDate}>
                        {txn.date} {txn.bookingRef ? `• ${txn.bookingRef}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={s.txnRight}>
                    <Text
                      style={[
                        s.txnAmount,
                        isPayout ? s.txnAmountPayout : s.txnAmountCredit,
                      ]}
                    >
                      {isPayout ? `-₹${Math.abs(txn.amount)}` : `+₹${txn.amount}`}
                    </Text>
                    <View style={s.txnStatusPill}>
                      <Text style={s.txnStatusText}>{txn.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
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
    marginBottom: 14,
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F1EC',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.soft,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.textPrimary,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    ...shadows.floating,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  payoutBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
  },
  heroSubtitleText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 14,
  },
  breakdownCol: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  breakdownLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  breakdownDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    gap: 14,
    ...shadows.soft,
  },
  bankIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankDetails: {
    flex: 1,
  },
  bankTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  accountNumberText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  autoSettlementText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
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
  lifetimeTotal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  transactionsList: {
    gap: 10,
  },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.05)',
    ...shadows.soft,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txnIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnIconCredit: {
    backgroundColor: '#ECFDF5',
  },
  txnIconPayout: {
    backgroundColor: '#EFF6FF',
  },
  txnInfo: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  txnDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  txnAmountCredit: {
    color: colors.accent,
  },
  txnAmountPayout: {
    color: '#2563EB',
  },
  txnStatusPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txnStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
