# Contributing Guide

Thank you for your interest in contributing to the AIP Monorepo!

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/supa-n8n-adk-flut-fast-firbse-gcloud.git
   cd supa-n8n-adk-flut-fast-firbse-gcloud
   ```

3. **Set up upstream**:
   ```bash
   git remote add upstream https://github.com/original-owner/supa-n8n-adk-flut-fast-firbse-gcloud.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   cd apps/agents && uv sync
   cd ../mobile && flutter pub get
   ```

## Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run tests and linting**:
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit your changes** (follow [Conventional Commits](./git-workflow.md)):
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## Code Style

### TypeScript/JavaScript

- Use **ESLint** and **Prettier** (configured in `.eslintrc.js` and `.prettierrc`)
- Follow **TypeScript strict mode**
- Use **functional components** with hooks
- Prefer **named exports** over default exports

### Python

- Follow **PEP 8** style guide
- Use **ruff** for linting and formatting
- Use **mypy** for type checking
- Maximum line length: **100 characters**

### Dart/Flutter

- Follow **very_good_analysis** lint rules
- Use **dart format** for formatting
- Prefer **const constructors** where possible

## Testing Requirements

### Web App

- Write **unit tests** with Vitest
- Write **E2E tests** with Playwright for critical flows
- Aim for **>80% code coverage**

### Agents API

- Write **unit tests** with pytest
- Write **integration tests** for API endpoints
- Aim for **>80% code coverage**

### Mobile App

- Write **widget tests** for UI components
- Write **integration tests** for critical flows
- Test on **both iOS and Android**

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] TypeScript/Python types are correct
- [ ] No linting errors
- [ ] Commit messages follow conventional commits

## Documentation

- Update **README.md** if adding new features
- Update **docs/** if changing architecture
- Add **JSDoc/Python docstrings** for public APIs
- Include **examples** for complex features

## Questions?

- Open an **issue** for bugs or feature requests
- Start a **discussion** for questions
- Check existing **documentation** first

Thank you for contributing! 🎉

