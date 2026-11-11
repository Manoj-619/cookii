import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/cookii_theme.dart';
import '../models/models.dart';
import '../state/cookii_state.dart';
import '../widgets/interactive_scale.dart';
import 'booking_screen.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  String _activeTab = 'upcoming';

  @override
  Widget build(BuildContext context) {
    final state = CookiiScope.of(context);
    final topPadding = MediaQuery.of(context).padding.top;
    final filteredBookings =
        state.bookings.where((b) => b.status == _activeTab).toList();

    return Scaffold(
      backgroundColor: CookiiColors.canvas,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.fromLTRB(20, topPadding + 14, 20, 110),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'My Bookings',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.4,
              ),
            ),
            const SizedBox(height: 18),

            // Segmented Tab Filter
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: CookiiColors.border),
              ),
              child: Row(
                children: [
                  _buildSegmentItem('upcoming', 'Upcoming', LucideIcons.calendarClock),
                  _buildSegmentItem('completed', 'Completed', LucideIcons.checkCheck),
                  _buildSegmentItem('cancelled', 'Cancelled', LucideIcons.xCircle),
                ],
              ),
            ),

            const SizedBox(height: 20),

            if (filteredBookings.isEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
                alignment: Alignment.center,
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: CookiiColors.surfaceSubtle,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        LucideIcons.chefHat,
                        size: 32,
                        color: CookiiColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'No $_activeTab bookings',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: CookiiColors.textHeadline,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Book a verified cook partner to prepare fresh meals in your home.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: CookiiColors.textMuted,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 22),
                    InteractiveScale(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const BookingScreen(isInstant: false),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 22,
                          vertical: 14,
                        ),
                        decoration: BoxDecoration(
                          color: CookiiColors.primaryDark,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.plus, size: 16, color: Colors.white),
                            SizedBox(width: 8),
                            Text(
                              'Book a Cook Now',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              ...filteredBookings.map((b) => _buildBookingCard(context, state, b)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentItem(String key, String label, IconData icon) {
    final isSelected = _activeTab == key;
    return Expanded(
      child: InteractiveScale(
        onTap: () => setState(() => _activeTab = key),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? CookiiColors.primaryDark : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected ? Colors.white : CookiiColors.textMuted,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? Colors.white : CookiiColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBookingCard(
      BuildContext context, CookiiState state, Booking booking) {
    Color statusBg = CookiiColors.primarySoft;
    Color statusColor = CookiiColors.primary;
    if (booking.status == 'cancelled') {
      statusBg = CookiiColors.dangerBg;
      statusColor = CookiiColors.danger;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: CookiiColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x060A2216),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    booking.cookName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: CookiiColors.textHeadline,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    LucideIcons.badgeCheck,
                    size: 16,
                    color: CookiiColors.primary,
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  booking.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: statusColor,
                    letterSpacing: 0.4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                LucideIcons.calendar,
                size: 14,
                color: CookiiColors.textMuted,
              ),
              const SizedBox(width: 6),
              Text(
                '${booking.date} · ${booking.startTime} (${booking.durationMinutes} min)',
                style: const TextStyle(
                  fontSize: 13,
                  color: CookiiColors.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(
                LucideIcons.utensils,
                size: 14,
                color: CookiiColors.textMuted,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  booking.mealTypes.join(', '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    color: CookiiColors.textBody,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: CookiiColors.borderLight, height: 1),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#${booking.id}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: CookiiColors.textMuted,
                ),
              ),
              Text(
                '₹${booking.amountPaid}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: CookiiColors.primary,
                ),
              ),
            ],
          ),
          if (booking.status == 'upcoming') ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: InteractiveScale(
                    onTap: () => _confirmCancel(context, state, booking.id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: CookiiColors.dangerBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: CookiiColors.danger.withValues(alpha: 0.2),
                        ),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Cancel Booking',
                        style: TextStyle(
                          color: CookiiColors.danger,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ] else if (booking.status == 'completed') ...[
            const SizedBox(height: 14),
            Row(
              children: [
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
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: CookiiColors.primarySoft,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: CookiiColors.primary.withValues(alpha: 0.2),
                        ),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Rebook Partner',
                        style: TextStyle(
                          color: CookiiColors.primaryDark,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  void _confirmCancel(BuildContext context, CookiiState state, String bookingId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text(
          'Cancel Booking?',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        content: const Text(
          'Are you sure you want to cancel this booking? Cancellation is 100% free before the cook partner departs.',
          style: TextStyle(fontSize: 14, color: CookiiColors.textBody),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Booking'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: CookiiColors.danger,
            ),
            onPressed: () {
              state.cancelBooking(bookingId);
              Navigator.pop(ctx);
            },
            child: const Text('Confirm Cancel'),
          ),
        ],
      ),
    );
  }
}
