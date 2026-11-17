import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { processPayment, PaymentResult, PaymentRequest } from '../../src/services/payment';
import { RazorpayPaymentProvider } from '../../src/services/payment/PaymentProvider';
import { useBookingStore, useUserStore, useWalletStore, useAuthStore } from '../../src/store';
import { cooks } from '../../src/data/cooks';
import { calculatePrice, formatINR } from '../../src/lib/pricing';
import { Screen, Header, Button, Sheet, styles } from '../../src/components/ui';

// Meal type labels and emojis
const MEAL_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🥞' },
  lunch: { label: 'Lunch', emoji: '🍛' },
  dinner: { label: 'Dinner', emoji: '🍲' },
  snacks: { label: 'Snacks', emoji: '🥟' },
  meal_prep: { label: 'Meal Prep', emoji: '🥗' },
  party: { label: 'Party', emoji: '🎉' },
  special_diet: { label: 'Special Diet', emoji: '🥑' },
};

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Selected Date';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, 'EEE, d MMM yyyy');
  } catch {
    return dateStr;
  }
}

function formatDuration(minutes: number): string {
  if (!minutes) return '60 mins';
  if (minutes < 60) return `${minutes} mins`;
  if (minutes % 60 === 0) {
    const hrs = minutes / 60;
    return `${minutes} mins (${hrs} ${hrs === 1 ? 'hr' : 'hrs'})`;
  }
  return `${minutes} mins (${(minutes / 60).toFixed(1)} hrs)`;
}

function generateRef(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export default function Confirm() {
  const draft = useBookingStore((s) => s.draft);
  const confirmBooking = useBookingStore((s) => s.confirmBooking);
  const user = useUserStore();
  const userName = useUserStore((s) => s.name);
  const wallet = useWalletStore();
  const phone = useAuthStore((s) => s.phone);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const price = calculatePrice({
    minutes: draft.durationMinutes || 60,
    date: draft.date || new Date(),
    isPassActive: true,
  });

  const address = user.addresses.find((a) => a.id === draft.addressId) || user.addresses[0];
  const cook = cooks.find((c) => c.id === draft.cookId);

  // Pay handler
  const handlePay = async (method: 'wallet' | 'upi' | 'card' | 'netbanking') => {
    if (loading) return;

    // 1. Wallet payment: check balance >= total, debit immediately without Razorpay
    if (method === 'wallet') {
      if (wallet.cashBalance < price.total) {
        Alert.alert(
          'Insufficient Balance',
          `Your wallet balance is ${formatINR(wallet.cashBalance)}, but the total is ${formatINR(price.total)}. Please choose another payment method or add funds to your wallet.`,
          [{ text: 'OK' }]
        );
        return;
      }

      setLoading(true);
      try {
        const debited = wallet.debit(price.total, 'Paid for booking');
        if (!debited) {
          Alert.alert('Payment Failed', 'Could not debit from wallet. Please try again.');
          return;
        }

        const booking = confirmBooking({
          amountPaid: price.total,
          savings: price.savings,
          paymentRef: generateRef('WALLET'),
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSheetVisible(false);
        router.replace({ pathname: '/book/success', params: { id: booking.id } });
      } catch (err: any) {
        Alert.alert('Payment Error', err?.message || 'Something went wrong with wallet payment. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. UPI, Card, Netbanking: call processPayment from services/payment
    setLoading(true);
    try {
      const customerName = userName || user.name || 'Zapeat Customer';
      const customerPhone = phone || '9999999999';

      // Inline RazorpayPaymentProvider with customer info
      const provider = new RazorpayPaymentProvider({
        customerName: user.name,
        customerPhone: phone || '9999999999',
      });

      const paymentRequest: PaymentRequest = {
        amount: price.total,
        currency: 'INR',
        bookingDraftId: generateRef('draft'),
        customer: {
          name: customerName,
          phone: customerPhone,
        },
      };

      const { result, walletUsed }: { result: PaymentResult; walletUsed: number } = await processPayment(
        paymentRequest,
        method,
        wallet.cashBalance,
        provider
      );

      if (result.status === 'success') {
        if (walletUsed > 0) {
          wallet.debit(walletUsed, 'Paid for booking');
        }

        const booking = confirmBooking({
          amountPaid: price.total,
          savings: price.savings,
          paymentRef: result.referenceId || generateRef('PAY'),
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSheetVisible(false);
        router.replace({ pathname: '/book/success', params: { id: booking.id } });
      } else if (result.status === 'cancelled') {
        Alert.alert('Payment Cancelled', 'Your payment was cancelled. You can retry whenever you are ready.');
      } else {
        Alert.alert('Payment Failed', 'Payment could not be completed. Please try another payment method.');
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Header title="Review & Pay" />

      {/* 1. Booking Summary Card */}
      <View style={styles.card}>
        <View style={localStyles.cardHeader}>
          <Text style={styles.heading}>Booking summary</Text>
          <View style={localStyles.badge}>
            <Text style={localStyles.badgeText}>{draft.mode === 'instant' ? '⚡ Instant' : '📅 Scheduled'}</Text>
          </View>
        </View>

        {/* Cook Details */}
        <View style={localStyles.cookRow}>
          <View style={localStyles.cookAvatar}>
            <Text style={localStyles.cookAvatarText}>
              {cook?.initials || '👩‍🍳'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.body, { fontWeight: '700', fontSize: 16 }]}>
                {cook?.name || 'Best Available Cook'}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
            </View>
            <Text style={styles.muted}>
              {cook ? `${cook.cuisines.join(' • ')} · ⭐ ${cook.rating}` : 'Top-rated cook assigned before arrival'}
            </Text>
          </View>
        </View>

        <View style={localStyles.divider} />

        {/* Date, Time & Duration */}
        <View style={localStyles.metaGrid}>
          <View style={localStyles.metaItem}>
            <View style={localStyles.metaIconWrap}>
              <Ionicons name="calendar-outline" size={16} color="#059669" />
            </View>
            <View>
              <Text style={localStyles.metaLabel}>Date</Text>
              <Text style={localStyles.metaValue}>{formatDisplayDate(draft.date)}</Text>
            </View>
          </View>

          <View style={localStyles.metaItem}>
            <View style={localStyles.metaIconWrap}>
              <Ionicons name="time-outline" size={16} color="#059669" />
            </View>
            <View>
              <Text style={localStyles.metaLabel}>Time</Text>
              <Text style={localStyles.metaValue}>{draft.startTime || 'Not set'}</Text>
            </View>
          </View>

          <View style={localStyles.metaItem}>
            <View style={localStyles.metaIconWrap}>
              <Ionicons name="timer-outline" size={16} color="#059669" />
            </View>
            <View>
              <Text style={localStyles.metaLabel}>Duration</Text>
              <Text style={localStyles.metaValue}>{formatDuration(draft.durationMinutes)}</Text>
            </View>
          </View>
        </View>

        {/* Meal Types */}
        <View style={{ marginTop: 14 }}>
          <Text style={[localStyles.metaLabel, { marginBottom: 6 }]}>Meals to prepare</Text>
          <View style={localStyles.mealsContainer}>
            {draft.mealTypes && draft.mealTypes.length > 0 ? (
              draft.mealTypes.map((type) => {
                const info = MEAL_LABELS[type] || { label: type, emoji: '🍽️' };
                return (
                  <View key={type} style={localStyles.mealChip}>
                    <Text style={localStyles.mealChipText}>
                      {info.emoji} {info.label}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.muted}>Your choice of meals</Text>
            )}
          </View>
        </View>
      </View>

      {/* 2. Delivery Address Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location" size={18} color="#059669" />
            <Text style={styles.heading}>Service address</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Change address"
            onPress={() => router.push('/book/address')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={localStyles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {address ? (
          <View style={{ marginTop: 4 }}>
            <View style={localStyles.addressBadge}>
              <Text style={localStyles.addressBadgeText}>{address.label}</Text>
            </View>
            <Text style={[styles.body, { marginTop: 6, fontWeight: '500' }]}>{address.line}</Text>
            {address.landmark ? (
              <Text style={[styles.muted, { marginTop: 2 }]}>Near {address.landmark}</Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/book/address')}
            style={localStyles.noAddressBox}
          >
            <Text style={[styles.muted, { color: '#EF4444' }]}>⚠️ No address selected. Tap to add.</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Price Breakdown Card */}
      <View style={styles.card}>
        <Text style={styles.heading}>Price breakdown</Text>

        <View style={[styles.row, localStyles.priceRow]}>
          <Text style={styles.body}>Base cooking fare</Text>
          <Text style={styles.body}>{formatINR(price.original)}</Text>
        </View>

        {price.savings > 0 && (
          <View style={[styles.row, localStyles.priceRow]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.body, { color: '#059669' }]}>Zapeat Pass savings</Text>
              <Ionicons name="sparkles" size={14} color="#059669" />
            </View>
            <Text style={[styles.body, { color: '#059669', fontWeight: '700' }]}>
              -{formatINR(price.savings)}
            </Text>
          </View>
        )}

        <View style={[styles.row, localStyles.priceRow]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.body}>Platform & safety fee</Text>
            <Ionicons name="shield-checkmark-outline" size={14} color="#526B5F" />
          </View>
          <Text style={styles.body}>{formatINR(price.platformFee)}</Text>
        </View>

        <View style={localStyles.divider} />

        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={[styles.heading, { marginBottom: 0, fontSize: 18 }]}>Total payable</Text>
          <Text style={[styles.heading, { marginBottom: 0, fontSize: 20, color: '#059669' }]}>
            {formatINR(price.total)}
          </Text>
        </View>

        {price.savings > 0 && (
          <View style={localStyles.savingsBanner}>
            <Ionicons name="gift-outline" size={16} color="#059669" />
            <Text style={localStyles.savingsBannerText}>
              You save {formatINR(price.savings)} on this booking with Pass!
            </Text>
          </View>
        )}
      </View>

      {/* Policy reassurance */}
      <View style={localStyles.policyCard}>
        <Ionicons name="information-circle-outline" size={18} color="#526B5F" />
        <Text style={[styles.muted, { flex: 1, marginLeft: 8 }]}>
          Free cancellation until 2 hours before the booking. A ₹50 fee applies afterward.
        </Text>
      </View>

      {/* 4. Action Button */}
      <View style={{ marginTop: 8, marginBottom: 20 }}>
        <Button
          title={`Pay ${formatINR(price.total)}`}
          disabled={!address || !draft.startTime || loading}
          loading={loading}
          onPress={() => setSheetVisible(true)}
        />
      </View>

      {/* 5. Payment Sheet */}
      <Sheet
        visible={sheetVisible}
        onClose={() => !loading && setSheetVisible(false)}
        title={loading ? 'Processing Payment' : 'Choose payment method'}
      >
        {loading ? (
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={localStyles.loadingTitle}>Processing payment securely…</Text>
            <Text style={localStyles.loadingSub}>
              Please do not close the app or navigate away while we complete your transaction.
            </Text>
            <View style={localStyles.secureBadge}>
              <Ionicons name="shield-checkmark" size={15} color="#059669" />
              <Text style={localStyles.secureBadgeText}>256-bit encrypted & secure</Text>
            </View>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {/* Amount display */}
            <View style={localStyles.sheetAmountRow}>
              <Text style={styles.muted}>Amount to pay</Text>
              <Text style={localStyles.sheetAmountValue}>{formatINR(price.total)}</Text>
            </View>

            {/* 1. Wallet Card */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Pay with Zapeat Wallet"
              activeOpacity={0.75}
              disabled={loading}
              onPress={() => handlePay('wallet')}
              style={[
                localStyles.methodCard,
                wallet.cashBalance < price.total && localStyles.methodCardLowBalance,
              ]}
            >
              <View style={[localStyles.methodIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="wallet" size={22} color="#059669" />
              </View>
              <View style={localStyles.methodContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={localStyles.methodTitle}>Zapeat Wallet</Text>
                  {wallet.cashBalance >= price.total ? (
                    <View style={localStyles.instantPill}>
                      <Text style={localStyles.instantPillText}>Instant Pay</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={localStyles.methodSubtitle}>
                  Available balance: {formatINR(wallet.cashBalance)}
                </Text>
              </View>
              {wallet.cashBalance >= price.total ? (
                <Ionicons name="chevron-forward" size={20} color="#059669" />
              ) : (
                <Text style={localStyles.insufficientText}>Insufficient</Text>
              )}
            </TouchableOpacity>

            {/* 2. UPI Card */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Pay with UPI"
              activeOpacity={0.75}
              disabled={loading}
              onPress={() => handlePay('upi')}
              style={localStyles.methodCard}
            >
              <View style={[localStyles.methodIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="phone-portrait-outline" size={22} color="#2563EB" />
              </View>
              <View style={localStyles.methodContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={localStyles.methodTitle}>UPI</Text>
                  <View style={[localStyles.instantPill, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[localStyles.instantPillText, { color: '#2563EB' }]}>Recommended</Text>
                  </View>
                </View>
                <Text style={localStyles.methodSubtitle}>Google Pay, PhonePe, Paytm, BHIM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#526B5F" />
            </TouchableOpacity>

            {/* 3. Card */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Pay with Credit or Debit Card"
              activeOpacity={0.75}
              disabled={loading}
              onPress={() => handlePay('card')}
              style={localStyles.methodCard}
            >
              <View style={[localStyles.methodIconCircle, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="card-outline" size={22} color="#7C3AED" />
              </View>
              <View style={localStyles.methodContent}>
                <Text style={localStyles.methodTitle}>Credit / Debit Card</Text>
                <Text style={localStyles.methodSubtitle}>Visa, Mastercard, RuPay, Maestro</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#526B5F" />
            </TouchableOpacity>

            {/* 4. Net Banking */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Pay with Net Banking"
              activeOpacity={0.75}
              disabled={loading}
              onPress={() => handlePay('netbanking')}
              style={localStyles.methodCard}
            >
              <View style={[localStyles.methodIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="business-outline" size={22} color="#D97706" />
              </View>
              <View style={localStyles.methodContent}>
                <Text style={localStyles.methodTitle}>Net Banking</Text>
                <Text style={localStyles.methodSubtitle}>SBI, HDFC, ICICI, Axis & all major banks</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#526B5F" />
            </TouchableOpacity>

            {/* Security trust note */}
            <View style={localStyles.sheetFooter}>
              <Ionicons name="lock-closed" size={13} color="#526B5F" />
              <Text style={localStyles.sheetFooterText}>
                Secured by Razorpay · 256-bit encryption
              </Text>
            </View>
          </ScrollView>
        )}
      </Sheet>
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  cookRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  cookAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(31, 58, 46, 0.07)',
    marginVertical: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FAF7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: '47%',
    flex: 1,
    gap: 10,
  },
  metaIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#526B5F',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#11231B',
    marginTop: 1,
  },
  mealsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#E8F1EC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mealChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#11231B',
  },
  changeButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '700',
  },
  addressBadge: {
    backgroundColor: '#F6FAF7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  addressBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#526B5F',
    textTransform: 'uppercase',
  },
  noAddressBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  priceRow: {
    marginVertical: 6,
  },
  savingsBanner: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingsBannerText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(82, 107, 95, 0.08)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11231B',
    marginTop: 18,
    textAlign: 'center',
  },
  loadingSub: {
    fontSize: 13,
    color: '#526B5F',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 20,
  },
  secureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  sheetAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F1EC',
  },
  sheetAmountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#11231B',
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8F1EC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodCardLowBalance: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: '#FFFDFD',
  },
  methodIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11231B',
  },
  methodSubtitle: {
    fontSize: 12,
    color: '#526B5F',
    marginTop: 2,
  },
  instantPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  instantPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  insufficientText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
  },
  sheetFooterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#526B5F',
  },
});
