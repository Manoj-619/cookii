import React, { useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Share2,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Utensils,
  MessageCircle,
  Droplets,
  KeyRound,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen, Avatar, Button } from '../../src/components/ui';
import { cooks } from '../../src/data/cooks';
import { useUserStore, useBookingStore } from '../../src/store';
import { colors, shadows, fonts } from '../../src/theme';

export default function CookProfile() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const cook = cooks.find((c) => c.id === id);
  const favoriteIds = useUserStore((s) => s.favoriteCookIds);
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);
  const setDraft = useBookingStore((s) => s.setDraft);

  const isFavorite = cook ? favoriteIds.includes(cook.id) : false;

  const handleToggleFavorite = () => {
    if (!cook) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toggleFavorite(cook.id);
  };

  const handleShare = async () => {
    if (!cook) return;
    try {
      await Share.share({
        message: `Book ${cook.name} on Zapeat! Rated ${cook.rating}★ with ${cook.totalBookings}+ bookings in Bengaluru. https://zapeat.online/cooks/${cook.id}`,
      });
    } catch {}
  };

  const handleBookCook = () => {
    if (!cook) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDraft({ cookId: cook.id });
    router.push('/book/schedule');
  };

  if (!cook) {
    return (
      <Screen>
        <View style={s.notFoundContainer}>
          <Text style={s.notFoundEmoji}>👨‍🍳</Text>
          <Text style={s.notFoundTitle}>Cook Not Found</Text>
          <Text style={s.notFoundSub}>This cook profile is no longer available.</Text>
          <Button title="Browse Other Cooks" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const sampleDishes = useMemo(() => {
    const dishes: { name: string; tag: string; emoji: string }[] = [];
    if (cook.cuisines.includes('South Indian')) {
      dishes.push(
        { name: 'Ghee Roast Dosa & Sambhar', tag: 'Breakfast', emoji: '🥞' },
        { name: 'Bisi Bele Bath & Raita', tag: 'Lunch', emoji: '🍛' }
      );
    }
    if (cook.cuisines.includes('North Indian')) {
      dishes.push(
        { name: 'Paneer Butter Masala & Rotis', tag: 'Dinner', emoji: '🍲' },
        { name: 'Dal Tadka & Jeera Rice', tag: 'Lunch', emoji: '🍚' }
      );
    }
    if (cook.cuisines.includes('Bengali')) {
      dishes.push(
        { name: 'Shorshe Ilish / Fish Curry', tag: 'Special', emoji: '🐟' },
        { name: 'Luchi & Alur Dom', tag: 'Breakfast', emoji: '🥟' }
      );
    }
    if (cook.cuisines.includes('Gujarati')) {
      dishes.push(
        { name: 'Gujarati Kadhi & Khichdi', tag: 'Comfort', emoji: '🥣' },
        { name: 'Khaman Dhokla & Chutney', tag: 'Snack', emoji: '🥮' }
      );
    }
    if (cook.cuisines.includes('Chinese')) {
      dishes.push(
        { name: 'Veg Hakka Noodles & Manchurian', tag: 'Dinner', emoji: '🥢' }
      );
    }
    if (cook.cuisines.includes('Continental')) {
      dishes.push(
        { name: 'Creamy Penne Alfredo & Salad', tag: 'Dinner', emoji: '🥗' }
      );
    }
    return dishes.slice(0, 4);
  }, [cook.cuisines]);

  const androidStatusBar = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, androidStatusBar) : insets.top;
  const topPadding = topInset + 14;
  const bottomPadding = Math.max(insets.bottom + 90, 115);

  return (
    <View style={s.screen}>
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

      {/* ─── Top Navigation Bar ────────────────────────────────────────────── */}
      <View style={[s.topNav, { paddingTop: topPadding }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={s.navCircleBtn}
          activeOpacity={0.8}
        >
          <ArrowLeft size={19} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={s.navRightActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Share cook profile"
            onPress={handleShare}
            style={s.navCircleBtn}
            activeOpacity={0.8}
          >
            <Share2 size={18} color={colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onPress={handleToggleFavorite}
            style={[s.navCircleBtn, isFavorite && s.navCircleBtnFav]}
            activeOpacity={0.8}
          >
            <Heart
              size={19}
              color={isFavorite ? '#EF4444' : colors.textPrimary}
              fill={isFavorite ? '#EF4444' : 'none'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Chef Hospitality Hero Card ─────────────────────────────────────── */}
        <View style={s.heroCard}>
          <LinearGradient
            colors={['#EEF9F1', '#F8FCF9']}
            style={s.heroGradient}
          >
            <View style={s.avatarWrapper}>
              <Avatar cook={cook} size={92} />
              <View style={s.verifiedCheckBadge}>
                <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </View>

            <Text style={s.chefName}>{cook.name}</Text>

            <View style={s.badgePillRow}>
              <View style={s.trustPill}>
                <CheckCircle2 size={12} color={colors.accent} strokeWidth={2.4} />
                <Text style={s.trustPillText}>Police Verified</Text>
              </View>
              <View style={s.trustPill}>
                <Sparkles size={12} color={colors.accent} strokeWidth={2.4} />
                <Text style={s.trustPillText}>FSSAI Certified</Text>
              </View>
            </View>

            {/* Chef Metrics Row */}
            <View style={s.metricsRow}>
              <View style={s.metricItem}>
                <View style={s.metricRatingBox}>
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <Text style={s.metricRatingText}>{cook.rating.toFixed(1)}</Text>
                </View>
                <Text style={s.metricLabel}>Rating</Text>
              </View>

              <View style={s.metricDivider} />

              <View style={s.metricItem}>
                <Text style={s.metricValue}>{cook.totalBookings}+</Text>
                <Text style={s.metricLabel}>Bookings</Text>
              </View>

              <View style={s.metricDivider} />

              <View style={s.metricItem}>
                <Text style={s.metricValue}>{cook.yearsExperience} yrs</Text>
                <Text style={s.metricLabel}>Experience</Text>
              </View>

              <View style={s.metricDivider} />

              <View style={s.metricItem}>
                <Text style={s.metricValue}>100%</Text>
                <Text style={s.metricLabel}>On-Time</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ─── About & Philosophy ────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About {cook.name.split(' ')[0]}</Text>
          <Text style={s.bioText}>{cook.bio}</Text>
        </View>

        {/* ─── Cuisine Specialties ────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Cuisine Specialties</Text>
          <View style={s.chipRow}>
            {cook.cuisines.map((cuisine) => (
              <View key={cuisine} style={s.cuisineChip}>
                <Utensils size={12} color={colors.accent} strokeWidth={2.2} />
                <Text style={s.cuisineChipText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Popular Dishes Gallery ─────────────────────────────────────────── */}
        {sampleDishes.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Popular Dishes Prepared</Text>
            <View style={s.dishesGrid}>
              {sampleDishes.map((dish, i) => (
                <View key={i} style={s.dishCard}>
                  <Text style={s.dishEmoji}>{dish.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dishName}>{dish.name}</Text>
                    <Text style={s.dishTag}>{dish.tag}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── Languages Spoken ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Languages Spoken</Text>
          <View style={s.chipRow}>
            {cook.languages.map((lang) => (
              <View key={lang} style={s.langChip}>
                <MessageCircle size={12} color={colors.textSecondary} strokeWidth={2} />
                <Text style={s.langChipText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Kitchen Hygiene Guarantee ──────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Kitchen Hygiene Guarantee</Text>
          <View style={s.hygieneBox}>
            <View style={s.hygieneItem}>
              <View style={s.hygieneIconCircle}>
                <ShieldCheck size={16} color={colors.accent} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hygieneTitle}>Police & Identity Verified</Text>
                <Text style={s.hygieneSub}>Full background verification completed with Aadhaar ID</Text>
              </View>
            </View>

            <View style={s.hygieneItem}>
              <View style={s.hygieneIconCircle}>
                <Droplets size={16} color={colors.accent} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hygieneTitle}>Clean Countertops & Cookware</Text>
                <Text style={s.hygieneSub}>Leaves your kitchen clean and tidies cooking counters post-meal</Text>
              </View>
            </View>

            <View style={s.hygieneItem}>
              <View style={s.hygieneIconCircle}>
                <KeyRound size={16} color={colors.accent} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hygieneTitle}>Doorstep OTP Security</Text>
                <Text style={s.hygieneSub}>Service starts only after you verify the secret arrival passcode</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Verified Customer Review Snippets ──────────────────────────────── */}
        <View style={[s.section, { marginBottom: 30 }]}>
          <View style={[s.rowBetween, { marginBottom: 12 }]}>
            <Text style={s.sectionTitle}>Verified Customer Reviews</Text>
            <Text style={s.reviewCountText}>({cook.totalBookings} reviews)</Text>
          </View>

          <View style={s.reviewCard}>
            <View style={s.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={s.reviewAvatar}>
                  <Text style={s.reviewAvatarText}>AR</Text>
                </View>
                <View>
                  <Text style={s.reviewerName}>Ananya R.</Text>
                  <Text style={s.reviewDate}>Indiranagar • 3 days ago</Text>
                </View>
              </View>
              <View style={s.reviewRating}>
                <Star size={11} color="#F59E0B" fill="#F59E0B" />
                <Text style={s.reviewRatingText}>5.0</Text>
              </View>
            </View>
            <Text style={s.reviewComment}>
              "{cook.name.split(' ')[0]} prepared exceptional meals for our family. Very punctual, followed all our spice preferences, and left the kitchen spotless!"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── Sticky Bottom Booking Dock with Glassmorphic Translucency ───────── */}
      <View style={[s.bottomDock, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
        <View style={s.priceBox}>
          <Text style={s.dockPriceLabel}>Starting from</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={s.dockPrice}>₹129</Text>
            <Text style={s.dockPerHr}>/hour</Text>
            <Text style={s.dockOrigPrice}>₹149</Text>
          </View>
          <Text style={s.dockPassSavings}>10% off with Zapeat Pass</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Book ${cook.name}`}
          onPress={handleBookCook}
          activeOpacity={0.88}
          style={s.bookBtn}
        >
          <Text style={s.bookBtnText}>Book This Cook</Text>
          <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  navCircleBtn: {
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
  navCircleBtnFav: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  navRightActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  heroCard: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 18,
  },
  heroGradient: {
    borderRadius: 26,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chefName: {
    fontFamily: fonts.brand,
    fontSize: 23,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  badgePillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.22)',
  },
  trustPillText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: colors.accent,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(21, 58, 39, 0.06)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricRatingText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(21, 58, 39, 0.08)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.futura,
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  bioText: {
    fontFamily: fonts.medium,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.22)',
  },
  cuisineChipText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: colors.accent,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  dishesGrid: {
    gap: 8,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  dishEmoji: {
    fontSize: 25,
    width: 34,
    textAlign: 'center',
  },
  dishName: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  dishTag: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  hygieneBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    gap: 13,
    ...shadows.soft,
  },
  hygieneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  hygieneIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hygieneTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.textPrimary,
    marginBottom: 1,
  },
  hygieneSub: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewCountText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2F3D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.accent,
  },
  reviewerName: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewDate: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
  },
  reviewRatingText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: '#D97706',
  },
  reviewComment: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    ...shadows.floating,
  },
  priceBox: {
    flex: 1,
  },
  dockPriceLabel: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dockPrice: {
    fontFamily: fonts.brand,
    fontSize: 21,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  dockPerHr: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  dockOrigPrice: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  dockPassSavings: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: colors.accent,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 18,
    ...shadows.soft,
  },
  bookBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  notFoundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  notFoundEmoji: {
    fontSize: 54,
    marginBottom: 14,
  },
  notFoundTitle: {
    fontFamily: fonts.brand,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  notFoundSub: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
});
