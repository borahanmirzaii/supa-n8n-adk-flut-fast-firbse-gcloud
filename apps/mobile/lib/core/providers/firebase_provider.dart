import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import '../../firebase_options.dart';

final logger = Logger();

/// Firebase initialization provider
final firebaseInitializedProvider = FutureProvider<bool>((ref) async {
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    logger.i('Firebase initialized successfully');
    return true;
  } catch (e, stackTrace) {
    logger.e('Firebase initialization failed', error: e, stackTrace: stackTrace);
    return false;
  }
});

/// Firebase Auth instance provider
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

