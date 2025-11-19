import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'firebase_provider.dart';
import '../services/secure_storage_service.dart';
import '../services/biometric_service.dart';

final logger = Logger();

/// Auth state provider - streams auth state changes
final authStateProvider = StreamProvider<User?>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  logger.d('Watching auth state changes');
  return auth.authStateChanges();
});

/// Current user provider
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authStateProvider).value;
});

/// Secure storage provider
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

/// Biometric service provider
final biometricServiceProvider = Provider<BiometricService>((ref) {
  return BiometricService();
});

/// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthService(auth, secureStorage);
});

/// Auth service class with all auth operations
class AuthService {
  final FirebaseAuth _auth;
  final SecureStorageService _secureStorage;

  AuthService(this._auth, this._secureStorage);

  /// Get current user
  User? get currentUser => _auth.currentUser;

  /// Sign in with email and password
  Future<UserCredential> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      logger.i('Attempting sign in', error: email);
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Store auth token securely
      if (credential.user != null) {
        final token = await credential.user!.getIdToken();
        await _secureStorage.storeAuthToken(token);
      }
      
      logger.i('Sign in successful', error: credential.user?.uid);
      return credential;
    } on FirebaseAuthException catch (e) {
      logger.e('Sign in failed', error: e.code, stackTrace: e.stackTrace);
      rethrow;
    }
  }

  /// Register with email and password
  Future<UserCredential> registerWithEmailAndPassword({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      logger.i('Attempting registration', error: email);
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update display name if provided
      if (displayName != null && credential.user != null) {
        await credential.user!.updateDisplayName(displayName);
        await credential.user!.reload();
      }

      logger.i('Registration successful', error: credential.user?.uid);
      return credential;
    } on FirebaseAuthException catch (e) {
      logger.e('Registration failed', error: e.code, stackTrace: e.stackTrace);
      rethrow;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      logger.i('Signing out');
      await _auth.signOut();
      await _secureStorage.deleteAuthToken();
      logger.i('Sign out successful');
    } catch (e, stackTrace) {
      logger.e('Sign out failed', error: e, stackTrace: stackTrace);
      rethrow;
    }
  }

  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      logger.i('Sending password reset email', error: email);
      await _auth.sendPasswordResetEmail(email: email);
      logger.i('Password reset email sent');
    } on FirebaseAuthException catch (e) {
      logger.e('Password reset failed', error: e.code, stackTrace: e.stackTrace);
      rethrow;
    }
  }

  /// Send email verification
  Future<void> sendEmailVerification() async {
    final user = _auth.currentUser;
    if (user == null) {
      throw Exception('No user logged in');
    }

    try {
      logger.i('Sending email verification', error: user.uid);
      await user.sendEmailVerification();
      logger.i('Email verification sent');
    } on FirebaseAuthException catch (e) {
      logger.e('Email verification failed', error: e.code, stackTrace: e.stackTrace);
      rethrow;
    }
  }

  /// Update password
  Future<void> updatePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final user = _auth.currentUser;
    if (user == null) {
      throw Exception('No user logged in');
    }

    try {
      logger.i('Updating password', error: user.uid);
      
      // Re-authenticate user
      final credential = EmailAuthProvider.credential(
        email: user.email!,
        password: currentPassword,
      );
      await user.reauthenticateWithCredential(credential);
      
      // Update password
      await user.updatePassword(newPassword);
      logger.i('Password updated successfully');
    } on FirebaseAuthException catch (e) {
      logger.e('Password update failed', error: e.code, stackTrace: e.stackTrace);
      rethrow;
    }
  }

  /// Reload user
  Future<void> reloadUser() async {
    final user = _auth.currentUser;
    if (user != null) {
      await user.reload();
    }
  }
}
