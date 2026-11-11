import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/cookii_theme.dart';
import '../models/models.dart';
import '../state/cookii_state.dart';
import '../widgets/interactive_scale.dart';

class BookingScreen extends StatefulWidget {
  final bool isInstant;
  final Service? initialService;
  final String? initialCookId;

  const BookingScreen({
    super.key,
    required this.isInstant,
    this.initialService,
    this.initialCookId,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late String _selectedDate;
  late String _selectedTimeSlot;
  late String _selectedServiceId;
  late String _selectedCookId;
  bool _isSubmitting = false;

  final List<String> _slots = [
    '7:30 AM',
    '8:30 AM',
    '12:30 PM',
    '1:30 PM',
    '7:00 PM',
    '8:00 PM',
  ];

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.isInstant ? 'Today (Instant)' : 'Tomorrow, 12 Nov';
    _selectedTimeSlot = widget.isInstant ? 'Within 45 mins' : _slots[0];
    _selectedServiceId = widget.initialService?.id ?? 'srv_breakfast';
    _selectedCookId = widget.initialCookId ?? 'cook_101';
  }

  @override
  Widget build(BuildContext context) {
    final state = CookiiScope.of(context);
    final service = state.services.firstWhere(
      (s) => s.id == _selectedServiceId,
      orElse: () => state.services.first,
    );
    final cook = seededCooks.firstWhere(
      (c) => c.id == _selectedCookId,
      orElse: () => seededCooks.first,
    );

    final baseFare = service.basePrice;
    const platformFee = 29;
    const passDiscount = 30;
    final total = baseFare + platformFee - passDiscount;

    return Scaffold(
      backgroundColor: CookiiColors.canvas,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.isInstant ? 'Instant Cook Booking' : 'Schedule a Cook',
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Announcement Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: widget.isInstant
                    ? const Color(0xFFFEF3C7)
                    : CookiiColors.primarySoft,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: widget.isInstant
                      ? const Color(0x66F59E0B)
                      : const Color(0x3310B981),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      widget.isInstant
                          ? LucideIcons.zap
                          : LucideIcons.calendarClock,
                      color: widget.isInstant
                          ? const Color(0xFFD97706)
                          : CookiiColors.primary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.isInstant
                              ? 'Cook Partner Arriving in ~45 Mins'
                              : 'Scheduled Cook Partner Service',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: CookiiColors.textHeadline,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Destination: ${state.currentAddress.label}',
                          style: const TextStyle(
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

            const SizedBox(height: 24),

            // Select Service Type
            const Text(
              'Select Meal Service',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: state.services.map((s) {
                final isSelected = s.id == _selectedServiceId;
                return InteractiveScale(
                  onTap: () => setState(() => _selectedServiceId = s.id),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? CookiiColors.primaryDark : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? CookiiColors.primaryDark : CookiiColors.border,
                        width: 1.5,
                      ),
                      boxShadow: isSelected
                          ? const [
                              BoxShadow(
                                color: Color(0x20064E3B),
                                blurRadius: 10,
                                offset: Offset(0, 3),
                              ),
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          s.icon,
                          size: 15,
                          color: isSelected ? Colors.white : CookiiColors.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          s.title,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                            color: isSelected ? Colors.white : CookiiColors.textHeadline,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '₹${s.basePrice}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isSelected
                                ? const Color(0xFF6EE7B7)
                                : CookiiColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            // Select Time Slot (if not instant)
            if (!widget.isInstant) ...[
              const Text(
                'Available Time Slots',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: CookiiColors.textHeadline,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _slots.map((slot) {
                  final isSelected = slot == _selectedTimeSlot;
                  return InteractiveScale(
                    onTap: () => setState(() => _selectedTimeSlot = slot),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? CookiiColors.primarySoft : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? CookiiColors.primary : CookiiColors.border,
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            LucideIcons.clock,
                            size: 13,
                            color: isSelected
                                ? CookiiColors.primary
                                : CookiiColors.textMuted,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            slot,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                              color: isSelected
                                  ? CookiiColors.primaryDark
                                  : CookiiColors.textHeadline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
            ],

            // Select Cook Partner
            const Text(
              'Select Verified Cook Partner',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: CookiiColors.textHeadline,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),

            ...seededCooks.map((c) {
              final isSelected = c.id == _selectedCookId;
              return InteractiveScale(
                onTap: () => setState(() => _selectedCookId = c.id),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? CookiiColors.primary : CookiiColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? const [
                            BoxShadow(
                              color: Color(0x10059669),
                              blurRadius: 12,
                              offset: Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: c.avatarColor,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          c.initials,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: CookiiColors.primaryDark,
                          ),
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
                                  c.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15,
                                    color: CookiiColors.textHeadline,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  LucideIcons.badgeCheck,
                                  size: 15,
                                  color: CookiiColors.primary,
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '⭐ ${c.rating} · ${c.cuisines.first}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: CookiiColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected
                                ? CookiiColors.primary
                                : CookiiColors.textSubtle,
                            width: 2,
                          ),
                          color: isSelected ? CookiiColors.primary : Colors.transparent,
                        ),
                        alignment: Alignment.center,
                        child: isSelected
                            ? const Icon(LucideIcons.check, size: 13, color: Colors.white)
                            : null,
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 20),

            // Fare Breakdown
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: CookiiColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        LucideIcons.receipt,
                        size: 17,
                        color: CookiiColors.textHeadline,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Fare Breakdown',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: CookiiColors.textHeadline,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildFareRow(service.title, '₹$baseFare'),
                  _buildFareRow('Hygiene Kit & Platform Fee', '₹$platformFee'),
                  _buildFareRow(
                    'Cookii Pass Savings',
                    '-₹$passDiscount',
                    isHighlight: true,
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(color: CookiiColors.borderLight, height: 1),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Payable',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: CookiiColors.textHeadline,
                        ),
                      ),
                      Text(
                        '₹$total',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: CookiiColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Confirm Button
            InteractiveScale(
              onTap: _isSubmitting
                  ? null
                  : () async {
                      final messenger = ScaffoldMessenger.of(context);
                      final navigator = Navigator.of(context);
                      setState(() => _isSubmitting = true);
                      await Future.delayed(const Duration(milliseconds: 650));

                      final newBooking = Booking(
                        id: 'BK-${DateTime.now().millisecondsSinceEpoch % 100000}',
                        cookName: cook.name,
                        cookId: cook.id,
                        date: _selectedDate,
                        startTime: _selectedTimeSlot,
                        durationMinutes: service.estimatedMinutes,
                        amountPaid: total,
                        savings: passDiscount,
                        status: 'upcoming',
                        mealTypes: [service.title],
                        addressLine: state.currentAddress.line,
                        paymentRef: 'UPI_SIM_${DateTime.now().millisecondsSinceEpoch % 10000}',
                      );
                      state.addBooking(newBooking);

                      messenger.showSnackBar(
                        SnackBar(
                          backgroundColor: CookiiColors.primaryDark,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          content: Row(
                            children: [
                              const Icon(
                                LucideIcons.badgeCheck,
                                color: Colors.white,
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Text(
                                'Booking confirmed with ${cook.name}!',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      );
                      navigator.pop();
                    },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  color: CookiiColors.primaryDark,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x28064E3B),
                      blurRadius: 18,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            LucideIcons.check,
                            color: Colors.white,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Confirm & Pay ₹$total',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.1,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFareRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: isHighlight ? CookiiColors.primary : CookiiColors.textMuted,
              fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
              color: isHighlight ? CookiiColors.primary : CookiiColors.textHeadline,
            ),
          ),
        ],
      ),
    );
  }
}
