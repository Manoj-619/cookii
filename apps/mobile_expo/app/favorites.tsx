import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Calendar, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Header, CookCard } from '../src/components/ui';
import { useUserStore, useBookingStore } from '../src/store';
import { cooks } from '../src/data/cooks';
import { colors, shadows, fonts } from '../src/theme';

export default function Favorites() {
  const favoriteIds = useUserStore((s) => s.favoriteCookIds);
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);
  const setDraft = useBookingStore((s) => s.setDraft);

  const favoriteCooks = cooks.filter((c) => favoriteIds.includes(c.id));
  const recommendedCooks = cooks.filter((c) => !favoriteIds.includes(c.id)).slice(0, 3);

  const handleToggle = (cookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    toggleFavorite(cookId);
  };

  const handleBook = (cookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDraft({ cookId });
    router.push('/book/schedule');
  };

  return (
    <Screen>
      <Header
        title="Saved Chefs"
        subtitle={
          favoriteCooks.length > 0
            ? `${favoriteCooks.length} ${favoriteCooks.length === 1 ? 'chef' : 'chefs'} saved for quick rebooking`
            : 'Your favorite cooks in Bengaluru'
        }
      />

      {favoriteCooks.length > 0 ? (
        /* ─── Favorite Cooks List ─────────────────────────────────────────── */
        <View style={{ marginBottom: 28 }}>
          {favoriteCooks.map((cook) => (
            <View key={cook.id} style={s.cardWrapper}>
              <CookCard
                cook={cook}
                onPress={() => router.push(`/cook/${cook.id}`)}
                rightElement={
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${cook.name} from favorites`}
                    onPress={() => handleToggle(cook.id)}
                    style={s.heartBtn}
                    activeOpacity={0.7}
                  >
                    <Heart size={18} color="#EF4444" fill="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                }
              />
              <View style={s.quickActionRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Book ${cook.name}`}
                  onPress={() => handleBook(cook.id)}
                  style={s.quickBookBtn}
                  activeOpacity={0.8}
                >
                  <Calendar size={13} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={s.quickBookText}>Book {cook.name.split(' ')[0]}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`View ${cook.name} profile`}
                  onPress={() => router.push(`/cook/${cook.id}`)}
                  style={s.viewProfileBtn}
                  activeOpacity={0.8}
                >
                  <Text style={s.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        /* ─── Airbnb-Style Empty State ─────────────────────────────────────── */
        <View style={s.emptyBox}>
          <View style={s.emptyIconCircle}>
            <Heart size={30} color={colors.accent} strokeWidth={2.2} />
          </View>
          <Text style={s.emptyTitle}>No saved cooks yet</Text>
          <Text style={s.emptySub}>
            Tap the heart icon on any chef's profile to save them here for seamless 1-tap rebooking whenever you're hungry.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Explore top chefs"
            onPress={() => router.push('/account/cooks')}
            style={s.exploreBtn}
            activeOpacity={0.85}
          >
            <Text style={s.exploreBtnText}>Explore Top Rated Chefs</Text>
            <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Recommended Chefs to Discover ──────────────────────────────────── */}
      {recommendedCooks.length > 0 && (
        <View style={{ marginTop: favoriteCooks.length > 0 ? 8 : 20, marginBottom: 30 }}>
          <View style={s.recHeader}>
            <View>
              <Text style={s.recTitle}>Recommended for You</Text>
              <Text style={s.recSub}>Top rated verified cooks in your area</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/account/cooks')}>
              <Text style={s.viewAllLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {recommendedCooks.map((cook) => (
            <CookCard
              key={cook.id}
              cook={cook}
              onPress={() => router.push(`/cook/${cook.id}`)}
              rightElement={
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Save ${cook.name} to favorites`}
                  onPress={() => handleToggle(cook.id)}
                  style={[s.heartBtn, { backgroundColor: '#F8FCF9' }]}
                  activeOpacity={0.7}
                >
                  <Heart size={18} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  cardWrapper: {
    marginBottom: 14,
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -4,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  quickBookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingVertical: 9.5,
    borderRadius: 14,
    ...shadows.soft,
  },
  quickBookText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  viewProfileBtn: {
    paddingHorizontal: 15,
    paddingVertical: 9.5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  viewProfileText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    paddingVertical: 34,
    paddingHorizontal: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
    ...shadows.soft,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.brand,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 15,
    ...shadows.soft,
  },
  exploreBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  recTitle: {
    fontFamily: fonts.futura,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  recSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  viewAllLink: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.accent,
  },
});
