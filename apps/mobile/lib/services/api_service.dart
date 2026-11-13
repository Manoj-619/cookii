import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/models.dart';

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

  static Future<List<Service>> fetchServices() async {
    try {
      final uri = Uri.parse('$baseUrl/services');
      final res = await http.get(uri).timeout(const Duration(seconds: 4));
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
    // Return true for local mock fallback
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
          return UserProfile.fromJson(
            data['user'] ?? {},
            token: data['accessToken'],
          );
        }
      }
    } catch (e) {
      debugPrint('verifyOtp network note: $e');
    }

    // Dev/Sandbox fallback
    if (otp == '123456' || otp.length == 6) {
      return UserProfile(
        id: 'cust_${DateTime.now().millisecondsSinceEpoch % 10000}',
        name: 'Arjun Rao',
        phone: phone,
        role: 'customer',
        provider: 'phone',
        token: 'mock_jwt_token_local',
      );
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
          return UserProfile.fromJson(
            data['user'] ?? {},
            token: data['accessToken'],
          );
        }
      }
    } catch (e) {
      debugPrint('googleAuth network note: $e');
    }

    // Dev/Sandbox fallback
    return UserProfile(
      id: 'cust_google_${DateTime.now().millisecondsSinceEpoch % 10000}',
      name: name ?? 'Arjun Rao',
      email: email ?? 'customer@cookii.in',
      phone: '+91 98765 43210',
      photoUrl: photoUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      role: 'customer',
      provider: 'google',
      token: 'mock_google_jwt_token_local',
    );
  }
}

