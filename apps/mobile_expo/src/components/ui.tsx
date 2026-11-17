import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
} from 'lucide-react-native';

import { colors, shadows, fonts } from '../theme';
import { Cook, Booking } from '../types';
import { formatINR } from '../lib/pricing';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...shadows.soft,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heading: {
    fontFamily: fonts.futura,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  muted: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  headerTitle: {
    fontFamily: fonts.brand,
    fontSize: 21,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...shadows.glow,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: colors.textOnAccent,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
    ...shadows.soft,
  },
  selected: {
    backgroundColor: '#EEF9F1',
    borderColor: colors.accent,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginVertical: 6,
  },
});

/** Standard safe layout wrapper with proper top & bottom edge clearances and solid white safe edge shields. */
export function Screen({
  children,
  scroll = true,
  withTabs = true,
  safeAreaBg = '#FFFFFF',
}: {
  children: React.ReactNode;
  scroll?: boolean;
  withTabs?: boolean;
  safeAreaBg?: string;
}) {
  const insets = useSafeAreaInsets();
  const androidStatusBar = RNStatusBar.currentHeight || 30;
  const topInset = Platform.OS === 'android'
    ? Math.max(insets.top, androidStatusBar)
    : insets.top;
  const bottomInset = insets.bottom;

  return (
    <View style={styles.screen}>
      {scroll ? (
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: topInset + 16,
              paddingBottom: withTabs
                ? Math.max(bottomInset + 84, 100)
                : Math.max(bottomInset + 28, 42),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.screen,
            styles.content,
            {
              paddingTop: topInset + 16,
              paddingBottom: withTabs
                ? Math.max(bottomInset + 84, 100)
                : Math.max(bottomInset + 28, 42),
            },
          ]}
        >
          {children}
        </View>
      )}

      {/* ─── Top Safe Area Edge Shield (Solid Pure White) ─────────────────────── */}
      {/* Placed AFTER ScrollView in JSX + elevation: 25 so it ALWAYS covers scrolled content on Android */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topInset + 2,
          backgroundColor: '#FFFFFF',
          zIndex: 99999,
          elevation: 25,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        }}
      />

      {/* ─── Bottom Safe Area Edge Shield (Solid Pure White) ──────────────────── */}
      {/* Placed AFTER ScrollView in JSX + elevation: 25 so it covers bottom navigation bar area */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: bottomInset > 0 ? bottomInset : (Platform.OS === 'android' ? 14 : 0),
          backgroundColor: '#FFFFFF',
          zIndex: 99999,
          elevation: 25,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 0.05)',
        }}
      />
    </View>
  );
}

/** Page header with glassmorphic rounded back button and optional subtitle/actions. */
export function Header({
  title,
  subtitle,
  rightAction,
  onBack,
}: {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack || (() => router.back())}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <ArrowLeft size={19} color={colors.textPrimary} strokeWidth={2.2} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.muted, { fontSize: 12, marginTop: 1, fontFamily: fonts.regular }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
}

/** Animated primary action with micro-scale press feedback. */
export function Button({
  title,
  onPress,
  disabled,
  loading,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={title}
        disabled={disabled || loading}
        activeOpacity={0.88}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start()
        }
        onPress={onPress}
        style={[
          styles.button,
          secondary && {
            backgroundColor: 'rgba(255, 255, 255, 0.90)',
            borderWidth: 1.2,
            borderColor: colors.border,
            ...shadows.soft,
          },
          disabled && {
            backgroundColor: colors.disabled,
            elevation: 0,
            shadowOpacity: 0,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={secondary ? colors.accent : 'white'} />
        ) : (
          <Text
            style={[
              styles.buttonText,
              secondary && { color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/** Interactive selection chip. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text
        style={{
          fontFamily: selected ? fonts.bold : fonts.semiBold,
          color: selected ? colors.accent : colors.textPrimary,
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Cook profile avatar with distinct color-wash initials. */
export function Avatar({ cook, size = 54 }: { cook: Cook; size?: number }) {
  const bg = cook.id.includes('1')
    ? '#D8F3DC'
    : cook.id.includes('2')
    ? '#FFE8D6'
    : cook.id.includes('3')
    ? '#E0AAFF'
    : cook.id.includes('4')
    ? '#BEE1E6'
    : '#FDE2E4';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        ...shadows.soft,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.brand,
          fontSize: size * 0.38,
          fontWeight: '800',
          color: colors.textPrimary,
        }}
      >
        {cook.initials}
      </Text>
    </View>
  );
}

/** Cook listing card with Airbnb-grade hospitality aesthetic and subtle glassmorphism. */
export function CookCard({
  cook,
  onPress,
  rightElement,
}: {
  cook: Cook;
  onPress: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`View ${cook.name}`}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          paddingVertical: 15,
          paddingHorizontal: 16,
          marginBottom: 12,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar cook={cook} size={52} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={[styles.body, { fontFamily: fonts.bold, fontSize: 16 }]}
              numberOfLines={1}
            >
              {cook.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                backgroundColor: '#EEF9F1',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <ShieldCheck size={11} color={colors.accent} strokeWidth={2.4} />
              <Text
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 9,
                  color: colors.accent,
                  letterSpacing: 0.5,
                }}
              >
                VERIFIED
              </Text>
            </View>
          </View>

          <Text
            style={[styles.muted, { marginTop: 2, fontSize: 12, fontFamily: fonts.medium }]}
            numberOfLines={1}
          >
            {cook.cuisines.join(' • ')}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 12,
                  color: colors.textPrimary,
                }}
              >
                {cook.rating.toFixed(1)}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              • {cook.totalBookings}+ bookings
            </Text>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              • {cook.yearsExperience}y exp
            </Text>
          </View>
        </View>

        {rightElement ? (
          <View style={{ marginLeft: 8 }}>{rightElement}</View>
        ) : (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.surfaceTint,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            <ChevronRight size={16} color={colors.accent} strokeWidth={2.2} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/** Booking status badge. */
export function StatusChip({ status }: { status: Booking['status'] }) {
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: isCancelled
          ? colors.dangerBg
          : isCompleted
          ? colors.successBg
          : '#FEF3C7',
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: fonts.bold,
          color: isCancelled
            ? colors.danger
            : isCompleted
            ? colors.accent
            : '#B45309',
          fontSize: 11,
          textTransform: 'capitalize',
        }}
      >
        {status}
      </Text>
    </View>
  );
}

/** Booking summary card with elevated subtle styling. */
export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Booking ${booking.id}`}
      onPress={() => router.push(`/bookings/${booking.id}`)}
      activeOpacity={0.82}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={[styles.body, { fontFamily: fonts.bold, fontSize: 16 }]}>
          {booking.cookName}
        </Text>
        <StatusChip status={booking.status} />
      </View>
      <Text style={[styles.muted, { marginTop: 6, fontSize: 13, fontFamily: fonts.medium }]}>
        📅 {booking.date} · ⏰ {booking.startTime} ({booking.durationMinutes} min)
      </Text>
      <View
        style={[
          styles.row,
          {
            marginTop: 12,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: 'rgba(21, 58, 39, 0.06)',
          },
        ]}
      >
        <Text style={[styles.muted, { fontSize: 12, fontFamily: fonts.bold }]}>
          #{booking.id}
        </Text>
        <Text
          style={[
            styles.heading,
            { marginBottom: 0, color: colors.accent, fontSize: 17, fontFamily: fonts.brand },
          ]}
        >
          {formatINR(booking.amountPaid)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Modern bottom sheet with drag handle and backdrop. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(20, 48, 36, 0.45)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: Math.max(insets.bottom + 20, 32),
            maxHeight: '85%',
            ...shadows.floating,
          }}
        >
          {/* Sheet Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#CBDAD1',
              alignSelf: 'center',
              marginBottom: 18,
            }}
          />
          <Text style={[styles.heading, { fontSize: 20, marginBottom: 16, fontFamily: fonts.brand }]}>
            {title}
          </Text>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/** Transient feedback toast. */
export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: Math.max(insets.top, 24) + 12,
        left: 20,
        right: 20,
        zIndex: 100,
        backgroundColor: colors.textPrimary,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        ...shadows.floating,
      }}
    >
      <Sparkles size={18} color={colors.primary} />
      <Text
        style={{
          color: 'white',
          fontFamily: fonts.semiBold,
          fontSize: 14,
          flex: 1,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

/** Disclosure accordion. */
export function Accordion({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={question}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={[styles.body, { fontFamily: fonts.bold, flex: 1 }]}>
          {question}
        </Text>
        {open ? (
          <ChevronUp size={18} color={colors.accent} strokeWidth={2.2} />
        ) : (
          <ChevronDown size={18} color={colors.accent} strokeWidth={2.2} />
        )}
      </View>
      {open && (
        <Text
          style={[
            styles.muted,
            { marginTop: 10, lineHeight: 20, color: colors.textSecondary, fontFamily: fonts.regular },
          ]}
        >
          {answer}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/** Loading placeholder skeleton. */
export function Skeleton() {
  return (
    <View
      style={[
        styles.card,
        {
          height: 84,
          backgroundColor: '#EAEFEA',
          borderColor: 'transparent',
        },
      ]}
    />
  );
}

/** Editable text field with clean focus borders and optional icon/label. */
export function Field({
  value,
  onChangeText,
  placeholder,
  label,
  icon,
  multiline = false,
}: {
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  label?: string;
  icon?: any;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: 11,
            color: colors.textSecondary,
            marginBottom: 6,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.input,
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            borderColor: focused ? colors.accent : colors.border,
            borderWidth: focused ? 1.5 : 1,
            paddingVertical: multiline ? 12 : 13,
            paddingHorizontal: 14,
            minHeight: multiline ? 88 : 48,
          },
        ]}
      >
        {icon ? (
          <View style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }}>
            {icon}
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label || placeholder}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          style={{
            flex: 1,
            fontSize: 15,
            fontFamily: fonts.medium,
            color: colors.textPrimary,
            padding: 0,
          }}
        />
      </View>
    </View>
  );
}
