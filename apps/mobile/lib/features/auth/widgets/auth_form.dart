import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';

/// Reusable auth form widget
class AuthForm extends StatelessWidget {
  final GlobalKey<FormBuilderState> formKey;
  final List<Widget> fields;
  final String submitButtonText;
  final VoidCallback onSubmit;
  final bool isLoading;
  final Widget? footer;

  const AuthForm({
    super.key,
    required this.formKey,
    required this.fields,
    required this.submitButtonText,
    required this.onSubmit,
    this.isLoading = false,
    this.footer,
  });

  @override
  Widget build(BuildContext context) {
    return FormBuilder(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ...fields,
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: isLoading ? null : onSubmit,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(submitButtonText),
          ),
          if (footer != null) ...[
            const SizedBox(height: 16),
            footer!,
          ],
        ],
      ),
    );
  }
}

/// Email field widget
class EmailField extends StatelessWidget {
  final String name;
  final String? label;
  final String? hint;

  const EmailField({
    super.key,
    required this.name,
    this.label,
    this.hint,
  });

  @override
  Widget build(BuildContext context) {
    return FormBuilderTextField(
      name: name,
      decoration: InputDecoration(
        labelText: label ?? 'Email',
        hintText: hint ?? 'you@example.com',
        border: const OutlineInputBorder(),
        prefixIcon: const Icon(Icons.email),
      ),
      keyboardType: TextInputType.emailAddress,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: FormBuilderValidators.compose([
        FormBuilderValidators.required(),
        FormBuilderValidators.email(),
      ]),
    );
  }
}

/// Password field widget
class PasswordField extends StatelessWidget {
  final String name;
  final String? label;
  final String? hint;
  final bool showObscureToggle;

  const PasswordField({
    super.key,
    required this.name,
    this.label,
    this.hint,
    this.showObscureToggle = true,
  });

  @override
  Widget build(BuildContext context) {
    return FormBuilderTextField(
      name: name,
      decoration: InputDecoration(
        labelText: label ?? 'Password',
        hintText: hint ?? '••••••••',
        border: const OutlineInputBorder(),
        prefixIcon: const Icon(Icons.lock),
      ),
      obscureText: true,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      validator: FormBuilderValidators.compose([
        FormBuilderValidators.required(),
        FormBuilderValidators.minLength(8),
      ]),
    );
  }
}

