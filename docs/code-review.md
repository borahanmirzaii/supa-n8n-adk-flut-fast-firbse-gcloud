# Code Review Guide

This guide outlines the code review process and standards for the AIP Monorepo.

## Review Process

1. **Author creates PR** with complete description
2. **CI checks run** automatically
3. **Reviewer assigned** (at least one required)
4. **Reviewer provides feedback** using GitHub review tools
5. **Author addresses feedback** and updates PR
6. **Reviewer approves** when satisfied
7. **PR merged** (squash and merge for features)

## Review Checklist

### Functionality

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] No breaking changes (or documented)
- [ ] Backward compatibility maintained

### Code Quality

- [ ] Code is readable and maintainable
- [ ] Follows project style guidelines
- [ ] No code duplication
- [ ] Proper abstractions used
- [ ] Performance considerations addressed

### Testing

- [ ] Tests added for new features
- [ ] Tests updated for changed features
- [ ] All tests pass
- [ ] Test coverage adequate
- [ ] Edge cases tested

### Security

- [ ] No security vulnerabilities introduced
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] Sensitive data handled securely
- [ ] Dependencies are secure

### Documentation

- [ ] Code comments where needed
- [ ] README/docs updated
- [ ] API documentation updated
- [ ] Changelog updated (if applicable)

## Review Standards

### Approval Criteria

A PR should be approved when:

1. **Functionality is correct** - Code does what it's supposed to do
2. **Code quality is good** - Follows best practices
3. **Tests are adequate** - Good coverage and quality
4. **No security issues** - Security review passed
5. **Documentation updated** - Docs reflect changes

### Request Changes When

- Code doesn't work as intended
- Significant code quality issues
- Missing or inadequate tests
- Security concerns
- Breaking changes not documented
- Performance issues

### Comment (Don't Block) When

- Minor style issues
- Suggestions for improvement
- Questions about implementation
- Future enhancements

## Review Best Practices

### For Reviewers

1. **Be constructive** - Provide helpful feedback
2. **Be respectful** - Code review is collaborative
3. **Be specific** - Point to exact lines/issues
4. **Be timely** - Review within 24-48 hours
5. **Ask questions** - Don't assume intent
6. **Approve when ready** - Don't block on minor issues

### For Authors

1. **Keep PRs small** - Easier to review
2. **Write clear descriptions** - Help reviewers understand
3. **Respond to feedback** - Address all comments
4. **Don't take it personally** - Feedback improves code
5. **Ask for clarification** - If feedback is unclear

## Common Issues

### Code Style

- **Issue**: Inconsistent formatting
- **Fix**: Run formatter (Prettier, ruff, dart format)

### Type Safety

- **Issue**: Missing types or `any` usage
- **Fix**: Add proper types, avoid `any`

### Testing

- **Issue**: Missing tests for new code
- **Fix**: Add unit and integration tests

### Performance

- **Issue**: Inefficient algorithms or queries
- **Fix**: Optimize or add caching

### Security

- **Issue**: Potential security vulnerabilities
- **Fix**: Add validation, sanitization, or authentication

## Review Tools

- **GitHub PR Reviews** - Main review interface
- **GitHub Suggestions** - Inline code suggestions
- **CI/CD Checks** - Automated quality checks
- **Code Coverage** - Test coverage reports
- **Security Scanning** - Dependency vulnerability checks

## Resources

- [Google Code Review Guide](https://google.github.io/eng-practices/review/)
- [ThoughtWorks Code Review](https://www.thoughtworks.com/insights/blog/code-review-best-practices)

