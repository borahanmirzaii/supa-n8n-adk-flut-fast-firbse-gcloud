# Git Workflow Guide

This document outlines the git workflow and branching strategy for the AIP Monorepo.

## Branching Strategy

We use a **Git Flow** inspired branching model:

### Main Branches

- **`main`**: Production-ready code. Always deployable.
- **`develop`**: Integration branch for features. Latest development changes.

### Supporting Branches

- **`feature/*`**: New features
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Critical production fixes
- **`release/*`**: Preparing a new release

## Branch Naming Conventions

- Features: `feature/description-of-feature`
- Bug fixes: `bugfix/description-of-bug`
- Hotfixes: `hotfix/description-of-hotfix`
- Releases: `release/v1.2.3`

Examples:
- `feature/add-user-authentication`
- `bugfix/fix-firestore-query`
- `hotfix/fix-critical-security-issue`
- `release/v0.2.0`

## Workflow

### Starting a New Feature

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-new-feature
```

### Committing Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Examples:**
```bash
git commit -m "feat(web): add user authentication"
git commit -m "fix(agents): resolve Firestore query issue"
git commit -m "docs: update setup guide"
git commit -m "chore: update dependencies"
```

### Pull Request Process

1. **Create PR** from your feature branch to `develop` (or `main` for hotfixes)
2. **Fill out PR template** completely
3. **Ensure CI passes** - all tests and linting must pass
4. **Request review** from at least one team member
5. **Address feedback** and update PR
6. **Squash and merge** when approved

### Merging Strategy

- **Feature branches** → `develop`: Squash and merge
- **Bugfix branches** → `develop`: Squash and merge
- **Hotfix branches** → `main`: Merge commit (preserve history)
- **Release branches** → `main`: Merge commit

### Release Process

1. Create release branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.3
   ```

2. Update version numbers and changelog

3. Merge to `main`:
   ```bash
   git checkout main
   git merge release/v1.2.3
   git tag v1.2.3
   git push origin main --tags
   ```

4. Merge back to `develop`:
   ```bash
   git checkout develop
   git merge release/v1.2.3
   git push origin develop
   ```

### Hotfix Process

1. Create hotfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. Make fix and commit:
   ```bash
   git commit -m "fix: critical security issue"
   ```

3. Merge to `main`:
   ```bash
   git checkout main
   git merge hotfix/critical-fix
   git tag v1.2.4
   git push origin main --tags
   ```

4. Merge to `develop`:
   ```bash
   git checkout develop
   git merge hotfix/critical-fix
   git push origin develop
   ```

## Code Review Guidelines

See [Code Review Guide](./code-review.md) for detailed review process.

## Best Practices

1. **Keep branches small** - One feature per branch
2. **Commit often** - Small, logical commits
3. **Write clear commit messages** - Follow conventional commits
4. **Update documentation** - Keep docs in sync with code
5. **Run tests locally** - Ensure tests pass before pushing
6. **Rebase before merging** - Keep history clean
7. **Delete merged branches** - Clean up after merge

## Git Hooks

We use Husky for git hooks:

- **pre-commit**: Runs lint-staged (linting and formatting)
- **commit-msg**: Validates commit message format (optional)

## Troubleshooting

### Merge Conflicts

```bash
# Update your branch
git checkout develop
git pull origin develop
git checkout feature/my-feature
git rebase develop

# Resolve conflicts, then:
git add .
git rebase --continue
```

### Undo Last Commit

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Update Branch from Main

```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/main
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

