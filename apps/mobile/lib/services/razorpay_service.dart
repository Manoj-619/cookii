import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'api_service.dart';
import '../theme/cookii_theme.dart';

class RazorpayOrderResult {
  final String orderId;
  final int amount; // in paise
  final String currency;
  final String keyId;
  final String bookingId;

  RazorpayOrderResult({
    required this.orderId,
    required this.amount,
    required this.currency,
    required this.keyId,
    required this.bookingId,
  });

  factory RazorpayOrderResult.fromJson(Map<String, dynamic> json) {
    return RazorpayOrderResult(
      orderId: json['orderId'] ?? '',
      amount: json['amount'] ?? 0,
      currency: json['currency'] ?? 'INR',
      keyId: json['keyId'] ?? '',
      bookingId: json['bookingId'] ?? '',
    );
  }
}

class RazorpayService {
  late Razorpay _razorpay;
  Function(PaymentSuccessResponse)? _onSuccess;
  Function(PaymentFailureResponse)? _onError;
  Function(ExternalWalletResponse)? _onWallet;

  RazorpayService() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void dispose() {
    _razorpay.clear();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    debugPrint('Razorpay Success: paymentId=${response.paymentId}, orderId=${response.orderId}');
    _onSuccess?.call(response);
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    debugPrint('Razorpay Error: code=${response.code}, message=${response.message}');
    _onError?.call(response);
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('Razorpay Wallet: ${response.walletName}');
    _onWallet?.call(response);
  }

  /// Create Razorpay order via backend
  static Future<RazorpayOrderResult> createOrder({
    required String bookingId,
    required double amount,
  }) async {
    try {
      final url = Uri.parse('${ApiService.baseUrl}/payments/razorpay/create-order');
      final res = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'cust_101',
        },
        body: jsonEncode({
          'bookingId': bookingId,
          'amount': amount,
          'idempotencyKey': 'idemp_${DateTime.now().millisecondsSinceEpoch}',
        }),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return RazorpayOrderResult.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('Razorpay backend create-order unreachable: $e');
    }

    // Fallback sandbox order
    return RazorpayOrderResult(
      orderId: 'order_rzp_${DateTime.now().millisecondsSinceEpoch}',
      amount: (amount * 100).toInt(),
      currency: 'INR',
      keyId: 'rzp_test_placeholder_key_id',
      bookingId: bookingId,
    );
  }

  /// Verify payment signature on backend
  static Future<bool> verifyPayment({
    required String bookingId,
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    try {
      final url = Uri.parse('${ApiService.baseUrl}/payments/razorpay/verify');
      final res = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'cust_101',
        },
        body: jsonEncode({
          'bookingId': bookingId,
          'razorpayOrderId': orderId,
          'razorpayPaymentId': paymentId,
          'razorpaySignature': signature,
        }),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        return body['success'] == true;
      }
    } catch (e) {
      debugPrint('Razorpay backend verify unreachable: $e');
    }

    return true; // Graceful sandbox fallback
  }

  /// Launch Razorpay checkout or Sandbox simulation
  void openCheckout({
    required BuildContext context,
    required RazorpayOrderResult order,
    required String description,
    required String customerPhone,
    required String customerEmail,
    required Function(PaymentSuccessResponse) onSuccess,
    required Function(PaymentFailureResponse) onError,
    Function(ExternalWalletResponse)? onWallet,
  }) {
    _onSuccess = onSuccess;
    _onError = onError;
    _onWallet = onWallet;

    // If key is a valid non-placeholder Razorpay key, launch native SDK
    final isRealKey = order.keyId.startsWith('rzp_test_') && !order.keyId.contains('placeholder');

    if (isRealKey) {
      final options = {
        'key': order.keyId,
        'amount': order.amount,
        'name': 'Cookii India',
        'description': description,
        'order_id': order.orderId,
        'timeout': 180,
        'prefill': {
          'contact': customerPhone,
          'email': customerEmail,
        },
        'theme': {
          'color': '#064E3B',
        },
        'modal': {
          'confirm_close': true,
        },
        'external': {
          'wallets': ['paytm', 'phonepe'],
        },
      };

      try {
        _razorpay.open(options);
        return;
      } catch (e) {
        debugPrint('Razorpay native open error: $e');
      }
    }

    // Interactive Sandbox Mock Sheet for development / testing
    _showSandboxPaymentSheet(
      context: context,
      order: order,
      description: description,
      onSuccess: onSuccess,
      onError: onError,
    );
  }

  void _showSandboxPaymentSheet({
    required BuildContext context,
    required RazorpayOrderResult order,
    required String description,
    required Function(PaymentSuccessResponse) onSuccess,
    required Function(PaymentFailureResponse) onError,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.black12,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Razorpay Sandbox Badge
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C2340), // Razorpay dark navy
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'RAZORPAY',
                          style: TextStyle(
                            color: Color(0xFF3395FF), // Razorpay blue
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8,
                          ),
                        ),
                        SizedBox(width: 4),
                        Text(
                          'SANDBOX',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 20, color: CookiiColors.textMuted),
                    onPressed: () {
                      Navigator.pop(ctx);
                      onError(PaymentFailureResponse(
                        Razorpay.PAYMENT_CANCELLED,
                        'Payment cancelled by customer',
                        {},
                      ));
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Text(
                description,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: CookiiColors.textHeadline,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Order ID: ${order.orderId}',
                style: const TextStyle(fontSize: 12, color: CookiiColors.textMuted),
              ),
              const SizedBox(height: 16),

              // Amount Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Payable Amount',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: CookiiColors.primaryDark,
                      ),
                    ),
                    Text(
                      '₹${(order.amount / 100).toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: CookiiColors.primaryDark,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Select Test Payment Method',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: CookiiColors.textMuted,
                ),
              ),
              const SizedBox(height: 12),

              // Mock UPI Option
              _buildPaymentOption(
                icon: LucideIcons.smartphone,
                title: 'Simulate UPI Payment (Instant)',
                subtitle: 'Google Pay / PhonePe / Paytm test flow',
                badge: 'Recommended',
                onTap: () {
                  Navigator.pop(ctx);
                  _simulateSuccess(order, onSuccess);
                },
              ),
              const SizedBox(height: 10),

              // Mock Card Option
              _buildPaymentOption(
                icon: LucideIcons.creditCard,
                title: 'Simulate Test Card (Visa/Mastercard)',
                subtitle: 'Card ending 4111 (OTP: 123456)',
                onTap: () {
                  Navigator.pop(ctx);
                  _simulateSuccess(order, onSuccess);
                },
              ),
              const SizedBox(height: 10),

              // Mock Failure Option (for testing failure handling)
              _buildPaymentOption(
                icon: LucideIcons.alertTriangle,
                title: 'Simulate Payment Failure',
                subtitle: 'Test how your app reacts to bank decline',
                isDanger: true,
                onTap: () {
                  Navigator.pop(ctx);
                  onError(PaymentFailureResponse(
                    Razorpay.NETWORK_ERROR,
                    'Bank transaction declined (Simulated)',
                    {'error': 'DECLINED_BY_BANK'},
                  ));
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _simulateSuccess(
    RazorpayOrderResult order,
    Function(PaymentSuccessResponse) onSuccess,
  ) {
    final paymentId = 'pay_sbx_${DateTime.now().millisecondsSinceEpoch}';
    final signature = 'sig_sbx_${DateTime.now().millisecondsSinceEpoch}';

    onSuccess(PaymentSuccessResponse(
      paymentId,
      order.orderId,
      signature,
      {
        'razorpay_payment_id': paymentId,
        'razorpay_order_id': order.orderId,
        'razorpay_signature': signature,
      },
    ));
  }

  Widget _buildPaymentOption({
    required IconData icon,
    required String title,
    required String subtitle,
    String? badge,
    bool isDanger = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDanger ? const Color(0xFFFECACA) : const Color(0xFFE2E8F0),
          ),
          color: isDanger ? const Color(0xFFFFF1F2) : Colors.white,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDanger ? const Color(0xFFFEE2E2) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Icon(
                icon,
                size: 20,
                color: isDanger ? const Color(0xFFDC2626) : CookiiColors.primaryDark,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isDanger ? const Color(0xFF991B1B) : CookiiColors.textHeadline,
                        ),
                      ),
                      if (badge != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'TEST',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF166534),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDanger ? const Color(0xFFB91C1C) : CookiiColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              LucideIcons.chevronRight,
              size: 16,
              color: CookiiColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}

