import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../../src/theme';
import { useBookingStore } from '../../../src/store';

const COMPLIMENT_TAGS = [
  'Delicious Food',
  'Punctual & Polite',
  'Clean Kitchen',
  'Followed Recipe',
  'Great Hygiene',
  'Fast & Efficient',
];

export default function RateBookingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === id));

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Delicious Food', 'Clean Kitchen']);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Thank You!',
        `Your ${rating}-star review for ${booking?.cookName || 'your cook'} has been submitted.`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    }, 600);
  };

  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 16) + 12;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate & Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cookPrompt}>
            How was your session with {booking?.cookName || 'your Cook'}?
          </Text>
          <Text style={styles.cookSubtext}>
            Your honest feedback helps us maintain verified, quality service.
          </Text>

          {/* Star Rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${star} stars`}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starTouch}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 5
              ? 'Outstanding Experience! ⭐'
              : rating === 4
              ? 'Very Good Session 👍'
              : rating === 3
              ? 'Average Experience 👌'
              : 'Could Be Better'}
          </Text>

          {/* Compliment Tags */}
          <Text style={styles.tagsHeading}>What did you like the most?</Text>
          <View style={styles.tagsContainer}>
            {COMPLIMENT_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  accessibilityRole="button"
                  accessibilityLabel={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagPill, selected && styles.tagPillActive]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tagText, selected && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Text Comments */}
          <TextInput
            placeholder="Share more details about your meal or experience..."
            placeholderTextColor={colors.textSecondary}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Submit Review"
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={styles.submitBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    ...shadows.soft,
  },
  cookPrompt: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cookSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starTouch: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 10,
    marginBottom: 20,
  },
  tagsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  tagPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  tagPillActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tagTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#F9FBF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 90,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
