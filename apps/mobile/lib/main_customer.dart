import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/cookii_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: CookiiCustomerApp(),
    ),
  );
}

class CookiiCustomerApp extends StatelessWidget {
  const CookiiCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cookii — Home Cook Booking',
      debugShowCheckedModeBanner: false,
      theme: CookiiTheme.lightTheme,
      home: const CustomerHomeScreen(),
    );
  }
}

class CustomerHomeScreen extends StatelessWidget {
  const CustomerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.location_on, color: CookiiPalette.brandPrimary, size: 20),
            SizedBox(width: 6),
            Text(
              '4th Block, Koramangala',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
            Icon(Icons.keyboard_arrow_down, size: 18),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Hero Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: CookiiPalette.cardLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: CookiiPalette.borderSubtleLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: CookiiPalette.brandPrimarySubtle,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Bengaluru Fresh Kitchen',
                    style: TextStyle(
                      color: CookiiPalette.brandPrimary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Book a verified home cook in 45 mins',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: CookiiPalette.textPrimaryLight,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Dosas, Ragi Mudde, Dal Tadka, Rotis & more made fresh right in your kitchen.',
                  style: TextStyle(
                    fontSize: 14,
                    color: CookiiPalette.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Book a Cook Now'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

