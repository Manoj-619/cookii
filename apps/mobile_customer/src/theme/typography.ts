import { Platform } from 'react-native';

export const typography = {
  display: 28,
  title: 22,
  heading: 18,
  body: 15,
  caption: 13,
  micro: 11,
} as const;

export const fonts = {
  // Brand & Heading: Futura (native on iOS, Urbanist on Android)
  brand: Platform.select({
    ios: 'Futura-Bold',
    android: 'Urbanist_800ExtraBold',
    default: 'Urbanist_800ExtraBold',
  }),
  futura: Platform.select({
    ios: 'Futura',
    android: 'Urbanist_700Bold',
    default: 'Urbanist_700Bold',
  }),
  futuraMedium: Platform.select({
    ios: 'Futura-Medium',
    android: 'Urbanist_600SemiBold',
    default: 'Urbanist_600SemiBold',
  }),
  // Urbanist Google Font family
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semiBold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extraBold: 'Urbanist_800ExtraBold',
  black: 'Urbanist_900Black',
} as const;
