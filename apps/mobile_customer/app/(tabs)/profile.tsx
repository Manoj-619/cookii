import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../src/theme';
import { useAuthStore, useUserStore, useWalletStore, useBookingStore } from '../../src/store';
import { formatINR } from '../../src/lib/pricing';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useUserStore();
  const wallet = useWalletStore((s) => s.cashBalance);
  const bookings = useBookingStore((s) => s.bookings);
  const auth = useAuthStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const handleOpenEdit = () => {
    setEditedName(user.name);
    setIsEditModalVisible(true);
  };

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter your name.');
      return;
    }
    user.setName(trimmed);
    setIsEditModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Zapeat account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            auth.logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const androidStatusBar = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, androidStatusBar) : insets.top;
  const topPadding = topInset + 14;
  const bottomPadding = Math.max(insets.bottom + 90, 110);

  const displayPhone = auth.phone || '+91 98765 43210';

  return (
    <View style={screenStyles.container}>
      {/* ─── Top Safe Area Edge Shield (Solid White) ─────────────────────────── */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topInset,
          backgroundColor: '#FFFFFF',
          zIndex: 9999,
          borderBottomWidth: Platform.OS === 'android' ? 0.5 : 0,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        }}
      />
      <ScrollView
        contentContainerStyle={[
          screenStyles.scrollContent,
          { paddingTop: topPadding, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <View style={screenStyles.header}>
          <Text style={screenStyles.pageTitle}>Profile</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
            onPress={handleOpenEdit}
            style={screenStyles.headerEditBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit profile name"
          onPress={handleOpenEdit}
          activeOpacity={0.9}
          style={screenStyles.userCard}
        >
          <View style={screenStyles.avatarWrapper}>
            <LinearGradient
              colors={[colors.accent, '#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={screenStyles.avatarGradient}
            >
              <Text style={screenStyles.avatarInitials}>
                {user.avatarInitials || 'CK'}
              </Text>
            </LinearGradient>
            <View style={screenStyles.avatarBadge}>
              <Ionicons name="pencil" size={12} color="#FFFFFF" />
            </View>
          </View>

          <View style={screenStyles.userInfoText}>
            <View style={screenStyles.userNameRow}>
              <Text style={screenStyles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
            </View>
            <View style={screenStyles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={screenStyles.userPhone}>{displayPhone}</Text>
            </View>
          </View>

          <View style={screenStyles.chevronCircle}>
            <Ionicons name="chevron-forward" size={18} color={colors.accent} />
          </View>
        </TouchableOpacity>

        {/* Zapeat Pass Banner */}
        <View style={passStyles.container}>
          <LinearGradient
            colors={['#064E3B', '#047857', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={passStyles.gradient}
          >
            <View style={passStyles.topRow}>
              <View style={passStyles.badgePill}>
                <Ionicons name="sparkles" size={12} color="#FDE047" />
                <Text style={passStyles.badgeText}>ZAPEAT PASS ACTIVE</Text>
              </View>
              <View style={passStyles.validPill}>
                <Text style={passStyles.validText}>Valid till Dec 2026</Text>
              </View>
            </View>

            <Text style={passStyles.heading}>10% OFF on all bookings</Text>
            <Text style={passStyles.subheading}>
              Zero surge pricing • Priority cook dispatch • VIP concierge
            </Text>

            <View style={passStyles.savingsRow}>
              <View style={passStyles.savingsBox}>
                <Text style={passStyles.savingsLabel}>Lifetime Savings</Text>
                <Text style={passStyles.savingsAmount}>₹2,067</Text>
              </View>
              <View style={passStyles.perkBox}>
                <Ionicons name="shield-checkmark" size={16} color="#A7F3D0" />
                <Text style={passStyles.perkText}>100% Hygiene Assured</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Section Heading: My Account */}
        <Text style={screenStyles.sectionHeading}>My Account</Text>

        <View style={menuStyles.menuGroup}>
          {/* My Bookings */}
          <MenuRowItem
            icon="calendar"
            iconColor="#059669"
            iconBg="#ECFDF5"
            label="My Bookings"
            badge={`${bookings.length}`}
            onPress={() => router.push('/(tabs)/bookings')}
          />

          <View style={menuStyles.divider} />

          {/* My Wallet */}
          <MenuRowItem
            icon="wallet"
            iconColor="#2563EB"
            iconBg="#EFF6FF"
            label="My Wallet"
            value={formatINR(wallet)}
            valueColor={colors.accent}
            onPress={() => router.push('/wallet')}
          />

          <View style={menuStyles.divider} />

          {/* Offers & Coupons */}
          <MenuRowItem
            icon="gift"
            iconColor="#D97706"
            iconBg="#FFFBEB"
            label="Offers & Coupons"
            badge="2 active"
            badgeColor="#D97706"
            badgeBg="#FEF3C7"
            onPress={() => router.push('/coupons')}
          />

          <View style={menuStyles.divider} />

          {/* Favourite Cooks */}
          <MenuRowItem
            icon="heart"
            iconColor="#E11D48"
            iconBg="#FFF1F2"
            label="Favourite Cooks"
            badge={`${user.favoriteCookIds.length}`}
            onPress={() => router.push('/favorites')}
          />

          <View style={menuStyles.divider} />

          {/* Saved Addresses */}
          <MenuRowItem
            icon="location"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            label="Saved Addresses"
            badge={`${user.addresses.length}`}
            onPress={() => router.push('/account/addresses')}
          />

          <View style={menuStyles.divider} />

          {/* Help & Support */}
          <MenuRowItem
            icon="help-circle"
            iconColor="#0D9488"
            iconBg="#F0FDFA"
            label="Help & Support"
            onPress={() => router.push('/help')}
          />

          <View style={menuStyles.divider} />

          {/* Account Settings */}
          <MenuRowItem
            icon="settings"
            iconColor="#475569"
            iconBg="#F1F5F9"
            label="Account Settings"
            onPress={() => router.push('/account/manage')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Log Out"
          onPress={handleLogout}
          activeOpacity={0.8}
          style={screenStyles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={screenStyles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version Info */}
        <View style={screenStyles.versionBox}>
          <Text style={screenStyles.versionText}>Zapeat v1.0.0 (Production Build)</Text>
          <Text style={screenStyles.subVersionText}>
            Cooked with ❤️ for Bengaluru kitchens
          </Text>
        </View>
      </ScrollView>

      {/* Edit Name Bottom Sheet Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close edit modal"
          activeOpacity={1}
          onPress={() => setIsEditModalVisible(false)}
          style={modalStyles.backdrop}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              modalStyles.sheet,
              { paddingBottom: Math.max(insets.bottom + 20, 32) },
            ]}
          >
            {/* Sheet Handle */}
            <View style={modalStyles.handle} />

            <View style={modalStyles.sheetHeader}>
              <Text style={modalStyles.sheetTitle}>Edit Your Name</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={modalStyles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.sheetDesc}>
              This is how your name will appear to cooks and in your booking receipts.
            </Text>

            <View style={modalStyles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.accent}
                style={modalStyles.inputIcon}
              />
              <TextInput
                accessibilityLabel="Your full name"
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                autoFocus
                style={modalStyles.textInput}
              />
              {editedName.length > 0 && (
                <TouchableOpacity onPress={() => setEditedName('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
              disabled={!editedName.trim()}
              onPress={handleSaveName}
              style={[
                modalStyles.saveBtn,
                !editedName.trim() && modalStyles.saveBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Sub-Component: Menu Row Item ─────────────────────────────────────────────

interface MenuRowItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  value?: string;
  valueColor?: string;
  onPress: () => void;
}

function MenuRowItem({
  icon,
  iconColor,
  iconBg,
  label,
  badge,
  badgeColor = colors.accent,
  badgeBg = '#ECFDF5',
  value,
  valueColor = colors.textPrimary,
  onPress,
}: MenuRowItemProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      activeOpacity={0.7}
      style={menuStyles.rowItem}
    >
      <View style={[menuStyles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <Text style={menuStyles.label}>{label}</Text>

      <View style={menuStyles.rightContainer}>
        {badge && (
          <View style={[menuStyles.badgeBox, { backgroundColor: badgeBg }]}>
            <Text style={[menuStyles.badgeText, { color: badgeColor }]}>
              {badge}
            </Text>
          </View>
        )}

        {value && (
          <Text style={[menuStyles.valueText, { color: valueColor }]}>
            {value}
          </Text>
        )}

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
          style={{ marginLeft: 6 }}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Stylesheets ──────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  headerEditBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfoText: {
    flex: 1,
    marginLeft: 16,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  userPhone: {
    fontSize: 13.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 20,
    ...shadows.soft,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  versionBox: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subVersionText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },
});

const passStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.card,
  },
  gradient: {
    padding: 20,
    borderRadius: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  validPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  validText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D1FAE5',
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 12.5,
    color: '#D1FAE5',
    lineHeight: 18,
    marginBottom: 16,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  savingsBox: {},
  savingsLabel: {
    fontSize: 11,
    color: '#D1FAE5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  savingsAmount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  perkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

const menuStyles = StyleSheet.create({
  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 14,
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(31, 58, 46, 0.05)',
    marginLeft: 52,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    ...shadows.floating,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1DDD6',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDesc: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  saveBtnDisabled: {
    backgroundColor: colors.disabled,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
