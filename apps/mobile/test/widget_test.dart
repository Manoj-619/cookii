import 'package:flutter_test/flutter_test.dart';
import 'package:cookii_mobile/main.dart';

void main() {
  testWidgets('Cookii smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CookiiApp());
    expect(find.byType(CookiiApp), findsOneWidget);
  });
}
