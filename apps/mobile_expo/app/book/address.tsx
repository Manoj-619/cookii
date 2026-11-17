import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Home,
  Building2,
  MapPin,
  Trash2,
  Plus,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Header, Button, Field } from '../../src/components/ui';
import { useUserStore, useBookingStore } from '../../src/store';
import { Address } from '../../src/types';
import { colors, shadows, fonts } from '../../src/theme';

export default function AddressScreen() {
  const addresses = useUserStore((s) => s.addresses);
  const select = useUserStore((s) => s.selectAddress);
  const add = useUserStore((s) => s.addAddress);
  const remove = useUserStore((s) => s.removeAddress);
  const setDraft = useBookingStore((s) => s.setDraft);

  const [label, setLabel] = useState<Address['label']>('Home');
  const [flatNo, setFlatNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSelect = (addressId: string) => {
    Haptics.selectionAsync().catch(() => {});
    select(addressId);
    setDraft({ addressId });
    router.back();
  };

  const handleDelete = (addr: Address) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Remove Address',
      `Are you sure you want to delete "${addr.label}" (${addr.line.split(',')[0]})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(addr.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (!streetAddress.trim()) {
      Alert.alert('Address Required', 'Please enter your street address or apartment name.');
      return;
    }

    const fullLine = flatNo.trim()
      ? `${flatNo.trim()}, ${streetAddress.trim()}`
      : streetAddress.trim();

    add({
      id: Date.now().toString(),
      line: fullLine,
      label,
      landmark: landmark.trim() || undefined,
      isSelected: true,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setFlatNo('');
    setStreetAddress('');
    setLandmark('');
    setIsAddingNew(false);
  };

  const renderIcon = (type: Address['label'], active: boolean) => {
    const color = active ? colors.accent : colors.textSecondary;
    if (type === 'Home') return <Home size={17} color={color} strokeWidth={2.2} />;
    if (type === 'Work') return <Building2 size={17} color={color} strokeWidth={2.2} />;
    return <MapPin size={17} color={color} strokeWidth={2.2} />;
  };

  return (
    <Screen>
      <Header
        title="Kitchen Address"
        subtitle="Where should our chef arrive to cook?"
      />

      {/* ─── Saved Addresses List ────────────────────────────────────────────── */}
      <View style={{ marginBottom: 16 }}>
        {addresses.map((a) => {
          const isSelected = a.isSelected;
          return (
            <TouchableOpacity
              key={a.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${a.label} address: ${a.line}`}
              onPress={() => handleSelect(a.id)}
              activeOpacity={0.85}
              style={[s.addressCard, isSelected && s.addressCardSelected]}
            >
              <View style={s.cardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <View style={[s.iconBox, isSelected && s.iconBoxSelected]}>
                    {renderIcon(a.label, isSelected)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.labelTitle}>{a.label} Kitchen</Text>
                      {isSelected && (
                        <View style={s.selectedTag}>
                          <Text style={s.selectedTagText}>SELECTED</Text>
                        </View>
                      )}
                    </View>
                    {a.landmark ? (
                      <Text style={s.landmarkText} numberOfLines={1}>
                        Near {a.landmark}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Selection Radio / Checkmark */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${a.label} address`}
                    onPress={() => handleDelete(a)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={s.deleteBtn}
                  >
                    <Trash2 size={15} color={colors.textMuted} strokeWidth={2} />
                  </TouchableOpacity>

                  <View style={[s.radioCircle, isSelected && s.radioCircleSelected]}>
                    {isSelected && <View style={s.radioInnerDot} />}
                  </View>
                </View>
              </View>

              <Text style={s.addressLineText}>{a.line}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── Toggle Add Address / Form ───────────────────────────────────────── */}
      {!isAddingNew ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add another address"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setIsAddingNew(true);
          }}
          style={s.addNewBtn}
          activeOpacity={0.8}
        >
          <View style={s.addIconCircle}>
            <Plus size={19} color={colors.accent} strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.addNewTitle}>Add New Kitchen Address</Text>
            <Text style={s.addNewSub}>Home, family kitchen, or party venue</Text>
          </View>
          <ChevronRight size={17} color={colors.accent} strokeWidth={2.2} />
        </TouchableOpacity>
      ) : (
        /* ─── Add Address Card ─────────────────────────────────────────────── */
        <View style={s.addFormCard}>
          <View style={s.formHeader}>
            <View>
              <Text style={s.formTitle}>Add New Address</Text>
              <Text style={s.formSub}>Cooks navigate using these exact details</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsAddingNew(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={19} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Label selector pills */}
          <Text style={s.inputLabel}>ADDRESS TYPE</Text>
          <View style={s.labelPillsRow}>
            {(['Home', 'Work', 'Other'] as const).map((l) => {
              const active = label === l;
              return (
                <TouchableOpacity
                  key={l}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${l} label`}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setLabel(l);
                  }}
                  activeOpacity={0.8}
                  style={[s.labelPill, active && s.labelPillActive]}
                >
                  {renderIcon(l, active)}
                  <Text style={[s.labelPillText, active && s.labelPillTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Field
            label="FLAT / HOUSE / APARTMENT NO."
            placeholder="e.g. Flat 402, Tower B"
            value={flatNo}
            onChangeText={setFlatNo}
          />

          <Field
            label="AREA / STREET / LOCALITY *"
            placeholder="e.g. 1st Cross, Indiranagar, Bengaluru"
            value={streetAddress}
            onChangeText={setStreetAddress}
            multiline
          />

          <Field
            label="LANDMARK (OPTIONAL)"
            placeholder="e.g. Opposite Sony Center, Behind Metro Station"
            value={landmark}
            onChangeText={setLandmark}
          />

          <View style={{ marginTop: 10 }}>
            <Button title="Save & Deliver Here" onPress={handleSave} />
          </View>
        </View>
      )}

      {/* ─── Service Notice ─────────────────────────────────────────────────── */}
      <View style={s.serviceNotice}>
        <ShieldCheck size={14} color={colors.accent} strokeWidth={2.2} />
        <Text style={s.serviceNoticeText}>
          Zapeat services all prime Bangalore pin codes · 45m arrival
        </Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  addressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.soft,
  },
  addressCardSelected: {
    borderColor: colors.accent,
    backgroundColor: '#FAFEFB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F8FCF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: '#EEF9F1',
  },
  labelTitle: {
    fontFamily: fonts.futura,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedTag: {
    backgroundColor: '#EEF9F1',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  selectedTagText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  landmarkText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.accent,
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  addressLineText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginLeft: 48,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 163, 102, 0.25)',
    borderStyle: 'dashed',
    marginBottom: 18,
    gap: 12,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF9F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewTitle: {
    fontFamily: fonts.futura,
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addNewSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  addFormCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
    ...shadows.soft,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: fonts.brand,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  formSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  labelPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  labelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: '#F8FCF9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelPillActive: {
    backgroundColor: '#EEF9F1',
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  labelPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  labelPillTextActive: {
    color: colors.accent,
    fontFamily: fonts.bold,
  },
  serviceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  serviceNoticeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
