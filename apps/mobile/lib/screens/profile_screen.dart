import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/cookii_theme.dart';
import '../state/cookii_state.dart';
import '../widgets/interactive_scale.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = CookiiScope.of(context);
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: CookiiColors.canvas,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.fromLTRB(20, topPadding + 14, 20, 110),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'My Profile',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.4,
              ),
            ),
            const SizedBox(height: 20),

            // User Info Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: CookiiColors.border),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x060A2216),
                    blurRadius: 12,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: const BoxDecoration(
                      color: CookiiColors.primaryDark,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      (state.currentUser?.name ?? 'Guest')
                          .split(' ')
                          .map((w) => w.isNotEmpty ? w[0] : '')
                          .take(2)
                          .join()
                          .toUpperCase(),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              state.currentUser?.name ?? 'Guest Diner',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: CookiiColors.textHeadline,
                                letterSpacing: -0.2,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: state.isAuthenticated
                                    ? const Color(0xFFDCFCE7)
                                    : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                state.isAuthenticated
                                    ? (state.currentUser?.provider == 'google'
                                        ? 'GOOGLE'
                                        : 'VERIFIED')
                                    : 'GUEST',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: state.isAuthenticated
                                      ? const Color(0xFF166534)
                                      : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          state.currentUser?.phone ??
                              state.currentUser?.email ??
                              'Tap to sign in with phone/google',
                          style: const TextStyle(
                            fontSize: 13,
                            color: CookiiColors.textMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Lifetime Savings Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0x3310B981)),
                gradient: const LinearGradient(
                  colors: [Color(0xFFF0FDF4), Colors.white],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              LucideIcons.sparkles,
                              size: 15,
                              color: CookiiColors.primary,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'Cookii Pass Lifetime Savings',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: CookiiColors.textHeadline,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          '₹2,067',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: CookiiColors.primaryDark,
                            letterSpacing: -0.5,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Saved across 47 verified homestyle meals',
                          style: TextStyle(
                            fontSize: 12,
                            color: CookiiColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 26),

            const Text(
              'Account & Services',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),

            _buildMenuItem(
              icon: LucideIcons.wallet,
              title: 'Cookii Wallet',
              subtitle: 'Current balance: ₹${state.walletBalance}',
              onTap: () {},
            ),
            _buildMenuItem(
              icon: LucideIcons.mapPin,
              title: 'Saved Kitchen Addresses',
              subtitle: '${state.addresses.length} saved Bengaluru kitchens',
              onTap: () {},
            ),
            _buildMenuItem(
              icon: LucideIcons.heart,
              title: 'Favorite Cooks',
              subtitle: '${state.favoriteCookIds.length} partners saved',
              onTap: () {},
            ),
            _buildMenuItem(
              icon: LucideIcons.shieldAlert,
              title: 'Emergency SOS Protocol',
              subtitle: '24x7 Bengaluru doorstep security & safety',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: CookiiColors.primaryDark,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    content: const Text(
                      'Emergency dispatch active. 24x7 Bengaluru helpline: 112',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                );
              },
            ),
            _buildMenuItem(
              icon: LucideIcons.helpCircle,
              title: 'Help & Operations Support',
              subtitle: 'FAQs, refund status, live customer support',
              onTap: () {},
            ),
            const SizedBox(height: 12),
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: InteractiveScale(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: Colors.white,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    builder: (sheetCtx) => SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 40,
                              height: 4,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(height: 20),
                            const Icon(
                              LucideIcons.logOut,
                              size: 36,
                              color: Color(0xFFDC2626),
                            ),
                            const SizedBox(height: 14),
                            const Text(
                              'Sign Out from Cookii?',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: CookiiColors.textHeadline,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'You can sign back in anytime with your mobile number or Google account.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: CookiiColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              children: [
                                Expanded(
                                  child: TextButton(
                                    onPressed: () => Navigator.pop(sheetCtx),
                                    style: TextButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        side: BorderSide(color: Colors.grey.shade300),
                                      ),
                                    ),
                                    child: const Text(
                                      'Cancel',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        color: CookiiColors.textHeadline,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.pop(sheetCtx);
                                      state.logout();
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFDC2626),
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                    ),
                                    child: const Text(
                                      'Sign Out',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  child: Row(
                    children: [
                      Icon(LucideIcons.logOut, color: Color(0xFFDC2626), size: 20),
                      SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          'Sign Out / Switch Account',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                      ),
                      Icon(LucideIcons.chevronRight, color: Color(0xFFDC2626), size: 18),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: CookiiColors.border),
      ),
      child: InteractiveScale(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: CookiiColors.surfaceSubtle,
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: CookiiColors.primaryDark, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: CookiiColors.textHeadline,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: CookiiColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                LucideIcons.chevronRight,
                color: CookiiColors.textMuted,
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
