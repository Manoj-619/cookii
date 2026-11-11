import 'package:flutter/material.dart';

class CookiiPalette {
  static const brandPrimary = Color(0xFFE05315);
  static const brandPrimaryHover = Color(0xFFC4430D);
  static const brandPrimarySubtle = Color(0xFFFFF2EC);
  static const brandPrimaryBorder = Color(0xFFFED7C2);

  static const freshGreen = Color(0xFF15803D);
  static const freshGreenSubtle = Color(0xFFECFDF5);

  static const canvasLight = Color(0xFFFAF7F2);
  static const cardLight = Color(0xFFFFFFFF);
  static const subtleLight = Color(0xFFF3EFEA);

  static const textPrimaryLight = Color(0xFF1E1B18);
  static const textSecondaryLight = Color(0xFF635D56);
  static const textMutedLight = Color(0xFF968E85);

  static const borderSubtleLight = Color(0xFFEBE5DD);
  static const borderDefaultLight = Color(0xFFDDD5CA);
}

class CookiiTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: CookiiPalette.canvasLight,
      colorScheme: const ColorScheme.light(
        primary: CookiiPalette.brandPrimary,
        secondary: CookiiPalette.freshGreen,
        surface: CookiiPalette.cardLight,
        error: Color(0xFFDC2626),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: CookiiPalette.canvasLight,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: CookiiPalette.textPrimaryLight),
        titleTextStyle: TextStyle(
          color: CookiiPalette.textPrimaryLight,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: CookiiPalette.cardLight,
        modalBackgroundColor: CookiiPalette.cardLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: CookiiPalette.brandPrimary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

