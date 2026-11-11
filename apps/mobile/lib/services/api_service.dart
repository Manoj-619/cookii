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
}

