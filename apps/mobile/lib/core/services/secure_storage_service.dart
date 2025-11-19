import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';

final logger = Logger();

/// Secure storage service for sensitive data
class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  /// Store a value securely
  Future<void> write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
      logger.d('Stored secure value for key: $key');
    } catch (e, stackTrace) {
      logger.e('Error storing secure value', error: e, stackTrace: stackTrace);
      rethrow;
    }
  }

  /// Read a value from secure storage
  Future<String?> read(String key) async {
    try {
      final value = await _storage.read(key: key);
      logger.d('Read secure value for key: $key');
      return value;
    } catch (e, stackTrace) {
      logger.e('Error reading secure value', error: e, stackTrace: stackTrace);
      return null;
    }
  }

  /// Delete a value from secure storage
  Future<void> delete(String key) async {
    try {
      await _storage.delete(key: key);
      logger.d('Deleted secure value for key: $key');
    } catch (e, stackTrace) {
      logger.e('Error deleting secure value', error: e, stackTrace: stackTrace);
    }
  }

  /// Delete all values from secure storage
  Future<void> deleteAll() async {
    try {
      await _storage.deleteAll();
      logger.i('Deleted all secure values');
    } catch (e, stackTrace) {
      logger.e('Error deleting all secure values', error: e, stackTrace: stackTrace);
    }
  }

  /// Check if a key exists
  Future<bool> containsKey(String key) async {
    try {
      final value = await _storage.read(key: key);
      return value != null;
    } catch (e) {
      logger.e('Error checking key existence', error: e);
      return false;
    }
  }

  /// Store auth token
  Future<void> storeAuthToken(String token) async {
    await write('auth_token', token);
  }

  /// Get auth token
  Future<String?> getAuthToken() async {
    return await read('auth_token');
  }

  /// Delete auth token
  Future<void> deleteAuthToken() async {
    await delete('auth_token');
  }
}

