import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows } from '../../src/theme';
import { useCookAuthStore, useCookStore } from '../../src/store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const profile = useCookStore((s) => s.profile);
  const rating = useCookStore((s) => s.rating);
  const jobsCompleted = useCookStore((s) => s.jobsCompleted);
  const logout = useCookAuthStore((s) => s.logout);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Sign Out', 'Are you sure you want to log out of Zapeat Partner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleNavigate = (title: string) => {
    Haptics.selectionAsync().catch(() => {});
    Alert.alert(title, `Managing ${title} is available in Zapeat Partner v1.0.`);
  };

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: 110, // room for floating tab bar
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.pageTitle}>Partner Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatarRow}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarText}>{profile.avatarInitials}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{profile.name}</Text>
              <Text style={s.profilePhone}>{profile.phone}</Text>

              {/* KYC Status Badge */}
              <View
                style={[
                  s.kycBadge,
                  profile.kycStatus === 'VERIFIED' && s.kycVerified,
                  profile.kycStatus === 'PENDING' && s.kycPending,
                  profile.kycStatus === 'UNDER_REVIEW' && s.kycReview,
                ]}
              >
                <Ionicons
                  name={
                    profile.kycStatus === 'VERIFIED'
                      ? 'shield-checkmark'
                      : 'hourglass-outline'
                  }
                  size={12}
                  color={
                    profile.kycStatus === 'VERIFIED'
                      ? colors.accent
                      : profile.kycStatus === 'PENDING'
                      ? colors.warning
                      : '#2563EB'
                  }
                />
                <Text
                  style={[
                    s.kycBadgeText,
                    profile.kycStatus === 'VERIFIED' && s.kycTextVerified,
                    profile.kycStatus === 'PENDING' && s.kycTextPending,
                    profile.kycStatus === 'UNDER_REVIEW' && s.kycTextReview,
                  ]}
                >
                  {profile.kycStatus === 'VERIFIED'
                    ? 'KYC Verified Partner'
                    : profile.kycStatus === 'UNDER_REVIEW'
                    ? 'KYC Under Review'
                    : 'KYC Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={s.metricStrip}>
            <View style={s.metricItem}>
              <Text style={s.metricValue}>★ {rating}</Text>
              <Text style={s.metricLabel}>Rating</Text>
            </View>
            <View style={s.metricDivider} />
            <View style={s.metricItem}>
              <Text style={s.metricValue}>{jobsCompleted}</Text>
              <Text style={s.metricLabel}>Total Bookings</Text>
            </View>
            <View style={s.metricDivider} />
            <View style={s.metricItem}>
              <Text style={s.metricValue}>{profile.experienceYears} Yrs</Text>
              <Text style={s.metricLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Cuisines & Specialties */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Cuisines Served</Text>
          <View style={s.chipWrap}>
            {profile.cuisines.map((cuisine) => (
              <View key={cuisine} style={s.chip}>
                <Ionicons name="restaurant-outline" size={13} color={colors.accent} />
                <Text style={s.chipText}>{cuisine}</Text>
              </View>
            ))}
          </View>

          <View style={s.innerDivider} />

          <Text style={s.sectionTitle}>Languages Spoken</Text>
          <View style={s.chipWrap}>
            {profile.languages.map((lang) => (
              <View key={lang} style={s.chip}>
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.accent} />
                <Text style={s.chipText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Links */}
        <View style={s.menuCard}>
          {[
            {
              icon: 'business-outline',
              title: 'Bank Account & Payout Details',
              sub: `${profile.bankAccount.bankName} (${profile.bankAccount.accountNumberMasked})`,
              action: () => handleNavigate('Bank Account & Payouts'),
            },
            {
              icon: 'document-text-outline',
              title: 'Documents & Certifications',
              sub: 'Aadhaar Card, Food Safety Certificate',
              action: () => handleNavigate('Documents & Certifications'),
            },
            {
              icon: 'time-outline',
              title: 'Work Hours & Availability',
              sub: 'Manage working areas and active days',
              action: () => router.push('/(tabs)/schedule'),
            },
            {
              icon: 'help-circle-outline',
              title: 'Partner Support & Helpdesk',
              sub: '24/7 cook safety and booking support',
              action: () => handleNavigate('Helpdesk'),
            },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.menuItem, idx > 0 && s.menuItemBorder]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={s.menuIconBox}>
                <Ionicons name={item.icon as any} size={20} color={colors.accent} />
              </View>
              <View style={s.menuTextCol}>
                <Text style={s.menuTitle}>{item.title}</Text>
                <Text style={s.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={s.logoutText}>Sign Out of Partner Account</Text>
        </TouchableOpacity>

        <Text style={s.appVersion}>Zapeat Partner v1.0.0 (Production Build)</Text>
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
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profilePhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  kycVerified: {
    backgroundColor: '#ECFDF5',
  },
  kycPending: {
    backgroundColor: '#FFFBEB',
  },
  kycReview: {
    backgroundColor: '#EFF6FF',
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  kycTextVerified: {
    color: colors.accent,
  },
  kycTextPending: {
    color: colors.warning,
  },
  kycTextReview: {
    color: '#2563EB',
  },
  metricStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: 14,
    paddingVertical: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  innerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.06)',
    ...shadows.soft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  appVersion: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
});
