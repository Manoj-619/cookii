import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen, styles, CookCard } from '../../src/components/ui';
import { useUserStore, useWalletStore, useBookingStore } from '../../src/store';
import { services } from '../../src/data/services';
import { cooks } from '../../src/data/cooks';
import { isInstantAvailable } from '../../src/lib/scheduling';
import { formatINR } from '../../src/lib/pricing';
import { colors, shadows } from '../../src/theme';

export default function Home() {
  const addresses = useUserStore((s) => s.addresses);
  const balance = useWalletStore((s) => s.cashBalance);
  const setDraft = useBookingStore((s) => s.setDraft);
  const address = addresses.find((a) => a.isSelected) || addresses[0];
  const instantInfo = isInstantAvailable();

  return (
    <Screen>
      {/* Top Location and Quick Actions Bar */}
      <View style={[styles.row, { marginBottom: 20 }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Change address"
          onPress={() => router.push('/book/address')}
          style={{ flex: 1, marginRight: 12 }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location" size={18} color={colors.accent} />
            <Text style={[styles.heading, { marginBottom: 0, fontSize: 16 }]} numberOfLines={1}>
              {address?.label || 'Select address'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </View>
          <Text style={[styles.muted, { marginTop: 2 }]} numberOfLines={1}>
            {address?.line || 'Set your Bengaluru kitchen location'}
          </Text>
        </TouchableOpacity>

        {/* Wallet & Offers Badges */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View wallet"
            onPress={() => router.push('/wallet')}
            style={localStyles.badgeButton}
            activeOpacity={0.75}
          >
            <Ionicons name="wallet-outline" size={15} color={colors.accent} />
            <Text style={{ fontWeight: '700', fontSize: 13, color: colors.textPrimary }}>
              {formatINR(balance)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View coupons"
            onPress={() => router.push('/coupons')}
            style={[localStyles.badgeButton, { paddingHorizontal: 10 }]}
            activeOpacity={0.75}
          >
            <Ionicons name="gift-outline" size={17} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Banner */}
      <LinearGradient
        colors={['#D1FAE5', '#F0FDF4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, localStyles.heroCard]}
      >
        <View style={localStyles.heroBadge}>
          <Text style={localStyles.heroBadgeText}>🌿 BENGALURU FRESH</Text>
        </View>
        <Text style={[styles.title, { fontSize: 24, marginTop: 10, maxWidth: 220 }]}>
          One cook that cooks it all
        </Text>
        <Text style={[styles.muted, { marginTop: 6, maxWidth: 220, fontSize: 13 }]}>
          Verified home cook at your kitchen doorstep in 45 mins.
        </Text>
        <Text style={localStyles.heroEmoji}>👩‍🍳</Text>
      </LinearGradient>

      {/* Booking Mode Options */}
      <View style={{ marginBottom: 22 }}>
        <Text style={[styles.heading, { fontSize: 17, marginBottom: 10 }]}>Book a Cook</Text>
        <View style={[styles.row, { gap: 12 }]}>
          {/* Schedule Card */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Schedule cook for later"
            onPress={() => router.push('/book/schedule')}
            activeOpacity={0.8}
            style={[styles.card, localStyles.actionCard]}
          >
            <View style={[localStyles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Text style={{ fontSize: 26 }}>📅</Text>
            </View>
            <Text style={[styles.heading, { marginTop: 10, marginBottom: 2, fontSize: 16 }]}>
              Schedule
            </Text>
            <Text style={styles.muted}>From tomorrow</Text>
          </TouchableOpacity>

          {/* Instant Card */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Instant cook booking"
            onPress={() => router.push('/book/instant')}
            activeOpacity={0.8}
            style={[styles.card, localStyles.actionCard]}
          >
            <View style={[localStyles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ fontSize: 26 }}>⚡</Text>
            </View>
            <Text style={[styles.heading, { marginTop: 10, marginBottom: 2, fontSize: 16 }]}>
              Instant
            </Text>
            <Text style={[styles.muted, instantInfo.available && { color: colors.accent, fontWeight: '600' }]}>
              {instantInfo.available ? 'Ready in 45m' : 'Opens 5 AM'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cookii Pass Membership Banner */}
      <TouchableOpacity
        onPress={() => router.push('/coupons')}
        activeOpacity={0.85}
        style={[styles.card, localStyles.passCard]}
      >
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.heading, { marginBottom: 0, fontSize: 16 }]}>
                ✨ Cookii Pass Active
              </Text>
              <View style={localStyles.pillSmall}>
                <Text style={localStyles.pillSmallText}>10% OFF</Text>
              </View>
            </View>
            <Text style={[styles.muted, { marginTop: 4 }]}>
              Saved ₹2,067 from 47 bookings · Valid till 27 Nov
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </View>
      </TouchableOpacity>

      {/* Meal Services Carousel */}
      <View style={{ marginBottom: 20 }}>
        <View style={[styles.row, { marginBottom: 12 }]}>
          <Text style={[styles.heading, { marginBottom: 0, fontSize: 17 }]}>
            What do you need cooked?
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {services.map((s) => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Select ${s.label}`}
              key={s.id}
              onPress={() => {
                setDraft({ mealTypes: [s.id] });
                router.push('/book/schedule');
              }}
              activeOpacity={0.8}
              style={[styles.card, localStyles.serviceCard]}
            >
              <Text style={{ fontSize: 32 }}>{s.emoji}</Text>
              <Text style={[styles.body, { fontWeight: '700', marginTop: 10, fontSize: 15 }]}>
                {s.label}
              </Text>
              <Text style={[styles.muted, { fontSize: 12, marginTop: 2 }]} numberOfLines={1}>
                {s.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Top Verified Cooks Section */}
      <View style={{ marginBottom: 20 }}>
        <View style={[styles.row, { marginBottom: 12 }]}>
          <Text style={[styles.heading, { marginBottom: 0, fontSize: 17 }]}>
            Popular Cooks Nearby
          </Text>
          <TouchableOpacity onPress={() => router.push('/account/cooks')}>
            <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>
              View all
            </Text>
          </TouchableOpacity>
        </View>
        {cooks.slice(0, 3).map((c) => (
          <CookCard key={c.id} cook={c} onPress={() => router.push(`/cook/${c.id}`)} />
        ))}
      </View>

      {/* Safety & Trust Verification Card */}
      <View style={[styles.card, { padding: 18, marginBottom: 28 }]}>
        <Text style={[styles.heading, { fontSize: 16, marginBottom: 12 }]}>
          🛡️ The Cookii Promise
        </Text>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
            <Text style={styles.body}>100% Background verified with police check</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
            <Text style={styles.body}>Hygiene and food handling certified</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text style={styles.body}>Rated 4.8+ by Bengaluru families</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  badgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31, 58, 46, 0.08)',
    ...shadows.soft,
  },
  heroCard: {
    minHeight: 180,
    justifyContent: 'center',
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroEmoji: {
    fontSize: 64,
    position: 'absolute',
    right: 12,
    bottom: 12,
    opacity: 0.95,
  },
  actionCard: {
    flex: 1,
    minHeight: 128,
    padding: 16,
    marginBottom: 0,
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 22,
  },
  pillSmall: {
    backgroundColor: colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillSmallText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  serviceCard: {
    width: 136,
    marginRight: 12,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 0,
  },
});
