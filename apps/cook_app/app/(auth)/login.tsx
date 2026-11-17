import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../src/theme';
import { useCookAuthStore } from '../../src/store';

// Format raw digits as: 98765 43210
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function CookLogin() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sendOtp = useCookAuthStore((s) => s.sendOtp);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const rawPhone = phone.replace(/\D/g, '');
  const isValid = rawPhone.length === 10 && /^[6-9]/.test(rawPhone);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function handleContinue() {
    if (!isValid) {
      setError('Please enter a valid 10-digit Indian mobile number');
      shake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(rawPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: rawPhone } });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP. Please try again.';
      setError(msg);
      shake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#D1FAE5', '#ECFDF5', '#F6FAF7']}
      style={[s.container, { paddingTop: Math.max(insets.top, 24) }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        {/* Cook Portal Branding & Hero */}
        <View style={s.hero}>
          <View style={s.logoRing}>
            <Text style={s.logoEmoji}>👨‍🍳</Text>
          </View>
          <View style={s.partnerBadge}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={s.partnerBadgeText}>Zapeat Partner</Text>
          </View>
          <Text style={s.portalTitle}>Cook Portal</Text>
          <Text style={s.tagline}>
            Join as a Zapeat Partner{'\n'}Cook fresh meals, earn on your schedule.
          </Text>
        </View>

        {/* Card */}
        <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={s.cardTitle}>Partner Mobile Login</Text>
          <Text style={s.cardSubtitle}>
            Enter your registered mobile number for instant verification
          </Text>

          {/* Phone Input Row */}
          <View style={[s.inputRow, error ? s.inputError : null]}>
            <View style={s.flag}>
              <Text style={s.flagText}>🇮🇳</Text>
              <Text style={s.countryCode}>+91</Text>
            </View>
            <View style={s.divider} />
            <TextInput
              ref={inputRef}
              accessibilityLabel="Cook mobile number"
              keyboardType="phone-pad"
              maxLength={11} // 10 digits + 1 space
              placeholder="98765 43210"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={(v) => {
                setError('');
                setPhone(formatPhone(v));
              }}
              style={s.phoneInput}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            {rawPhone.length > 0 && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear phone number"
                onPress={() => {
                  setPhone('');
                  setError('');
                  inputRef.current?.focus();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Error Message */}
          {error ? (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* CTA */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Continue to Cook OTP"
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.85}
            style={[s.cta, (!isValid || loading) && s.ctaDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.ctaText}>Continue to OTP</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            By signing in, you agree to the Zapeat Partner{' '}
            <Text style={s.link}>Code of Conduct</Text> and{' '}
            <Text style={s.link}>Payout Terms</Text>
          </Text>
        </Animated.View>

        {/* Cook Partner Trust Badges */}
        <View style={s.badges}>
          {[
            { icon: 'wallet-outline', label: 'Daily Bank Payouts' },
            { icon: 'time-outline', label: 'Flexible Work Hours' },
            { icon: 'shield-checkmark-outline', label: 'Verified Homes' },
          ].map(({ icon, label }) => (
            <View key={label} style={s.badge}>
              <Ionicons name={icon as any} size={14} color={colors.accent} />
              <Text style={s.badgeText}>{label}</Text>
            </View>
          ))}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 28 },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    ...shadows.floating,
  },
  logoEmoji: { fontSize: 44 },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    marginBottom: 6,
  },
  partnerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  portalTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    ...shadows.floating,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flagText: { fontSize: 20 },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    flex: 1,
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
    gap: 8,
    ...shadows.soft,
  },
  ctaDisabled: {
    backgroundColor: colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
