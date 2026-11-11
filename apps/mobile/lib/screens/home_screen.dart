import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/cookii_theme.dart';
import '../models/models.dart';
import '../state/cookii_state.dart';
import '../widgets/interactive_scale.dart';
import 'booking_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

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
            // Top Bar: Location & Quick Badges
            Row(
              children: [
                Expanded(
                  child: InteractiveScale(
                    onTap: () => _showAddressPicker(context, state),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: CookiiColors.border),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x080A2216),
                                blurRadius: 10,
                                offset: Offset(0, 3),
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: const Icon(
                            LucideIcons.mapPin,
                            color: CookiiColors.primary,
                            size: 19,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    state.currentAddress.label,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: CookiiColors.textHeadline,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(
                                    LucideIcons.chevronDown,
                                    size: 15,
                                    color: CookiiColors.textMuted,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                state.currentAddress.line,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
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
                ),
                const SizedBox(width: 12),

                // Wallet Badge
                InteractiveScale(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: CookiiColors.border),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x060A2216),
                          blurRadius: 12,
                          offset: Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          LucideIcons.wallet,
                          size: 15,
                          color: CookiiColors.primary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '₹${state.walletBalance}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: CookiiColors.textHeadline,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Hero Banner: Editorial Forest Luxury
            InteractiveScale(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const BookingScreen(isInstant: true),
                  ),
                );
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(26),
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF064E3B), // Deep Forest Green
                      Color(0xFF0F766E), // Muted Dark Emerald
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x24064E3B),
                      blurRadius: 22,
                      offset: Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.20),
                            ),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                LucideIcons.sparkles,
                                size: 12,
                                color: Color(0xFF6EE7B7),
                              ),
                              SizedBox(width: 6),
                              Text(
                                'BENGALURU KITCHENS',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 9,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: const Row(
                            children: [
                              Icon(
                                LucideIcons.clock,
                                size: 11,
                                color: Color(0xFFB45309),
                              ),
                              SizedBox(width: 4),
                              Text(
                                '45 MIN ARRIVAL',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFFB45309),
                                  letterSpacing: 0.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'A verified home cook,\nright at your doorstep.',
                      style: TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.25,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Fresh dosas, rotis, dal tadka & complete meal prep prepared right in your cookware.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFFD1FAE5),
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Book a Cook',
                                style: TextStyle(
                                  color: CookiiColors.primaryDark,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              SizedBox(width: 6),
                              Icon(
                                LucideIcons.arrowRight,
                                size: 14,
                                color: CookiiColors.primaryDark,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 26),

            // Mode Selector: Schedule vs Instant
            const Text(
              'Select Booking Mode',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                // Schedule Card
                Expanded(
                  child: InteractiveScale(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const BookingScreen(isInstant: false),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: CookiiColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x060A2216),
                            blurRadius: 14,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: CookiiColors.primarySoft,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            alignment: Alignment.center,
                            child: const Icon(
                              LucideIcons.calendarClock,
                              color: CookiiColors.primary,
                              size: 22,
                            ),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'Schedule',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: CookiiColors.textHeadline,
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Book slots in advance from tomorrow onwards',
                            style: TextStyle(
                              fontSize: 12,
                              color: CookiiColors.textMuted,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                // Instant Card
                Expanded(
                  child: InteractiveScale(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const BookingScreen(isInstant: true),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: CookiiColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x060A2216),
                            blurRadius: 14,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            alignment: Alignment.center,
                            child: const Icon(
                              LucideIcons.zap,
                              color: Color(0xFFD97706),
                              size: 22,
                            ),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'Instant',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: CookiiColors.textHeadline,
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Verified cook partner at door in ~45 mins',
                            style: TextStyle(
                              fontSize: 12,
                              color: CookiiColors.textMuted,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // Cookii Pass Active Banner
            InteractiveScale(
              onTap: () {},
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: const Color(0x3310B981)),
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF0FDF4), Colors.white],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: CookiiColors.primarySoft,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        LucideIcons.ticket,
                        color: CookiiColors.primary,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Cookii Pass Active',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: CookiiColors.textHeadline,
                                ),
                              ),
                              SizedBox(width: 8),
                              Text(
                                '10% OFF',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: CookiiColors.primary,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Saved ₹2,067 across 47 bookings · Valid till 27 Nov',
                            style: TextStyle(
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

            const SizedBox(height: 26),

            // Meal Service Plans
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'What do you need cooked?',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: CookiiColors.textHeadline,
                    letterSpacing: -0.2,
                  ),
                ),
                Text(
                  '${state.services.length} services',
                  style: const TextStyle(
                    fontSize: 12,
                    color: CookiiColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            SizedBox(
              height: 148,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: state.services.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (context, idx) {
                  final service = state.services[idx];
                  return InteractiveScale(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BookingScreen(
                            isInstant: false,
                            initialService: service,
                          ),
                        ),
                      );
                    },
                    child: Container(
                      width: 148,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: CookiiColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x060A2216),
                            blurRadius: 10,
                            offset: Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: CookiiColors.surfaceSubtle,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Icon(
                              service.icon,
                              color: CookiiColors.primaryDark,
                              size: 20,
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                service.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: CookiiColors.textHeadline,
                                  letterSpacing: -0.2,
                                ),
                              ),
                              const SizedBox(height: 4),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Row(
                                  children: [
                                    Text(
                                      '₹${service.basePrice}',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: CookiiColors.primary,
                                      ),
                                    ),
                                    Text(
                                      ' · ${service.estimatedMinutes}m',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: CookiiColors.textMuted,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 28),

            // Popular Verified Cooks
            const Text(
              'Verified Cooks in Bengaluru',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),

            ...seededCooks.map((cook) {
              final isFav = state.favoriteCookIds.contains(cook.id);
              return InteractiveScale(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookingScreen(
                        isInstant: false,
                        initialCookId: cook.id,
                      ),
                    ),
                  );
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: CookiiColors.border),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x060A2216),
                        blurRadius: 10,
                        offset: Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Avatar with verified badge
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Container(
                            width: 54,
                            height: 54,
                            decoration: BoxDecoration(
                              color: cook.avatarColor,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 2,
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              cook.initials,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: CookiiColors.primaryDark,
                              ),
                            ),
                          ),
                          const Positioned(
                            right: -2,
                            bottom: -2,
                            child: Icon(
                              LucideIcons.badgeCheck,
                              size: 19,
                              color: CookiiColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  cook.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: CookiiColors.textHeadline,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              cook.specialty,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 12,
                                color: CookiiColors.textMuted,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(
                                  LucideIcons.star,
                                  size: 14,
                                  color: CookiiColors.gold,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${cook.rating}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: CookiiColors.textHeadline,
                                  ),
                                ),
                                Text(
                                  ' (${cook.totalBookings} bookings) · ${cook.yearsExperience} yrs exp',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: CookiiColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          isFav ? LucideIcons.heart : LucideIcons.heart,
                          color: isFav ? CookiiColors.danger : CookiiColors.textSubtle,
                          size: 20,
                        ),
                        onPressed: () => state.toggleFavorite(cook.id),
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 18),

            // Safety & Quality Assurance Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: CookiiColors.border),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        LucideIcons.shieldCheck,
                        size: 20,
                        color: CookiiColors.primary,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'The Cookii Standard',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: CookiiColors.textHeadline,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 14),
                  Row(
                    children: [
                      Icon(
                        LucideIcons.badgeCheck,
                        size: 16,
                        color: CookiiColors.primary,
                      ),
                      SizedBox(width: 10),
                      Text(
                        '100% Background verified with police clearance',
                        style: TextStyle(fontSize: 13, color: CookiiColors.textBody),
                      ),
                    ],
                  ),
                  SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(
                        LucideIcons.sparkles,
                        size: 16,
                        color: CookiiColors.primary,
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Food safety & kitchen hygiene certified',
                        style: TextStyle(fontSize: 13, color: CookiiColors.textBody),
                      ),
                    ],
                  ),
                  SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(
                        LucideIcons.award,
                        size: 16,
                        color: CookiiColors.gold,
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Rated 4.8+ by over 10,000 Bengaluru families',
                        style: TextStyle(fontSize: 13, color: CookiiColors.textBody),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddressPicker(BuildContext context, CookiiState state) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 34),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: CookiiColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Select Kitchen Address',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: CookiiColors.textHeadline,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Cooks will prepare meals inside this home kitchen',
                style: TextStyle(
                  fontSize: 13,
                  color: CookiiColors.textMuted,
                ),
              ),
              const SizedBox(height: 18),
              ...state.addresses.map((addr) {
                return Material(
                  color: Colors.transparent,
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 4),
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: addr.isSelected
                            ? CookiiColors.primarySoft
                            : CookiiColors.surfaceSubtle,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        LucideIcons.mapPin,
                        color: addr.isSelected
                            ? CookiiColors.primary
                            : CookiiColors.textMuted,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      addr.label,
                      style: TextStyle(
                        fontWeight: addr.isSelected ? FontWeight.w700 : FontWeight.w600,
                        color: CookiiColors.textHeadline,
                        fontSize: 15,
                      ),
                    ),
                    subtitle: Text(
                      '${addr.line} · ${addr.landmark}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: CookiiColors.textMuted,
                      ),
                    ),
                    trailing: addr.isSelected
                        ? const Icon(LucideIcons.check, color: CookiiColors.primary, size: 20)
                        : null,
                    onTap: () {
                      state.selectAddress(addr.id);
                      Navigator.pop(ctx);
                    },
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}
