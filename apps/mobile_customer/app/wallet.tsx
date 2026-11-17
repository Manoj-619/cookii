import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Button, Sheet, Chip, styles } from '../src/components/ui';
import { useWalletStore, useAuthStore, useUserStore } from '../src/store';
import { formatINR } from '../src/lib/pricing';
import { paymentService } from '../src/services/payment';
import { colors, shadows } from '../src/theme';

export default function Wallet() {
  const wallet = useWalletStore();
  const phone = useAuthStore((s) => s.phone);
  const name = useUserStore((s) => s.name);
  const [sheet, setSheet] = useState(false);
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);

  const totalBalance = wallet.cashBalance + wallet.bonusBalance;

  async function handleAddMoney() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      const result = await paymentService.createOrder(
        {
          amount: n,
          currency: 'INR',
          bookingDraftId: 'wallet-topup',
          customer: { phone, name },
        },
        'upi'
      );
      if (result.status === 'success') {
        wallet.addMoney(n);
        setSheet(false);
        Alert.alert('Success', `Added ${formatINR(n)} to your Zapeat wallet.`);
      } else {
        Alert.alert('Payment Not Completed', 'Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Unable to add money. Please check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Header title="Zapeat Wallet" />

      {/* Snabbit Sleek Balance Card */}
      <LinearGradient
        colors={['#153A27', '#21583A', '#2E7D4F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.balanceCard}
      >
        <View style={s.balanceTopRow}>
          <View>
            <Text style={s.balanceEyebrow}>TOTAL BALANCE</Text>
            <Text style={s.balanceValue}>{formatINR(totalBalance)}</Text>
          </View>
          <View style={s.passPill}>
            <Ionicons name="sparkles" size={12} color="#FDE047" />
            <Text style={s.passPillText}>10% PASS SAVINGS</Text>
          </View>
        </View>

        <View style={s.balanceDivider} />

        <View style={s.balanceFooter}>
          <View>
            <Text style={s.footerLabel}>Withdrawable Cash</Text>
            <Text style={s.footerValue}>{formatINR(wallet.cashBalance)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.footerLabel}>Zapeat Credits</Text>
            <Text style={s.footerValue}>{formatINR(wallet.bonusBalance)}</Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add money to wallet"
          onPress={() => setSheet(true)}
          activeOpacity={0.88}
          style={s.topupBtn}
        >
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={s.topupBtnText}>Add Money</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Perk Banner */}
      <View style={s.perkBanner}>
        <View style={s.perkIconWrap}>
          <Ionicons name="flash" size={16} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.perkTitle}>1-Tap Instant Checkout</Text>
          <Text style={s.perkDesc}>
            Bookings made using your wallet are confirmed instantly with zero payment delays.
          </Text>
        </View>
      </View>

      {/* Transaction History */}
      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <Text style={styles.heading}>Recent Activity</Text>
      </View>

      {wallet.transactions.length === 0 ? (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>💳</Text>
          <Text style={[styles.body, { fontWeight: '700' }]}>No transactions yet</Text>
          <Text style={styles.muted}>Your wallet activity will show up here.</Text>
        </View>
      ) : (
        wallet.transactions.map((t) => {
          const isCredit = t.amount > 0;
          return (
            <View key={t.id} style={[styles.card, styles.row, { paddingVertical: 14 }]}>
              <View
                style={[
                  s.txIconWrap,
                  { backgroundColor: isCredit ? '#EEF9F1' : '#F8FCF9' },
                ]}
              >
                <Ionicons
                  name={isCredit ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={isCredit ? colors.accent : colors.textSecondary}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.body, { fontWeight: '700', fontSize: 15 }]}>
                  {t.title}
                </Text>
                <Text style={[styles.muted, { marginTop: 2, fontSize: 12 }]}>
                  {new Date(t.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · {t.status}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: isCredit ? colors.accent : colors.textPrimary,
                }}
              >
                {isCredit ? '+' : ''}
                {formatINR(t.amount)}
              </Text>
            </View>
          );
        })
      )}

      {/* Snabbit Add Money Bottom Sheet */}
      <Sheet visible={sheet} onClose={() => setSheet(false)} title="Add to Zapeat Wallet">
        <Text style={[styles.muted, { marginBottom: 14 }]}>
          Select or enter the amount you would like to add:
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[200, 500, 1000, 2000].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setAmount(String(n))}
              activeOpacity={0.8}
              style={[
                s.quickChip,
                amount === String(n) && {
                  backgroundColor: '#EEF9F1',
                  borderColor: colors.accent,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: amount === String(n) ? colors.accent : colors.textPrimary,
                }}
              >
                {formatINR(n)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.amountInputRow}>
          <Text style={s.amountRupee}>₹</Text>
          <TextInput
            accessibilityLabel="Custom amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={s.amountInput}
            placeholder="500"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Button
            title={`Add ${formatINR(Number(amount) || 0)}`}
            loading={loading}
            onPress={handleAddMoney}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const s = StyleSheet.create({
  balanceCard: {
    borderRadius: 26,
    padding: 22,
    ...shadows.card,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A7E3B5',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.6,
  },
  passPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  passPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 16,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 11,
    color: '#C2EBD0',
    fontWeight: '600',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  topupBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
  },
  topupBtnText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  perkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 14,
    ...shadows.soft,
  },
  perkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  perkDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCF9',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  amountRupee: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
