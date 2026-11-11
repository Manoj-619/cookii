import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/cookii_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: CookiiPartnerApp(),
    ),
  );
}

class CookiiPartnerApp extends StatelessWidget {
  const CookiiPartnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cookii Partner — Bengaluru',
      debugShowCheckedModeBanner: false,
      theme: CookiiTheme.lightTheme,
      home: const CookPartnerHomeScreen(),
    );
  }
}

class CookPartnerHomeScreen extends StatefulWidget {
  const CookPartnerHomeScreen({super.key});

  @override
  State<CookPartnerHomeScreen> createState() => _CookPartnerHomeScreenState();
}

class _CookPartnerHomeScreenState extends State<CookPartnerHomeScreen> {
  bool isOnline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Partner Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Online / Offline Status Toggle Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isOnline ? CookiiPalette.freshGreenSubtle : CookiiPalette.subtleLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isOnline ? const Color(0xFFBBF7D0) : CookiiPalette.borderSubtleLight,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isOnline ? 'You are Online' : 'You are Offline',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isOnline ? CookiiPalette.freshGreen : CookiiPalette.textSecondaryLight,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isOnline ? 'Ready to receive jobs in Koramangala' : 'Toggle switch to receive jobs',
                      style: const TextStyle(fontSize: 12, color: CookiiPalette.textSecondaryLight),
                    ),
                  ],
                ),
                Switch(
                  value: isOnline,
                  activeColor: CookiiPalette.freshGreen,
                  onChanged: (val) {
                    setState(() {
                      isOnline = val;
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Daily Earnings Card
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
                const Text(
                  'Today\'s Earnings',
                  style: TextStyle(fontSize: 13, color: CookiiPalette.textSecondaryLight),
                ),
                const SizedBox(height: 6),
                const Text(
                  '₹1,850.00',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: CookiiPalette.textPrimaryLight),
                ),
                const SizedBox(height: 4),
                const Text(
                  '4 bookings completed today • 4.92 ★ rating',
                  style: TextStyle(fontSize: 12, color: CookiiPalette.freshGreen, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

