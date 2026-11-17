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
import { useAuthStore } from '../../src/store';

// Format raw digits as: 98765 43210
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sendOtp = useAuthStore((s) => s.sendOtp);
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
        'Unable to send OTP. Please check connection.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      shake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#EEF9F1', '#F4FBF6', '#FFFFFF']}
      style={[
        s.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.kav}
      >
        {/* Brand Header */}
        <View style={s.hero}>
          <View style={s.logoRing}>
            <Ionicons name="leaf" size={40} color={colors.accent} />
          </View>
          <View style={s.brandRow}>
            <Text style={s.appName}>ZAPEAT</Text>
            <View style={s.cityBadge}>
              <Text style={s.cityBadgeText}>BENGALURU</Text>
            </View>
          </View>
          <Text style={s.tagline}>
            Book a trusted home cook,{'\n'}cooked fresh in your kitchen.
          </Text>
        </View>

        {/* Input Card */}
        <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={s.cardTitle}>Enter your mobile number</Text>
          <Text style={s.cardSubtitle}>
            We'll send a 6-digit OTP code to verify
          </Text>

          {/* Phone Input */}
          <View style={[s.inputRow, error ? s.inputError : null]}>
            <View style={s.flag}>
              <Text style={s.flagText}>🇮🇳</Text>
              <Text style={s.countryCode}>+91</Text>
            </View>
            <View style={s.divider} />
            <TextInput
              ref={inputRef}
              accessibilityLabel="Phone number"
              keyboardType="phone-pad"
              maxLength={11}
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
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
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

          {/* Snabbit CTA Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Continue to OTP"
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.88}
            style={[s.cta, (!isValid || loading) && s.ctaDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.ctaText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            By continuing, you agree to Zapeat's{' '}
            <Text style={s.link}>Terms</Text> and <Text style={s.link}>Privacy Policy</Text>
          </Text>
        </Animated.View>

        {/* Snabbit Trust Badges */}
        <View style={s.badges}>
          {[
            { icon: 'shield-checkmark-outline', label: '100% Police Verified' },
            { icon: 'sparkles-outline', label: 'Hygiene Certified' },
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
  kav: { flex: 1, paddingHorizontal: 22, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.15)',
    ...shadows.floating,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  cityBadge: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.floating,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCF9',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 56,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FFF8F8',
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
  },
  flagText: { fontSize: 20 },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...shadows.glow,
  },
  ctaDisabled: {
    backgroundColor: colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
  },
  link: {
    color: colors.accent,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 28,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  badgeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
