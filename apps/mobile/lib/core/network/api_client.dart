import 'package:dio/dio.dart';

class ApiClient {
  static const String defaultBaseUrl = 'http://10.0.2.2:4000/api/v1'; // Android emulator localhost

  late final Dio dio;

  ApiClient({String baseUrl = defaultBaseUrl}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Injected auth token / correlation id
          options.headers['x-client-platform'] = 'mobile-flutter';
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          // Standardized error handling
          return handler.next(error);
        },
      ),
    );
  }
}

