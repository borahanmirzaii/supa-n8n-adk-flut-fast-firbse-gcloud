import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/utils/logger.dart';

/// Biometric authentication button widget
class BiometricAuthButton extends ConsumerStatefulWidget {
  final VoidCallback onSuccess;
  final VoidCallback? onFailure;

  const BiometricAuthButton({
    super.key,
    required this.onSuccess,
    this.onFailure,
  });

  @override
  ConsumerState<BiometricAuthButton> createState() =>
      _BiometricAuthButtonState();
}

class _BiometricAuthButtonState extends ConsumerState<BiometricAuthButton> {
  bool _isAvailable = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkAvailability();
  }

  Future<void> _checkAvailability() async {
    final biometricService = ref.read(biometricServiceProvider);
    final available = await biometricService.isAvailable();
    setState(() => _isAvailable = available);
  }

  Future<void> _handleBiometricAuth() async {
    setState(() => _isLoading = true);

    try {
      final biometricService = ref.read(biometricServiceProvider);
      final authenticated = await biometricService.authenticate(
        reason: 'Authenticate to access your account',
      );

      if (authenticated) {
        logger.i('Biometric authentication successful');
        widget.onSuccess();
      } else {
        logger.w('Biometric authentication failed');
        widget.onFailure?.call();
      }
    } catch (e) {
      logger.e('Biometric authentication error', error: e);
      widget.onFailure?.call();
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAvailable) {
      return const SizedBox.shrink();
    }

    return OutlinedButton.icon(
      onPressed: _isLoading ? null : _handleBiometricAuth,
      icon: _isLoading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.fingerprint),
      label: const Text('Use Biometric'),
    );
  }
}

