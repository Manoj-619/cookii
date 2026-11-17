import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store';

const OTP_LENGTH = 6;
const RESEND_INTERVAL = 60;

/**
 * Format raw digits into standard Indian mobile representation:
 * +91 XXXXX XXXXX
 */
function formatPhone(raw?: string): string {
  if (!raw) return '+91 —';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) {
    const main = digits.slice(-10);
    return `+91 ${main.slice(0, 5)} ${main.slice(5)}`;
  }
  return `+91 ${digits}`;
}

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const isSubmittingRef = useRef(false);

  const login = useAuthStore((s) => s.login);
  const sendOtp = useAuthStore((s) => s.sendOtp);

  const rawPhone = (phone || '').replace(/\D/g, '');
  const isComplete = otp.length === OTP_LENGTH;

  // 60-second resend countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Transient info message clearer
  useEffect(() => {
    if (!infoMessage) return;
    const timeout = setTimeout(() => setInfoMessage(''), 4000);
    return () => clearTimeout(timeout);
  }, [infoMessage]);

  // Shake animation trigger on verification failure
  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Verify OTP submission
  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const code = codeToVerify ?? otp;
      if (code.length !== OTP_LENGTH || isSubmittingRef.current) return;

      if (!rawPhone) {
        setError('Phone number is missing. Please return to login.');
        triggerShake();
        return;
      }

      isSubmittingRef.current = true;
      setLoading(true);
      setError('');

      try {
        await login(rawPhone, code);
        // After success navigate to /(tabs)/home
        router.replace('/(tabs)/home');
      } catch (err: any) {
        const rawMsg = err?.response?.data?.message || err?.message;
        const msg = Array.isArray(rawMsg)
          ? rawMsg.join(', ')
          : typeof rawMsg === 'string'
          ? rawMsg
          : 'Invalid verification code. Please check and try again.';
        setError(msg);
        triggerShake();
      } finally {
        setLoading(false);
        isSubmittingRef.current = false;
      }
    },
    [otp, rawPhone, login, triggerShake],
  );

  // Handle OTP digit entry with automatic submission on 6th digit
  const handleOtpChange = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(clean);
    if (error) setError('');

    if (clean.length === OTP_LENGTH && !loading) {
      handleVerify(clean);
    }
  };

  // Resend OTP logic
  const handleResend = async () => {
    if (timer > 0 || resending) return;

    if (!rawPhone) {
      setError('Phone number is missing. Please go back to login.');
      triggerShake();
      return;
    }

    setResending(true);
    setError('');
    setInfoMessage('');

    try {
      await sendOtp(rawPhone);
      setTimer(RESEND_INTERVAL);
      setOtp('');
      setInfoMessage('New verification code sent successfully');
      inputRef.current?.focus();
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : 'Failed to resend code. Please try again.';
      setError(msg);
      triggerShake();
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={s.screen}>
      {/* Top Header Linear Gradient area */}
      <LinearGradient
        colors={['#D1FAE5', '#ECFDF5', '#F6FAF7']}
        style={[s.headerGradient, { paddingTop: Math.max(insets.top, 20) + 8 }]}
      >
        <View style={s.navBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back to login"
            onPress={() => router.back()}
            style={s.backButton}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={s.securityBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
            <Text style={s.securityBadgeText}>Verified & Secure</Text>
          </View>
        </View>

        {/* Hero icon and heading */}
        <View style={s.hero}>
          <View style={s.iconRing}>
            <Ionicons name="lock-closed" size={32} color={colors.accent} />
          </View>
          <Text style={s.heroTitle}>Enter Verification Code</Text>
          <Text style={s.heroSubtitle}>We've sent a 6-digit OTP to</Text>

          {/* Formatted Phone number display with edit link */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Change phone number"
            onPress={() => router.back()}
            style={s.phoneChip}
            activeOpacity={0.7}
          >
            <Text style={s.phoneChipText}>{formatPhone(phone)}</Text>
            <View style={s.editIconCircle}>
              <Ionicons name="pencil" size={12} color={colors.accent} />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main interactive form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card with 22px border radius */}
          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={s.cardHeading}>Enter 6-digit OTP</Text>
            <Text style={s.cardSubheading}>
              Check your messages and type the code below
            </Text>

            {/* Test OTP Helper Badge */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Auto-fill test OTP 123456"
              activeOpacity={0.8}
              onPress={() => {
                setOtp('123456');
                handleVerify('123456');
              }}
              style={s.testOtpBadge}
            >
              <Ionicons name="flash" size={14} color={colors.accent} />
              <Text style={s.testOtpText}>
                Dev Test Code: <Text style={s.testOtpCode}>123456</Text> (Tap to fill & login)
              </Text>
            </TouchableOpacity>

            {/* 6 individual styled boxes */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={s.otpBoxWrapper}
            >
              <View style={s.otpRow}>
                {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                  const digit = otp[index] || '';
                  const isActive = isFocused && index === otp.length;
                  const isFilled = digit.length > 0;
                  const hasError = !!error;

                  return (
                    <View
                      key={index}
                      style={[
                        s.otpBox,
                        isFilled && s.otpBoxFilled,
                        isActive && s.otpBoxActive,
                        hasError && s.otpBoxError,
                      ]}
                    >
                      <Text style={[s.otpDigit, hasError && s.otpDigitError]}>
                        {digit}
                      </Text>
                      {isActive && !digit && <View style={s.activeCursor} />}
                    </View>
                  );
                })}
              </View>

              {/* Hidden TextInput handling keyboard input */}
              <TextInput
                ref={inputRef}
                accessibilityLabel="6-digit verification code"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={OTP_LENGTH}
                value={otp}
                onChangeText={handleOtpChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                style={s.hiddenInput}
                caretHidden
              />
            </TouchableOpacity>

            {/* Error Message Row */}
            {error ? (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success Info Message Row */}
            {infoMessage ? (
              <View style={s.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                <Text style={s.infoText}>{infoMessage}</Text>
              </View>
            ) : null}

            {/* Primary Submit Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Verify and continue"
              onPress={() => handleVerify()}
              disabled={!isComplete || loading}
              activeOpacity={0.85}
              style={[s.verifyButton, (!isComplete || loading) && s.verifyButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={s.verifyButtonText}>Verify & Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Resend Timer & Action */}
            <View style={s.resendContainer}>
              {timer > 0 ? (
                <View style={s.timerRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={s.timerMuted}>
                    Resend code in{' '}
                    <Text style={s.timerHighlight}>{timer}s</Text>
                  </Text>
                </View>
              ) : (
                <View style={s.resendActionRow}>
                  <Text style={s.resendMuted}>Didn't receive the OTP?</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Resend OTP"
                    onPress={handleResend}
                    disabled={resending}
                    style={s.resendButton}
                    activeOpacity={0.7}
                  >
                    {resending ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <View style={s.resendButtonContent}>
                        <Ionicons name="refresh" size={14} color={colors.accent} />
                        <Text style={s.resendActiveText}>Resend OTP</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Hint and Security Trust Footer */}
          <View style={s.footerInfo}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={s.footerInfoText}>
              Code automatically submits once all 6 digits are typed.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
    ...shadows.soft,
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  hero: {
    alignItems: 'center',
    marginTop: 4,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadows.floating,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  phoneChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  editIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.floating,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardSubheading: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  testOtpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF9F1',
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.25)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  testOtpText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  testOtpCode: {
    color: colors.accent,
    fontWeight: '900',
    letterSpacing: 1,
  },
  otpBoxWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  otpBox: {
    flex: 1,
    maxWidth: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  otpBoxActive: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: '#F0FAF4',
  },
  otpBoxFilled: {
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
  },
  otpBoxError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  otpDigitError: {
    color: colors.danger,
  },
  activeCursor: {
    position: 'absolute',
    bottom: 10,
    width: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    fontSize: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  infoText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginTop: 4,
    ...shadows.soft,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  resendContainer: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerMuted: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timerHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  resendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  resendMuted: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendActiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 12,
  },
  footerInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
