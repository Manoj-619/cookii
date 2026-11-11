import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class CookiiState extends ChangeNotifier {
  List<KitchenAddress> _addresses = List.from(defaultAddresses);
  List<Booking> _bookings = List.from(defaultBookings);
  List<Service> _services = List.from(defaultServices);
  final Set<String> _favoriteCookIds = {'cook_101'};
  int _walletBalance = 1450;
  bool _isLoadingServices = false;

  List<KitchenAddress> get addresses => _addresses;
  List<Booking> get bookings => _bookings;
  List<Service> get services => _services;
  Set<String> get favoriteCookIds => _favoriteCookIds;
  int get walletBalance => _walletBalance;
  bool get isLoadingServices => _isLoadingServices;

  KitchenAddress get currentAddress =>
      _addresses.firstWhere((a) => a.isSelected, orElse: () => _addresses.first);

  CookiiState() {
    loadServices();
  }

  Future<void> loadServices() async {
    _isLoadingServices = true;
    notifyListeners();
    final remoteServices = await ApiService.fetchServices();
    if (remoteServices.isNotEmpty) {
      _services = remoteServices;
    }
    _isLoadingServices = false;
    notifyListeners();
  }

  void selectAddress(String id) {
    _addresses = _addresses
        .map((a) => a.copyWith(isSelected: a.id == id))
        .toList();
    notifyListeners();
  }

  void toggleFavorite(String cookId) {
    if (_favoriteCookIds.contains(cookId)) {
      _favoriteCookIds.remove(cookId);
    } else {
      _favoriteCookIds.add(cookId);
    }
    notifyListeners();
  }

  void addBooking(Booking newBooking) {
    _bookings.insert(0, newBooking);
    _walletBalance = (_walletBalance - newBooking.amountPaid).clamp(0, 999999);
    notifyListeners();
  }

  void cancelBooking(String bookingId) {
    _bookings = _bookings.map((b) {
      if (b.id == bookingId) {
        return b.copyWith(status: 'cancelled');
      }
      return b;
    }).toList();
    notifyListeners();
  }
}

class CookiiScope extends InheritedNotifier<CookiiState> {
  const CookiiScope({
    super.key,
    required CookiiState state,
    required super.child,
  }) : super(notifier: state);

  static CookiiState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CookiiScope>();
    assert(scope != null, 'No CookiiScope found in context');
    return scope!.notifier!;
  }
}

