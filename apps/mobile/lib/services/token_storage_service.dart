import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class TokenStorageService {
  static const String _keyAccessToken = 'cookii_access_token';
  static const String _keyRefreshToken = 'cookii_refresh_token';
  static const String _keyUserProfile = 'cookii_user_profile';

  /// Persists session tokens and user profile to device storage
  static Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required UserProfile user,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAccessToken, accessToken);
      await prefs.setString(_keyRefreshToken, refreshToken);
      await prefs.setString(_keyUserProfile, jsonEncode(user.toJson()));
      debugPrint('✓ Saved authentication session to persistent storage for user: ${user.name}');
    } catch (e) {
      debugPrint('Error saving session tokens: $e');
    }
  }

  /// Updates only the access token (after background refresh)
  static Future<void> updateAccessToken(String newAccessToken) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAccessToken, newAccessToken);
    } catch (e) {
      debugPrint('Error updating access token: $e');
    }
  }

  /// Reads stored access token
  static Future<String?> getAccessToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_keyAccessToken);
    } catch (e) {
      return null;
    }
  }

  /// Reads stored refresh token
  static Future<String?> getRefreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_keyRefreshToken);
    } catch (e) {
      return null;
    }
  }

  /// Restores cached user profile on app startup
  static Future<UserProfile?> getUserProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString(_keyUserProfile);
      final accessToken = prefs.getString(_keyAccessToken);
      if (userJson != null) {
        final Map<String, dynamic> data = jsonDecode(userJson);
        return UserProfile.fromJson(data, token: accessToken);
      }
    } catch (e) {
      debugPrint('Error restoring user profile: $e');
    }
    return null;
  }

  /// Clears all session tokens and user profile on logout
  static Future<void> clearSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_keyAccessToken);
      await prefs.remove(_keyRefreshToken);
      await prefs.remove(_keyUserProfile);
      debugPrint('✓ Session cleared from persistent storage');
    } catch (e) {
      debugPrint('Error clearing session: $e');
    }
  }
}

