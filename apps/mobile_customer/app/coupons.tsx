import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, styles } from '../src/components/ui';
import { coupons } from '../src/data/coupons';
import { colors, shadows } from '../src/theme';

export default function Coupons() {
  const handleCopy = (code: string) => {
    Alert.alert('Coupon Applied', `Code "${code.toUpperCase()}" applied to your booking draft.`);
    router.back();
  };

  return (
    <Screen>
      <Header title="Offers & Coupons" />

      <Text style={[styles.muted, { marginBottom: 18 }]}>
        Exclusive savings for Bengaluru kitchens with Zapeat Pass and member vouchers.
      </Text>

      {coupons.map((c) => {
        return (
          <View
            key={c.id}
            style={[
              s.couponCard,
              !c.active && s.couponCardInactive,
            ]}
          >
            <View style={s.cardTop}>
              <View style={[s.iconBox, { backgroundColor: c.active ? '#EEF9F1' : '#F3F4F6' }]}>
                <Ionicons
                  name={c.active ? 'gift' : 'gift-outline'}
                  size={20}
                  color={c.active ? colors.accent : colors.textSecondary}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[s.couponTitle, !c.active && { color: colors.textSecondary }]}>
                    {c.title}
                  </Text>
                  {c.active && (
                    <View style={s.activeBadge}>
                      <Text style={s.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={s.couponDesc}>{c.description}</Text>
              </View>
            </View>

            <View style={s.dashedDivider} />

            <View style={s.cardBottom}>
              <Text style={s.validity}>
                {c.active ? 'Valid till' : 'Expired'} {c.validTill}
              </Text>

              {c.active ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Apply ${c.title}`}
                  onPress={() => handleCopy(c.id)}
                  activeOpacity={0.8}
                  style={s.applyBtn}
                >
                  <Text style={s.applyBtnText}>APPLY</Text>
                </TouchableOpacity>
              ) : (
                <Text style={s.expiredText}>Expired</Text>
              )}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const s = StyleSheet.create({
  couponCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.soft,
  },
  couponCardInactive: {
    opacity: 0.6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activeBadge: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accent,
  },
  couponDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(21, 58, 39, 0.08)',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validity: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  applyBtn: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  applyBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expiredText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
