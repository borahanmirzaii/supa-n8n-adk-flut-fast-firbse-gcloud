import 'package:flutter_test/flutter_test.dart';
import 'package:aip_mobile/main.dart';

void main() {
  testWidgets('App starts', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('AIP Mobile'), findsOneWidget);
  });
}

