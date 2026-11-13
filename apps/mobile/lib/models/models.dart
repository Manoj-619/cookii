import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class Cook {
  final String id;
  final String name;
  final String initials;
  final double rating;
  final int totalBookings;
  final int yearsExperience;
  final List<String> cuisines;
  final List<String> languages;
  final String bio;
  final Color avatarColor;
  final bool isVerified;
  final String specialty;

  const Cook({
    required this.id,
    required this.name,
    required this.initials,
    required this.rating,
    required this.totalBookings,
    required this.yearsExperience,
    required this.cuisines,
    required this.languages,
    required this.bio,
    required this.avatarColor,
    required this.specialty,
    this.isVerified = true,
  });
}

class Service {
  final String id;
  final String type;
  final String title;
  final String tagline;
  final int basePrice;
  final int estimatedMinutes;
  final IconData icon;
  final String badge;

  const Service({
    required this.id,
    required this.type,
    required this.title,
    required this.tagline,
    required this.basePrice,
    required this.estimatedMinutes,
    required this.icon,
    required this.badge,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    IconData icon = LucideIcons.utensils;
    final type = json['type'] as String? ?? '';
    if (type == 'BREAKFAST') icon = LucideIcons.coffee;
    if (type == 'LUNCH') icon = LucideIcons.sun;
    if (type == 'DINNER') icon = LucideIcons.moon;
    if (type == 'FULL_DAY') icon = LucideIcons.chefHat;

    return Service(
      id: json['id'] as String? ?? 'srv_custom',
      type: type,
      title: json['title'] as String? ?? 'Home Cook Service',
      tagline: json['tagline'] as String? ?? 'Freshly prepared homestyle food',
      basePrice: (json['basePrice'] as num?)?.toInt() ?? 299,
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt() ?? 60,
      icon: icon,
      badge: json['badge'] as String? ?? 'Bengaluru Favorite',
    );
  }
}

class Booking {
  final String id;
  final String cookName;
  final String cookId;
  final String date;
  final String startTime;
  final int durationMinutes;
  final int amountPaid;
  final int savings;
  final String status; // 'upcoming', 'completed', 'cancelled'
  final List<String> mealTypes;
  final String addressLine;
  final String paymentRef;

  const Booking({
    required this.id,
    required this.cookName,
    required this.cookId,
    required this.date,
    required this.startTime,
    required this.durationMinutes,
    required this.amountPaid,
    required this.savings,
    required this.status,
    required this.mealTypes,
    required this.addressLine,
    required this.paymentRef,
  });

  Booking copyWith({String? status}) {
    return Booking(
      id: id,
      cookName: cookName,
      cookId: cookId,
      date: date,
      startTime: startTime,
      durationMinutes: durationMinutes,
      amountPaid: amountPaid,
      savings: savings,
      status: status ?? this.status,
      mealTypes: mealTypes,
      addressLine: addressLine,
      paymentRef: paymentRef,
    );
  }
}

class KitchenAddress {
  final String id;
  final String label;
  final String line;
  final bool isSelected;
  final String landmark;

  const KitchenAddress({
    required this.id,
    required this.label,
    required this.line,
    required this.landmark,
    this.isSelected = false,
  });

  KitchenAddress copyWith({bool? isSelected}) {
    return KitchenAddress(
      id: id,
      label: label,
      line: line,
      landmark: landmark,
      isSelected: isSelected ?? this.isSelected,
    );
  }
}

// Curated Seed Data
final List<Cook> seededCooks = [
  const Cook(
    id: 'cook_101',
    name: 'Sita Lakshmi',
    initials: 'SL',
    rating: 4.95,
    totalBookings: 218,
    yearsExperience: 12,
    cuisines: ['South Indian', 'Karnataka Homestyle', 'Tamilian'],
    languages: ['Kannada', 'Tamil', 'English'],
    specialty: 'Crisp Ghee Roast Dosas & Bisi Bele Bath',
    bio: 'Specialist in authentic Bengaluru morning fare, hand-ground masalas, traditional sambar, and filter coffee.',
    avatarColor: Color(0xFFE8F5E9),
  ),
  const Cook(
    id: 'cook_102',
    name: 'Ramesh Gowda',
    initials: 'RG',
    rating: 4.88,
    totalBookings: 340,
    yearsExperience: 14,
    cuisines: ['North Indian', 'Dal Tadka', 'Phulkas', 'Biryani'],
    languages: ['Kannada', 'Hindi'],
    specialty: 'Soft Wholewheat Phulkas & Homestyle Paneer',
    bio: 'Master of light, low-oil rotis, wholesome yellow dal tadka, seasonal subzis, and aromatic jeera rice.',
    avatarColor: Color(0xFFFEF3C7),
  ),
  const Cook(
    id: 'cook_103',
    name: 'Sunita Rao',
    initials: 'SR',
    rating: 4.98,
    totalBookings: 412,
    yearsExperience: 9,
    cuisines: ['Konkani', 'South Indian', 'Nutrition Focus'],
    languages: ['Konkani', 'Kannada', 'English', 'Hindi'],
    specialty: 'High-Protein Balanced Daily Meal Plans',
    bio: 'Clean, hygienic, wellness-oriented cooking. Diabetic-friendly, wholesome grains, low sodium options.',
    avatarColor: Color(0xFFE0E7FF),
  ),
];

final List<Service> defaultServices = [
  const Service(
    id: 'srv_breakfast',
    type: 'BREAKFAST',
    title: 'Morning Breakfast',
    tagline: 'Crisp dosas, fluffy idlis, poha & artisanal filter coffee',
    basePrice: 249,
    estimatedMinutes: 60,
    icon: LucideIcons.coffee,
    badge: 'Popular in Koramangala',
  ),
  const Service(
    id: 'srv_lunch',
    type: 'LUNCH',
    title: 'Afternoon Lunch',
    tagline: 'Warm rotis, dal tadka, fresh seasonal sabzi & rice',
    basePrice: 299,
    estimatedMinutes: 75,
    icon: LucideIcons.sun,
    badge: 'Homestyle Comfort',
  ),
  const Service(
    id: 'srv_dinner',
    type: 'DINNER',
    title: 'Evening Dinner',
    tagline: 'Wholesome light curries, phulkas & comforting khichdi',
    basePrice: 329,
    estimatedMinutes: 75,
    icon: LucideIcons.moon,
    badge: 'Calm & Restorative',
  ),
  const Service(
    id: 'srv_fullday',
    type: 'FULL_DAY',
    title: 'Full Day Cook Partner',
    tagline: 'All 3 daily meals prepared + complete kitchen tidying',
    basePrice: 899,
    estimatedMinutes: 240,
    icon: LucideIcons.chefHat,
    badge: 'Peace of Mind',
  ),
];

final List<KitchenAddress> defaultAddresses = [
  const KitchenAddress(
    id: 'addr_1',
    label: 'Koramangala 4th Block',
    line: '#42, 7th Cross, 4th Block, Koramangala',
    landmark: 'Near Wipro Park',
    isSelected: true,
  ),
  const KitchenAddress(
    id: 'addr_2',
    label: 'Indiranagar 100ft Road',
    line: 'Flat 302, Green Palms, 100ft Road, Indiranagar',
    landmark: 'Opposite Toit',
    isSelected: false,
  ),
  const KitchenAddress(
    id: 'addr_3',
    label: 'HSR Layout Sector 2',
    line: 'Villa 18, 14th Main, Sector 2, HSR Layout',
    landmark: 'Near BDA Complex',
    isSelected: false,
  ),
];

final List<Booking> defaultBookings = [
  const Booking(
    id: 'BK-89012',
    cookName: 'Sita Lakshmi',
    cookId: 'cook_101',
    date: 'Tomorrow, 12 Nov',
    startTime: '8:00 AM',
    durationMinutes: 60,
    amountPaid: 249,
    savings: 50,
    status: 'upcoming',
    mealTypes: ['Morning Breakfast (Dosas & Chutney)'],
    addressLine: '#42, 7th Cross, Koramangala 4th Block',
    paymentRef: 'UPI_SIM_9871',
  ),
  const Booking(
    id: 'BK-88402',
    cookName: 'Ramesh Gowda',
    cookId: 'cook_102',
    date: '10 Nov 2026',
    startTime: '1:00 PM',
    durationMinutes: 75,
    amountPaid: 299,
    savings: 60,
    status: 'completed',
    mealTypes: ['Afternoon Lunch (Phulkas & Dal Tadka)'],
    addressLine: '#42, 7th Cross, Koramangala 4th Block',
    paymentRef: 'CARD_SIM_1102',
  ),
  const Booking(
    id: 'BK-87910',
    cookName: 'Sunita Rao',
    cookId: 'cook_103',
    date: '8 Nov 2026',
    startTime: '7:30 PM',
    durationMinutes: 75,
    amountPaid: 329,
    savings: 40,
    status: 'cancelled',
    mealTypes: ['Evening Dinner'],
    addressLine: '#42, 7th Cross, Koramangala 4th Block',
    paymentRef: 'WALLET_SIM_7718',
  ),
];

class UserProfile {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? photoUrl;
  final String role;
  final String provider; // 'phone' | 'google' | 'guest'
  final String? token;

  const UserProfile({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.photoUrl,
    this.role = 'customer',
    this.provider = 'phone',
    this.token,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserProfile(
      id: json['id'] ?? 'user_${DateTime.now().millisecondsSinceEpoch % 10000}',
      name: json['name'] ?? 'Cookii Foodie',
      email: json['email'],
      phone: json['phone'],
      photoUrl: json['photoUrl'],
      role: json['role'] ?? 'customer',
      provider: json['provider'] ?? 'phone',
      token: token,
    );
  }

  static const UserProfile defaultCustomer = UserProfile(
    id: 'cust_arjun_101',
    name: 'Arjun Rao',
    phone: '+91 98765 43210',
    email: 'arjun.rao@gmail.com',
    role: 'customer',
    provider: 'phone',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  );
}

