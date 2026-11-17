import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows } from '../src/theme';
import { useAuthStore } from '../src/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STORAGE_KEY = '@zapeat_splash_seen_v1';

interface Slide {
  id: number;
  emoji: string;
  badge: string;
  title: string;
  subtitle: string;
  gradient: [string, string, ...string[]];
  featurePill: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    emoji: '👩‍🍳',
    badge: 'VERIFIED HOME COOKS',
    title: 'Fresh Home Cooking',
    subtitle: "Book a verified home cook in minutes. Bengaluru's favourite kitchen service.",
    gradient: ['#064E3B', '#047857', '#059669'],
    featurePill: '⭐ 4.8+ Rated Chefs in Bengaluru',
  },
  {
    id: 2,
    emoji: '🍛',
    badge: 'TAILORED TO YOUR TASTE',
    title: 'Your Chef, Your Kitchen',
    subtitle: 'Fresh meals cooked at home. Your ingredients, your taste, our cooks.',
    gradient: ['#065F46', '#059669', '#0D9488'],
    featurePill: '🌿 South, North, Bengali & Diets',
  },
  {
    id: 3,
    emoji: '💚',
    badge: 'ZERO HIDDEN CHARGES',
    title: 'Safe & Transparent',
    subtitle: 'Background verified cooks, full price breakdown before you pay.',
    gradient: ['#047857', '#059669', '#10B981'],
    featurePill: '🛡️ Police Verified & Health Shield',
  },
];

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const scrollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Check if onboarding was already completed
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(STORAGE_KEY);
        if (seen === 'true' && isMounted) {
          router.replace(isLoggedIn ? '/(tabs)/home' : '/(auth)/login');
          return;
        }
      } catch {
        // Fallback to showing onboarding
      }
      if (isMounted) setIsReady(true);
    })();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Finish onboarding and persist flag
  const handleFinish = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage error ignored
    }
    router.replace(isLoggedIn ? '/(tabs)/home' : '/(auth)/login');
  }, [isLoggedIn]);

  // Handle slide change on manual swipe
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (nextIndex >= 0 && nextIndex < SLIDES.length) {
      setActiveIndex(nextIndex);
    }
  };

  // Programmatic scroll to index
  const goToSlide = (index: number) => {
    if (index >= 0 && index < SLIDES.length) {
      scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      setActiveIndex(index);
    }
  };

  // Auto advance every 3 seconds (pauses on the final slide so user can press CTA)
  useEffect(() => {
    if (!isReady) return;

    if (activeIndex >= SLIDES.length - 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next < SLIDES.length) {
          scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
          return next;
        }
        return prev;
      });
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, isReady]);

  if (!isReady) {
    return <View style={styles.loadingContainer} />;
  }

  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 16) + 8;
  const bottomInset = Math.max(insets.bottom, 24);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Slide Pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        bounces={false}
        style={styles.pager}
      >
        {SLIDES.map((slide) => (
          <LinearGradient
            key={slide.id}
            colors={slide.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.3, y: 1 }}
            style={[styles.slide, { width: SCREEN_WIDTH }]}
          >
            {/* Visual Center Area */}
            <View style={styles.visualContainer}>
              {/* Decorative Glow Circles */}
              <View style={styles.glowOuterCircle}>
                <View style={styles.glowInnerCircle}>
                  <Text style={styles.slideEmoji}>{slide.emoji}</Text>
                </View>
              </View>

              {/* Feature Pill */}
              <View style={styles.featurePillBox}>
                <Text style={styles.featurePillText}>{slide.featurePill}</Text>
              </View>
            </View>

            {/* Typography Content */}
            <View style={styles.textContainer}>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{slide.badge}</Text>
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Floating Top Bar (Brand + Skip) */}
      <View style={[styles.topBar, { top: topInset }]}>
        <View style={styles.brandRow}>
          <Text style={styles.brandEmoji}>🌿</Text>
          <Text style={styles.brandName}>ZAPEAT</Text>
        </View>

        {activeIndex < SLIDES.length - 1 && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Skip intro"
            onPress={handleFinish}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Floating Bottom Navigation (Dots + Action Button) */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <TouchableOpacity
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${i + 1}`}
                onPress={() => goToSlide(i)}
                style={[styles.dot, isActive && styles.dotActive]}
                activeOpacity={0.8}
              />
            );
          })}
        </View>

        {/* Action Button: Next or Get Started */}
        {activeIndex === SLIDES.length - 1 ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Get Started with Zapeat"
            onPress={handleFinish}
            style={styles.getStartedBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={18} color={colors.accent} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Next slide"
            onPress={() => goToSlide(activeIndex + 1)}
            style={styles.nextBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Stylesheets ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  container: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 120,
    paddingBottom: 160,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  glowOuterCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  glowInnerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...shadows.card,
  },
  slideEmoji: {
    fontSize: 66,
  },
  featurePillBox: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  featurePillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D1FAE5',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 15.5,
    lineHeight: 23,
    color: '#E6F4EA',
    textAlign: 'center',
    maxWidth: 320,
    fontWeight: '500',
  },
  topBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandEmoji: {
    fontSize: 22,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    ...shadows.card,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
