import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import '../../../core/providers/auth_provider.dart';
import '../widgets/auth_form.dart';
import '../../../core/utils/logger.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormBuilderState>();
  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (_formKey.currentState?.saveAndValidate() ?? false) {
      final formData = _formKey.currentState!.value;
      final email = formData['email'] as String;
      final password = formData['password'] as String;
      final displayName = formData['displayName'] as String?;

      setState(() => _isLoading = true);

      try {
        final authService = ref.read(authServiceProvider);
        await authService.registerWithEmailAndPassword(
          email: email,
          password: password,
          displayName: displayName,
        );

        // Send email verification
        try {
          await authService.sendEmailVerification();
        } catch (e) {
          logger.w('Email verification failed', error: e);
        }

        if (mounted) {
          logger.i('Registration successful');
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Account created! Please verify your email.'),
              backgroundColor: Colors.green,
            ),
          );
          context.go('/verify-email');
        }
      } catch (e) {
        if (mounted) {
          logger.e('Registration failed', error: e);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(_getErrorMessage(e)),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    }
  }

  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('email-already-in-use')) {
      return 'An account with this email already exists';
    } else if (error.toString().contains('weak-password')) {
      return 'Password is too weak';
    } else if (error.toString().contains('invalid-email')) {
      return 'Invalid email address';
    } else if (error.toString().contains('network-request-failed')) {
      return 'Network error. Please check your connection';
    }
    return 'Registration failed. Please try again';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Up'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 32),
              const Text(
                'Create Account',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign up to get started',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              AuthForm(
                formKey: _formKey,
                submitButtonText: 'Create Account',
                onSubmit: _handleRegister,
                isLoading: _isLoading,
                fields: [
                  FormBuilderTextField(
                    name: 'displayName',
                    decoration: const InputDecoration(
                      labelText: 'Display Name (optional)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person),
                    ),
                    autovalidateMode: AutovalidateMode.onUserInteraction,
                  ),
                  const SizedBox(height: 16),
                  EmailField(name: 'email'),
                  const SizedBox(height: 16),
                  PasswordField(name: 'password'),
                  const SizedBox(height: 16),
                  FormBuilderTextField(
                    name: 'confirmPassword',
                    decoration: const InputDecoration(
                      labelText: 'Confirm Password',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.lock),
                    ),
                    obscureText: true,
                    autovalidateMode: AutovalidateMode.onUserInteraction,
                    validator: FormBuilderValidators.compose([
                      FormBuilderValidators.required(),
                      (value) {
                        final password = _formKey.currentState?.fields['password']?.value;
                        if (value != password) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ]),
                  ),
                ],
                footer: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? '),
                    TextButton(
                      onPressed: () => context.push('/login'),
                      child: const Text('Sign In'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

