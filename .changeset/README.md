# Changesets

This directory contains changeset files that describe changes made to packages in this monorepo.

## Creating a Changeset

When you make changes that should be included in a release, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages changed
2. Choose the type of change (major, minor, patch)
3. Write a description of the changes

## Changeset Files

Changeset files are automatically generated in this directory with names like:
- `changeset-name.md`

They contain:
- Package name
- Change type (major/minor/patch)
- Description of changes

## Versioning

When ready to release:
1. Run `pnpm changeset version` to update versions and create changelogs
2. Review the generated changelog
3. Commit the changes
4. Run `pnpm release` to publish packages

## More Information

See [Changesets documentation](https://github.com/changesets/changesets) for more details.

