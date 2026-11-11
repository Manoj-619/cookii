import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CookiiColors {
  // Brand Emerald & Forest Tones
  static const Color primary = Color(0xFF059669); // Artisanal Emerald
  static const Color primaryDark = Color(0xFF064E3B); // Deep Forest
  static const Color primaryLight = Color(0xFF10B981); // Bright Emerald
  static const Color primarySoft = Color(0xFFE6F4EA); // Soft Sage Tint
  static const Color primaryGlow = Color(0x28059669);

  // Surface & Canvas
  static const Color canvas = Color(0xFFF8FAF8); // Porcelain Silk
  static const Color surface = Color(0xFFFFFFFF); // Pure White
  static const Color surfaceSubtle = Color(0xFFF3F6F4);

  // Border & Dividers
  static const Color border = Color(0xFFE4ECE6);
  static const Color borderLight = Color(0xFFEFF4F0);

  // High-Contrast Editorial Typography
  static const Color textHeadline = Color(0xFF0A2216); // Obsidian Forest
  static const Color textBody = Color(0xFF2C3E35); // Deep Charcoal Slate
  static const Color textMuted = Color(0xFF6B7F74); // Cool Sage Gray
  static const Color textSubtle = Color(0xFF9CB0A4);

  // Accents & Signals
  static const Color gold = Color(0xFFD97706); // Warm Amber
  static const Color goldBg = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFE11D48); // Rose Crimson
  static const Color dangerBg = Color(0xFFFFECEF);
  static const Color info = Color(0xFF0284C7);
  static const Color infoBg = Color(0xFFE0F2FE);
}

class CookiiTheme {
  static ThemeData get lightTheme {
    final fontName = GoogleFonts.plusJakartaSans().fontFamily;

    return ThemeData(
      useMaterial3: true,
      fontFamily: fontName,
      scaffoldBackgroundColor: CookiiColors.canvas,
      colorScheme: ColorScheme.fromSeed(
        seedColor: CookiiColors.primary,
        primary: CookiiColors.primary,
        surface: CookiiColors.surface,
        onSurface: CookiiColors.textHeadline,
        brightness: Brightness.light,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: CookiiColors.textHeadline),
        titleTextStyle: TextStyle(
          fontFamily: fontName,
          color: CookiiColors.textHeadline,
          fontSize: 19,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: CookiiColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: CookiiColors.border),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: CookiiColors.primaryDark,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: TextStyle(
            fontFamily: fontName,
            fontSize: 15,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.1,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: CookiiColors.primaryDark,
          side: const BorderSide(color: CookiiColors.border, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: TextStyle(
            fontFamily: fontName,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
