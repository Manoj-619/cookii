import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/cookii_theme.dart';
import '../services/api_service.dart';
import '../state/cookii_state.dart';
import '../widgets/interactive_scale.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onLoginSuccess;

  const LoginScreen({super.key, this.onLoginSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());

  bool _isOtpSent = false;
  bool _isLoading = false;
  bool _isGoogleLoading = false;
  int _resendCountdown = 30;
  Timer? _timer;

  @override
  void dispose() {
    _phoneController.dispose();
    for (var c in _otpControllers) {
      c.dispose();
    }
    for (var f in _otpFocusNodes) {
      f.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _resendCountdown = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendCountdown > 1) {
        setState(() => _resendCountdown--);
      } else {
        t.cancel();
        setState(() => _resendCountdown = 0);
      }
    });
  }

  Future<void> _handleSendOtp() async {
    final phone = _phoneController.text.trim().replaceAll(' ', '');
    if (phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please enter a valid 10-digit mobile number'),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final formattedPhone = '+91$phone';
    await ApiService.sendOtp(formattedPhone);

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _isOtpSent = true;
    });
    _startTimer();
    _otpFocusNodes[0].requestFocus();
  }

  Future<void> _handleVerifyOtp() async {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please enter all 6 digits of the OTP code'),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final phone = '+91${_phoneController.text.trim().replaceAll(' ', '')}';
    final user = await ApiService.verifyOtp(phone, otp);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (user != null) {
      final state = CookiiScope.of(context);
      state.setUser(user);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: CookiiColors.primaryDark,
          behavior: SnackBarBehavior.floating,
          content: Row(
            children: [
              const Icon(LucideIcons.badgeCheck, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Text('Welcome back, ${user.name}!'),
            ],
          ),
        ),
      );

      widget.onLoginSuccess?.call();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Invalid OTP code. Try 123456 in dev/test mode.'),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isGoogleLoading = true);
    await Future.delayed(const Duration(milliseconds: 650));

    final user = await ApiService.googleAuth(
      idToken: 'google_id_token_${DateTime.now().millisecondsSinceEpoch}',
      name: 'Arjun Rao',
      email: 'arjun.rao@gmail.com',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    );

    if (!mounted) return;
    setState(() => _isGoogleLoading = false);

    if (user != null) {
      final state = CookiiScope.of(context);
      state.setUser(user);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: CookiiColors.primaryDark,
          behavior: SnackBarBehavior.floating,
          content: Row(
            children: [
              const Icon(LucideIcons.badgeCheck, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Text('Signed in with Google as ${user.name}'),
            ],
          ),
        ),
      );

      widget.onLoginSuccess?.call();
    }
  }

  void _handleGuestExplore() {
    final state = CookiiScope.of(context);
    state.loginAsGuest();
    widget.onLoginSuccess?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CookiiColors.canvas,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),

              // Editorial Brand Header
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [CookiiColors.primary, CookiiColors.primaryDark],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x33064E3B),
                            blurRadius: 20,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        LucideIcons.chefHat,
                        color: Colors.white,
                        size: 38,
                      ),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'Cookii',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: CookiiColors.primaryDark,
                        letterSpacing: -1.0,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Artisanal Home Cooks, On Demand\nBengaluru, India',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: CookiiColors.textMuted,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 38),

              // Animated Switcher: Mobile Phone Entry vs. 6-Digit OTP Entry
              AnimatedCrossFade(
                duration: const Duration(milliseconds: 320),
                crossFadeState: _isOtpSent
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                firstChild: _buildPhoneInputCard(),
                secondChild: _buildOtpInputCard(),
              ),

              const SizedBox(height: 28),

              // Divider
              Row(
                children: [
                  Expanded(child: Divider(color: Colors.grey.shade300)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'OR CONTINUE WITH',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
                  Expanded(child: Divider(color: Colors.grey.shade300)),
                ],
              ),

              const SizedBox(height: 24),

              // Google Sign-In Button
              InteractiveScale(
                onTap: _isGoogleLoading ? null : _handleGoogleSignIn,
                child: Container(
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0F000000),
                        blurRadius: 10,
                        offset: Offset(0, 3),
                      ),
                    ],
                  ),
                  child: _isGoogleLoading
                      ? const Center(
                          child: SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Official Google G Mark Icon
                            _buildGoogleGLogo(),
                            const SizedBox(width: 12),
                            const Text(
                              'Sign in with Google',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF1E293B),
                                letterSpacing: -0.1,
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 24),

              // Explore as Guest Button
              Center(
                child: TextButton.icon(
                  onPressed: _handleGuestExplore,
                  icon: const Icon(LucideIcons.compass, size: 16, color: CookiiColors.primary),
                  label: const Text(
                    'Explore Cooks & Menus as Guest',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: CookiiColors.primary,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // Trust & Security Notice
              const Text(
                'By signing in, you agree to Cookii\'s Terms of Service and Privacy Policy.\nYour data is protected with 256-bit encryption.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  color: CookiiColors.textMuted,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhoneInputCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08064E3B),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Login with Mobile',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: CookiiColors.textHeadline,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'We will send a 6-digit verification code to your number.',
            style: TextStyle(
              fontSize: 13,
              color: CookiiColors.textMuted,
            ),
          ),
          const SizedBox(height: 20),

          // Phone Number Field
          Container(
            height: 54,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFCBD5E1)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: const Row(
                    children: [
                      Text(
                        '🇮🇳 +91',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: CookiiColors.textHeadline,
                        ),
                      ),
                      SizedBox(width: 8),
                      SizedBox(
                        height: 24,
                        child: VerticalDivider(color: Color(0xFFCBD5E1)),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(10),
                    ],
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: CookiiColors.textHeadline,
                      letterSpacing: 1.2,
                    ),
                    decoration: const InputDecoration(
                      hintText: '98765 43210',
                      hintStyle: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 0.5,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.only(right: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Submit Button
          InteractiveScale(
            onTap: _isLoading ? null : _handleSendOtp,
            child: Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                color: CookiiColors.primaryDark,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x28064E3B),
                    blurRadius: 14,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Send Verification Code',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 0.1,
                          ),
                        ),
                        SizedBox(width: 8),
                        Icon(LucideIcons.arrowRight, size: 16, color: Colors.white),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpInputCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08064E3B),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Enter 6-Digit OTP',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: CookiiColors.textHeadline,
                  letterSpacing: -0.3,
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() => _isOtpSent = false);
                },
                child: const Text(
                  'Change Phone',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: CookiiColors.primary,
                  ),
                ),
              ),
            ],
          ),
          Text(
            'Sent to +91 ${_phoneController.text.trim()}',
            style: const TextStyle(
              fontSize: 13,
              color: CookiiColors.textMuted,
            ),
          ),
          const SizedBox(height: 20),

          // 6 OTP Digit Boxes
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (index) {
              return SizedBox(
                width: 44,
                height: 52,
                child: TextField(
                  controller: _otpControllers[index],
                  focusNode: _otpFocusNodes[index],
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: CookiiColors.primaryDark,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(1),
                  ],
                  decoration: InputDecoration(
                    contentPadding: EdgeInsets.zero,
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: CookiiColors.primary,
                        width: 2,
                      ),
                    ),
                  ),
                  onChanged: (value) {
                    if (value.isNotEmpty && index < 5) {
                      _otpFocusNodes[index + 1].requestFocus();
                    } else if (value.isEmpty && index > 0) {
                      _otpFocusNodes[index - 1].requestFocus();
                    }
                    if (index == 5 && value.isNotEmpty) {
                      _handleVerifyOtp();
                    }
                  },
                ),
              );
            }),
          ),

          const SizedBox(height: 18),

          // Resend Timer & Sandbox Code Hint
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Demo code: 123456',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF166534),
                  ),
                ),
              ),
              _resendCountdown > 0
                  ? Text(
                      'Resend in ${_resendCountdown}s',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: CookiiColors.textMuted,
                      ),
                    )
                  : TextButton(
                      onPressed: _handleSendOtp,
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Resend OTP',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: CookiiColors.primary,
                        ),
                      ),
                    ),
            ],
          ),

          const SizedBox(height: 18),

          // Verify Button
          InteractiveScale(
            onTap: _isLoading ? null : _handleVerifyOtp,
            child: Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                color: CookiiColors.primaryDark,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x28064E3B),
                    blurRadius: 14,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'Verify & Continue',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.1,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGoogleGLogo() {
    return Container(
      width: 22,
      height: 22,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Text(
            'G',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              fontFamily: 'Roboto',
              foreground: Paint()
                ..shader = const LinearGradient(
                  colors: [
                    Color(0xFF4285F4), // Blue
                    Color(0xFF34A853), // Green
                    Color(0xFFFBBC05), // Yellow
                    Color(0xFFEA4335), // Red
                  ],
                ).createShader(const Rect.fromLTWH(0, 0, 22, 22)),
            ),
          ),
        ],
      ),
    );
  }
}

