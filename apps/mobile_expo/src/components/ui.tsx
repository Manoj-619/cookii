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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../theme';
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
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.05)',
    ...shadows.soft,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  muted: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: -0.3,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    ...shadows.soft,
  },
  buttonText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#ECFDF5',
    borderColor: colors.accent,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginVertical: 8,
  },
});

/** Safe screen with responsive top safe area insets and floating tab padding. */
export function Screen({
  children,
  scroll = true,
  withTabs = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  withTabs?: boolean;
}) {
  const insets = useSafeAreaInsets();
  // Safe top padding ensuring content sits below the status bar and camera punch-hole
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 16) + 14;
  // Safe bottom padding so floating bottom tabs don't cover the lowest elements
  const bottomPadding = withTabs
    ? Math.max(insets.bottom + 95, 115)
    : Math.max(insets.bottom + 28, 36);

  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding, paddingBottom: bottomPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        styles.content,
        { paddingTop: topPadding, paddingBottom: bottomPadding },
      ]}
    >
      {children}
    </View>
  );
}

/** Page header with modern floating rounded back button. */
export function Header({ title }: { title: string }) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
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
        activeOpacity={0.85}
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
            backgroundColor: '#ECFDF5',
            borderWidth: 1.5,
            borderColor: colors.accent,
            elevation: 0,
            shadowOpacity: 0,
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
              secondary && { color: colors.accent, fontWeight: '700' },
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/** Tappable selection chip. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text
        style={{
          color: selected ? colors.accent : colors.textPrimary,
          fontWeight: selected ? '700' : '500',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Cook initials avatar with distinct badge styling. */
export function Avatar({ cook, size = 54 }: { cook: Cook; size?: number }) {
  return (
    <View
      style={{
        height: size,
        width: size,
        borderRadius: size / 2,
        backgroundColor: cook.avatarColor || '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        ...shadows.soft,
      }}
    >
      <Text
        style={{
          fontSize: size * 0.34,
          fontWeight: '800',
          color: colors.accent,
        }}
      >
        {cook.initials}
      </Text>
    </View>
  );
}

/** Cook listing card with clean typography and badges. */
export function CookCard({ cook, onPress }: { cook: Cook; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`View ${cook.name}`}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, styles.row]}
    >
      <Avatar cook={cook} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.body, { fontWeight: '700', fontSize: 16 }]}>
            {cook.name}
          </Text>
          <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
        </View>
        <Text style={[styles.muted, { marginTop: 2 }]}>
          {cook.cuisines.join(' • ')}
        </Text>
        <Text style={[styles.muted, { marginTop: 4, fontWeight: '600', color: colors.textPrimary }]}>
          ⭐ {cook.rating} <Text style={{ fontWeight: '400', color: colors.textSecondary }}>({cook.totalBookings} bookings)</Text>
        </Text>
      </View>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#F0FDF4',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.accent} />
      </View>
    </TouchableOpacity>
  );
}

/** Booking status badge. */
export function StatusChip({ status }: { status: Booking['status'] }) {
  const isCancelled = status === 'cancelled';
  return (
    <View
      style={{
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: isCancelled ? colors.dangerBg : colors.successBg,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: isCancelled ? colors.danger : colors.success,
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'capitalize',
        }}
      >
        {status}
      </Text>
    </View>
  );
}

/** Booking summary card with elevated styling. */
export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Booking ${booking.id}`}
      onPress={() => router.push(`/bookings/${booking.id}`)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={[styles.body, { fontWeight: '700', fontSize: 16 }]}>
          {booking.cookName}
        </Text>
        <StatusChip status={booking.status} />
      </View>
      <Text style={[styles.muted, { marginTop: 10, fontSize: 14 }]}>
        📅 {booking.date} · ⏰ {booking.startTime} ({booking.durationMinutes} min)
      </Text>
      <View
        style={[
          styles.row,
          {
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.muted, { fontSize: 12, fontWeight: '600' }]}>
          #{booking.id}
        </Text>
        <Text style={[styles.heading, { marginBottom: 0, color: colors.accent }]}>
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
        accessibilityRole="button"
        accessibilityLabel="Dismiss sheet"
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: '#D1DDD6',
              alignSelf: 'center',
              marginBottom: 18,
            }}
          />
          <Text style={[styles.heading, { fontSize: 20, marginBottom: 18 }]}>
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
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        ...shadows.floating,
      }}
    >
      <Ionicons name="information-circle" size={20} color={colors.primary} />
      <Text style={{ color: 'white', fontWeight: '600', fontSize: 14, flex: 1 }}>
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
        <Text style={[styles.body, { fontWeight: '700', flex: 1 }]}>
          {question}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.accent}
        />
      </View>
      {open && (
        <Text
          style={[
            styles.muted,
            { marginTop: 12, lineHeight: 20, color: colors.textSecondary },
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

/** Editable text field with clean focus borders. */
export function Field({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      accessibilityLabel={placeholder}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
    />
  );
}
