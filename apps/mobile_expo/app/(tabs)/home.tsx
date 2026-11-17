import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Leaf,
  MapPin,
  ChevronDown,
  Wallet,
  Search,
  SlidersHorizontal,
  Calendar,
  Zap,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  KeyRound,
  Tag,
  PartyPopper,
  Crown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, styles, CookCard } from '../../src/components/ui';
import { useUserStore, useWalletStore, useBookingStore } from '../../src/store';
import { services } from '../../src/data/services';
import { cooks } from '../../src/data/cooks';
import { isInstantAvailable } from '../../src/lib/scheduling';
import { formatINR } from '../../src/lib/pricing';
import { colors, shadows, fonts } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40;

const PROMO_BANNERS = [
  {
    id: 'b1',
    badge: '✦ NEW USER SPECIAL',
    title: 'Flat 40% OFF\nyour first 3 meals',
    sub: 'Verified cooks arrive at your home from ₹77/hr. All ingredients cooked fresh.',
    code: 'FIRSTEAT',
    cta: 'Claim 40% OFF',
    colors: ['#153A27', '#225C3C'] as const,
    icon: Tag,
    action: '/book/schedule',
  },
  {
    id: 'b2',
    badge: '🎉 WEEKEND SPECIAL',
    title: 'Private Party Chef\nfor 4–15 Guests',
    sub: 'Starters, gourmet main course & fresh rotis served hot for your family & friends.',
    code: 'PARTY500',
    cta: 'Book Party Chef',
    colors: ['#1E293B', '#334155'] as const,
    icon: PartyPopper,
    action: '/book/schedule',
  },
  {
    id: 'b3',
    badge: '✨ ZAPEAT PASS ACTIVE',
    title: 'Unlimited Cook Hours\nat just ₹116/hr',
    sub: 'Zero platform fees, free instant cancellation & priority cook dispatch.',
    code: 'PASS10',
    cta: 'View Pass Perks',
    colors: ['#064E3B', '#047857'] as const,
    icon: Crown,
    action: '/coupons',
  },
];

export default function Home() {
  const addresses = useUserStore((s) => s.addresses);
  const balance = useWalletStore((s) => s.cashBalance);
  const setDraft = useBookingStore((s) => s.setDraft);
  const address = addresses.find((a) => a.isSelected) || addresses[0];
  const instantInfo = isInstantAvailable();

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    if (slide !== activeBannerIndex && slide >= 0 && slide < PROMO_BANNERS.length) {
      setActiveBannerIndex(slide);
    }
  };

  const handleClaimOffer = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push(action as any);
  };

  return (
    <Screen safeAreaBg="#FFFFFF">
      {/* ─── Top Brand & Location Bar (Uber / Snabbit Clean Bar) ─────────────── */}
      <View style={localStyles.topBar}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View style={localStyles.logoBadge}>
              <Leaf size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={localStyles.brandName}>ZAPEAT</Text>
            <View style={localStyles.livePill}>
              <View style={localStyles.liveDot} />
              <Text style={localStyles.livePillText}>BLR</Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Change delivery kitchen address"
            onPress={() => router.push('/book/address')}
            style={localStyles.locationPicker}
            activeOpacity={0.7}
          >
            <MapPin size={12} color={colors.accent} strokeWidth={2.4} />
            <Text style={localStyles.locationText} numberOfLines={1}>
              {address?.label || 'Select address'} · {address?.line?.split(',')[0] || 'Koramangala, Bengaluru'}
            </Text>
            <ChevronDown size={12} color={colors.textSecondary} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Wallet & Quick Action */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View wallet balance"
            onPress={() => router.push('/wallet')}
            style={localStyles.pillButton}
            activeOpacity={0.75}
          >
            <Wallet size={13} color={colors.accent} strokeWidth={2.2} />
            <Text style={localStyles.pillButtonText}>{formatINR(balance)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Uber / Snabbit Instant Search Bar ───────────────────────────────── */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Search home cooks, cuisines, or dishes"
        onPress={() => router.push('/account/cooks')}
        activeOpacity={0.85}
        style={localStyles.searchBarBtn}
      >
        <Search size={16} color={colors.accent} strokeWidth={2.2} />
        <Text style={localStyles.searchPlaceholder}>
          Search cooks, cuisines, or dishes...
        </Text>
        <View style={localStyles.searchFilterPill}>
          <SlidersHorizontal size={13} color={colors.accent} strokeWidth={2.2} />
        </View>
      </TouchableOpacity>

      {/* ─── Uber / Snabbit Promotional Carousel Banners ─────────────────────── */}
      <View style={{ marginBottom: 18 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleBannerScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={BANNER_WIDTH + 12}
          snapToAlignment="center"
          contentContainerStyle={{ gap: 12, paddingVertical: 2 }}
        >
          {PROMO_BANNERS.map((banner) => {
            const Icon = banner.icon;
            return (
              <TouchableOpacity
                key={banner.id}
                activeOpacity={0.92}
                onPress={() => handleClaimOffer(banner.action)}
                style={[localStyles.promoCard, { width: BANNER_WIDTH }]}
              >
                <LinearGradient
                  colors={[banner.colors[0], banner.colors[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={localStyles.promoGradient}
                >
                  <View style={localStyles.promoTopRow}>
                    <View style={localStyles.promoBadge}>
                      <Text style={localStyles.promoBadgeText}>{banner.badge}</Text>
                    </View>
                    <View style={localStyles.codePill}>
                      <Icon size={12} color="#FFFFFF" strokeWidth={2.4} />
                      <Text style={localStyles.codePillText}>{banner.code}</Text>
                    </View>
                  </View>

                  <Text style={localStyles.promoTitle}>{banner.title}</Text>
                  <Text style={localStyles.promoSub}>{banner.sub}</Text>

                  <View style={localStyles.promoFooter}>
                    <View style={localStyles.promoCtaBtn}>
                      <Text style={localStyles.promoCtaText}>{banner.cta}</Text>
                      <ArrowRight size={13} color={colors.accent} strokeWidth={2.4} />
                    </View>
                    <Text style={localStyles.promoFinePrint}>Instant Booking · Verified Chefs</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Carousel Pagination Dots */}
        <View style={localStyles.paginationRow}>
          {PROMO_BANNERS.map((_, i) => (
            <View
              key={i}
              style={[
                localStyles.dot,
                activeBannerIndex === i ? localStyles.dotActive : localStyles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* ─── Snabbit 2-Choice Quick Booking Cuts ──────────────────────────────── */}
      <View style={{ marginBottom: 18 }}>
        <View style={localStyles.bookingGrid}>
          {/* Schedule Cut */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Schedule cook for later"
            onPress={() => router.push('/book/schedule')}
            activeOpacity={0.82}
            style={[localStyles.bookingCard, { borderColor: 'rgba(63, 163, 102, 0.16)' }]}
          >
            <View style={[localStyles.bookingIconWrap, { backgroundColor: '#EEF9F1' }]}>
              <Calendar size={22} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={localStyles.bookingCardTitle}>Schedule</Text>
                <View style={localStyles.popPill}>
                  <Text style={localStyles.popPillText}>POPULAR</Text>
                </View>
              </View>
              <Text style={localStyles.bookingCardSub}>From tomorrow · 30 days ahead · Pick cook</Text>
            </View>
            <View style={localStyles.arrowCircle}>
              <ArrowRight size={14} color={colors.accent} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          {/* Instant Cut */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Instant cook booking"
            onPress={() => router.push('/book/instant')}
            activeOpacity={0.82}
            style={[localStyles.bookingCard, { borderColor: 'rgba(245, 158, 11, 0.22)' }]}
          >
            <View style={[localStyles.bookingIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={22} color="#D97706" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={localStyles.bookingCardTitle}>Instant Cook</Text>
                <View style={localStyles.instantBadge}>
                  <Text style={localStyles.instantBadgeText}>45 MINS</Text>
                </View>
              </View>
              <Text style={localStyles.bookingCardSub}>
                {instantInfo.available ? 'Chef arrives in 45 mins · Live tracking' : 'Opens 5 AM daily across Bengaluru'}
              </Text>
            </View>
            <View style={[localStyles.arrowCircle, { backgroundColor: '#FEF3C7' }]}>
              <ArrowRight size={14} color="#D97706" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Signature Menus & Services Carousel (Uber Food Style) ──────────── */}
      <View style={{ marginBottom: 20 }}>
        <View style={[styles.row, { marginBottom: 12 }]}>
          <Text style={localStyles.sectionHeading}>What would you like cooked?</Text>
          <TouchableOpacity onPress={() => router.push('/book/schedule')}>
            <Text style={localStyles.seeAllLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4, gap: 12 }}
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
              activeOpacity={0.82}
              style={localStyles.dishSlide}
            >
              <View style={localStyles.dishEmojiCircle}>
                <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
              </View>
              <Text style={localStyles.dishTitle}>{s.label}</Text>
              <Text style={localStyles.dishDesc} numberOfLines={1}>
                {s.description}
              </Text>
              <View style={localStyles.dishTag}>
                <Text style={localStyles.dishTagText}>From ₹129</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ─── Verified Popular Cooks (Airbnb / Uber Grade) ───────────────────── */}
      <View style={{ marginBottom: 18 }}>
        <View style={[styles.row, { marginBottom: 12 }]}>
          <View>
            <Text style={localStyles.sectionHeading}>Top Rated Cooks in Bengaluru</Text>
            <Text style={localStyles.sectionSub}>Police verified · Kitchen hygiene certified</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/account/cooks')}>
            <Text style={localStyles.seeAllLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {cooks.slice(0, 3).map((c) => (
          <CookCard key={c.id} cook={c} onPress={() => router.push(`/cook/${c.id}`)} />
        ))}
      </View>

      {/* ─── Snabbit Trust & Safety Card ────────────────────────────────────── */}
      <View style={localStyles.trustCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <ShieldCheck size={18} color={colors.accent} strokeWidth={2.4} />
          <Text style={localStyles.trustHeading}>The Zapeat Guarantee</Text>
        </View>

        <View style={{ gap: 12 }}>
          <View style={localStyles.trustRow}>
            <View style={localStyles.trustIcon}>
              <Fingerprint size={15} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={localStyles.trustRowTitle}>100% Background Verified</Text>
              <Text style={localStyles.trustRowDesc}>Police background checks & Aadhaar identity verification</Text>
            </View>
          </View>

          <View style={localStyles.trustRow}>
            <View style={localStyles.trustIcon}>
              <Sparkles size={15} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={localStyles.trustRowTitle}>Hygiene & Food Safety Certified</Text>
              <Text style={localStyles.trustRowDesc}>Leaves your kitchen clean and tidies counters post cooking</Text>
            </View>
          </View>

          <View style={localStyles.trustRow}>
            <View style={localStyles.trustIcon}>
              <KeyRound size={15} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={localStyles.trustRowTitle}>Doorstep 4-Digit OTP Handshake</Text>
              <Text style={localStyles.trustRowDesc}>Cooking begins only after you verify arrival passcode</Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.brand,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  livePillText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    maxWidth: 200,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  pillButtonText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  searchBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 14,
    gap: 10,
    ...shadows.soft,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.textMuted,
  },
  searchFilterPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.soft,
  },
  promoGradient: {
    padding: 18,
    borderRadius: 24,
  },
  promoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  promoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  promoBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  codePillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  promoTitle: {
    fontFamily: fonts.brand,
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 6,
  },
  promoSub: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
    marginBottom: 14,
    maxWidth: 290,
  },
  promoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  promoCtaText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  promoFinePrint: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(21, 58, 39, 0.15)',
  },
  bookingGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  bookingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    ...shadows.soft,
  },
  bookingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCardTitle: {
    fontFamily: fonts.futura,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  bookingCardSub: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  popPill: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popPillText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  instantBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  instantBadgeText: {
    fontFamily: fonts.bold,
    color: '#D97706',
    fontSize: 9,
  },
  sectionHeading: {
    fontFamily: fonts.futura,
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  seeAllLink: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: colors.accent,
  },
  dishSlide: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    ...shadows.soft,
  },
  dishEmojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FCF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dishTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  dishDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  dishTag: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dishTagText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.accent,
  },
  trustCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
    ...shadows.soft,
  },
  trustHeading: {
    fontFamily: fonts.futura,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  trustIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustRowTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 1,
  },
  trustRowDesc: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
