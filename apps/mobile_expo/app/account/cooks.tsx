import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Header, CookCard } from '../../src/components/ui';
import { useUserStore, useBookingStore } from '../../src/store';
import { cooks } from '../../src/data/cooks';
import { Cuisine } from '../../src/types';
import { colors, shadows, fonts } from '../../src/theme';

const CUISINE_CATEGORIES: ('All' | Cuisine)[] = [
  'All',
  'South Indian',
  'North Indian',
  'Bengali',
  'Gujarati',
  'Continental',
  'Chinese',
];

export default function YourCooks() {
  const favoriteIds = useUserStore((s) => s.favoriteCookIds);
  const bookings = useBookingStore((s) => s.bookings);

  const [activeTab, setActiveTab] = useState<'all' | 'past'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<'All' | Cuisine>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Past / favorite cook IDs
  const pastCookIds = useMemo(() => {
    const ids = new Set<string>(favoriteIds);
    bookings.forEach((b) => {
      if (b.cookId) ids.add(b.cookId);
    });
    return ids;
  }, [favoriteIds, bookings]);

  // Filtered cooks
  const filteredCooks = useMemo(() => {
    return cooks.filter((cook) => {
      if (activeTab === 'past' && !pastCookIds.has(cook.id)) {
        return false;
      }
      if (selectedCuisine !== 'All' && !cook.cuisines.includes(selectedCuisine)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = cook.name.toLowerCase().includes(q);
        const matchesCuisine = cook.cuisines.some((c) => c.toLowerCase().includes(q));
        const matchesLang = cook.languages.some((l) => l.toLowerCase().includes(q));
        return matchesName || matchesCuisine || matchesLang;
      }
      return true;
    });
  }, [activeTab, selectedCuisine, searchQuery, pastCookIds]);

  const handleSelectCuisine = (cuisine: 'All' | Cuisine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedCuisine(cuisine);
  };

  const handleSelectTab = (tab: 'all' | 'past') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
  };

  return (
    <Screen>
      <Header
        title="Find a Home Chef"
        subtitle="Police verified · Bengaluru certified"
      />

      {/* ─── Search Bar with Clear Button ────────────────────────────────────── */}
      <View style={s.searchContainer}>
        <Search size={16} color={colors.accent} strokeWidth={2.2} />
        <TextInput
          accessibilityLabel="Search home cooks by name, cuisine, or language"
          placeholder="Search by cook name, cuisine, or language..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={s.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={15} color={colors.textSecondary} strokeWidth={2.4} />
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Segmented Filter Tabs ───────────────────────────────────────────── */}
      <View style={s.segmentedRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Show all verified cooks"
          onPress={() => handleSelectTab('all')}
          style={[s.segmentBtn, activeTab === 'all' && s.segmentBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'all' && s.segmentTextActive]}>
            All Verified Chefs ({cooks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Show your saved and booked cooks"
          onPress={() => handleSelectTab('past')}
          style={[s.segmentBtn, activeTab === 'past' && s.segmentBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[s.segmentText, activeTab === 'past' && s.segmentTextActive]}>
            Your Chefs ({pastCookIds.size})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Cuisine Filter Pills Carousel ───────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.cuisinePillsContainer}
      >
        {CUISINE_CATEGORIES.map((cuisine) => {
          const isSelected = selectedCuisine === cuisine;
          return (
            <TouchableOpacity
              key={cuisine}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cuisine}`}
              onPress={() => handleSelectCuisine(cuisine)}
              activeOpacity={0.8}
              style={[s.cuisinePill, isSelected && s.cuisinePillSelected]}
            >
              <Text style={[s.cuisinePillText, isSelected && s.cuisinePillTextSelected]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── Results Counter ─────────────────────────────────────────────────── */}
      <View style={s.resultsHeader}>
        <Text style={s.resultsCount}>
          {filteredCooks.length} {filteredCooks.length === 1 ? 'cook' : 'cooks'} available in Bengaluru
        </Text>
        {selectedCuisine !== 'All' && (
          <TouchableOpacity
            onPress={() => setSelectedCuisine('All')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={s.resetFilterText}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Cooks Listing ───────────────────────────────────────────────────── */}
      {filteredCooks.length > 0 ? (
        <View style={{ marginBottom: 20 }}>
          {filteredCooks.map((cook) => (
            <CookCard
              key={cook.id}
              cook={cook}
              onPress={() => router.push(`/cook/${cook.id}`)}
            />
          ))}
        </View>
      ) : (
        /* ─── Empty State ─────────────────────────────────────────────────── */
        <View style={s.emptyContainer}>
          <View style={s.emptyIconCircle}>
            <SlidersHorizontal size={28} color={colors.accent} strokeWidth={2.2} />
          </View>
          <Text style={s.emptyTitle}>No matching home chefs found</Text>
          <Text style={s.emptySub}>
            {activeTab === 'past'
              ? "You haven't booked or saved any cooks in this category yet."
              : 'Try searching with a different cuisine or keyword.'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCuisine('All');
              setActiveTab('all');
            }}
            style={s.resetBtn}
            activeOpacity={0.8}
          >
            <Text style={s.resetBtnText}>View All Available Cooks</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 12,
    gap: 10,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.textPrimary,
    padding: 0,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(21, 58, 39, 0.05)',
    padding: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.soft,
  },
  segmentText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
  },
  cuisinePillsContainer: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  cuisinePill: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  cuisinePillSelected: {
    backgroundColor: '#EEF9F1',
    borderColor: colors.accent,
  },
  cuisinePillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  cuisinePillTextSelected: {
    color: colors.accent,
    fontFamily: fonts.bold,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultsCount: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetFilterText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.brand,
    fontSize: 17,
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
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  resetBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.accent,
  },
});
