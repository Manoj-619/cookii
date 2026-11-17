import React from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Accordion, Button, styles } from '../src/components/ui';
import { colors, shadows } from '../src/theme';

const faqs = [
  {
    q: 'How does Zapeat work?',
    a: 'Choose your desired date, arrival slot, and duration. A police-verified home cook arrives with professional hygiene standards to cook delicious, fresh meals using your groceries and cookware.',
  },
  {
    q: 'Do I provide the groceries and spices?',
    a: 'Yes! You provide the ingredients and cookware, and our cooks adapt perfectly to your pantry, spices, and dietary preferences (such as low salt, Jain, or vegan).',
  },
  {
    q: 'What is the cancellation and reschedule policy?',
    a: 'Cancellations and rescheduling are completely free up to 2 hours before the scheduled arrival time. A ₹50 platform fee applies if cancelled within 2 hours.',
  },
  {
    q: 'How does the Doorstep OTP work?',
    a: 'When your cook arrives at your home, share the 4-digit OTP shown on your live booking screen. The cooking session timer starts only after the cook verifies this code.',
  },
  {
    q: 'Are all Zapeat cooks verified?',
    a: 'Yes, 100% of cooks undergo mandatory police background verification, government ID validation, and hygiene training before joining Zapeat.',
  },
  {
    q: 'What payment methods does Zapeat accept?',
    a: 'We accept Zapeat Wallet (with instant 1-tap checkout), UPI (GPay, PhonePe, Paytm), credit/debit cards, and Net Banking powered securely by Razorpay.',
  },
];

export default function Help() {
  return (
    <Screen>
      <Header title="Help & Support" />

      {/* Snabbit Support Card */}
      <View style={s.supportBanner}>
        <View style={s.supportIcon}>
          <Ionicons name="headset" size={22} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.supportTitle}>24/7 Bengaluru Kitchen Concierge</Text>
          <Text style={s.supportDesc}>
            Need immediate assistance with a cook or ongoing session? Our team is live.
          </Text>
        </View>
      </View>

      <Text style={[styles.heading, { marginTop: 12, marginBottom: 12 }]}>
        Frequently Asked Questions
      </Text>

      {faqs.map(({ q, a }) => (
        <Accordion key={q} question={q} answer={a} />
      ))}

      <View style={{ marginTop: 16, marginBottom: 28 }}>
        <Button
          title="Contact Zapeat Support"
          onPress={() =>
            Alert.alert(
              'Zapeat Concierge Support',
              'Connecting you with our support team at support@zapeat.online or via WhatsApp +91 80 4718 2900.',
              [{ text: 'OK' }]
            )
          }
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#EEF9F1',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(63, 163, 102, 0.2)',
    marginBottom: 16,
    ...shadows.soft,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  supportDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});
