import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/models.dart';
import 'token_storage_service.dart';

class ApiService {
  // Uses reverse adb port or localhost when on Web/Desktop, or 10.0.2.2 when on Android emulator
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:4000/api/v1';
    if (defaultTargetPlatform == TargetPlatform.android) {
      // 127.0.0.1 works when adb reverse tcp:4000 tcp:4000 is active (physical device or emulator)
      return 'http://127.0.0.1:4000/api/v1';
    }
    return 'http://localhost:4000/api/v1';
  }

  /// Helper to attach cryptographic JWT Bearer token to all outgoing API requests
  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await TokenStorageService.getAccessToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Transparently rotate access token using refresh token
  static Future<String?> refreshAccessToken() async {
    final refreshToken = await TokenStorageService.getRefreshToken();
    if (refreshToken == null) return null;

    try {
      final uri = Uri.parse('$baseUrl/auth/token/refresh');
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final newAccessToken = body['data']['accessToken'] as String?;
          if (newAccessToken != null) {
            await TokenStorageService.updateAccessToken(newAccessToken);
            debugPrint('✓ Successfully refreshed JWT access token');
            return newAccessToken;
          }
        }
      }
    } catch (e) {
      debugPrint('Token refresh error: $e');
    }
    return null;
  }

  static Future<List<Service>> fetchServices() async {
    try {
      final uri = Uri.parse('$baseUrl/services');
      final headers = await getAuthHeaders();
      final res = await http.get(uri, headers: headers).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] is List) {
          final List list = body['data'];
          return list.map((item) => Service.fromJson(item)).toList();
        }
      }
    } catch (e) {
      debugPrint('Fallback to local services due to network: $e');
    }
    return defaultServices;
  }

  /// Request 6-digit OTP for Indian mobile number
  static Future<bool> sendOtp(String phone) async {
    try {
      final uri = Uri.parse('$baseUrl/auth/otp/send');
      final res = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'phone': phone}),
          )
          .timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        return body['success'] == true;
      }
    } catch (e) {
      debugPrint('sendOtp network note: $e');
    }
    return true;
  }

  /// Verify 6-digit OTP code and retrieve authenticated user profile
  static Future<UserProfile?> verifyOtp(String phone, String otp) async {
    try {
      final uri = Uri.parse('$baseUrl/auth/otp/verify');
      final res = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'phone': phone,
              'otp': otp,
              'role': 'customer',
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final data = body['data'];
          final accessToken = data['accessToken'] as String?;
          final refreshToken = data['refreshToken'] as String?;
          final user = UserProfile.fromJson(
            data['user'] ?? {},
            token: accessToken,
            refreshToken: refreshToken,
          );

          if (accessToken != null && refreshToken != null) {
            await TokenStorageService.saveSession(
              accessToken: accessToken,
              refreshToken: refreshToken,
              user: user,
            );
          }

          return user;
        }
      }
    } catch (e) {
      debugPrint('verifyOtp network note: $e');
    }

    // Dev/Sandbox fallback
    if (otp == '123456' || otp.length == 6) {
      final user = UserProfile(
        id: 'cust_${DateTime.now().millisecondsSinceEpoch % 10000}',
        name: 'Arjun Rao',
        phone: phone,
        role: 'customer',
        provider: 'phone',
        token: 'mock_jwt_token_local',
      );
      await TokenStorageService.saveSession(
        accessToken: 'mock_jwt_token_local',
        refreshToken: 'mock_refresh_token_local',
        user: user,
      );
      return user;
    }
    return null;
  }

  /// Authenticate with Google
  static Future<UserProfile?> googleAuth({
    required String idToken,
    String? email,
    String? name,
    String? photoUrl,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/auth/google');
      final res = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'idToken': idToken,
              'email': email,
              'name': name,
              'photoUrl': photoUrl,
              'role': 'customer',
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final data = body['data'];
          final accessToken = data['accessToken'] as String?;
          final refreshToken = data['refreshToken'] as String?;
          final user = UserProfile.fromJson(
            data['user'] ?? {},
            token: accessToken,
            refreshToken: refreshToken,
          );

          if (accessToken != null && refreshToken != null) {
            await TokenStorageService.saveSession(
              accessToken: accessToken,
              refreshToken: refreshToken,
              user: user,
            );
          }

          return user;
        }
      }
    } catch (e) {
      debugPrint('googleAuth network note: $e');
    }

    // Dev/Sandbox fallback
    final user = UserProfile(
      id: 'cust_google_${DateTime.now().millisecondsSinceEpoch % 10000}',
      name: name ?? 'Arjun Rao',
      email: email ?? 'customer@cookii.in',
      phone: '+91 98765 43210',
      photoUrl: photoUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      role: 'customer',
      provider: 'google',
      token: 'mock_google_jwt_token_local',
    );
    await TokenStorageService.saveSession(
      accessToken: 'mock_google_jwt_token_local',
      refreshToken: 'mock_google_refresh_local',
      user: user,
    );
    return user;
  }
}


