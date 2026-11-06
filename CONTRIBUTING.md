<h1 align="center">Contributing to my-portfolio</h1>

<p align="center">
  Thanks for your interest in contributing to this project!
</p>

---

## Ways to Contribute

- Report bugs
- Propose new features or improvements
- Improve UI components and accessibility
- Improve docs (README / examples / translations)

---

## Before You Start

- Check existing issues and pull requests first.
- Keep changes focused and small.
- For behavior changes, include clear reproduction/verification steps.
- Follow the existing code style (TypeScript, Biome, Tailwind conventions).

---

## Development Setup

1. Fork and clone the repository.
2. Follow the [Installation & Setup](README.md#installation) steps in the README.
3. Create a branch:
   - `feat/<short-name>` for features
   - `fix/<short-name>` for bug fixes
   - `docs/<short-name>` for documentation

4. Make your changes.
5. Run lint and format before committing:

```bash
bun lint
bun format
```

---

## Pull Request Checklist

- [ ] Scope is focused and related to one topic.
- [ ] Code passes `bun lint` and `bun format` without errors.
- [ ] Documentation is updated if behavior/commands changed.
- [ ] No unrelated refactors or formatting-only changes.
- [ ] PR description includes: what changed, why, and how it was verified.

---

## Commit Message Examples

- `feat: add dark mode toggle to navbar`
- `fix: handle missing redis connection gracefully`
- `docs: update environment setup instructions`
- `chore: bump dependencies`

---

## Coding Guidelines

- Prefer simple, readable and type-safe TypeScript.
- Keep components small and focused.
- Use Tailwind utility classes — avoid inline styles.
- Follow Shadcn UI patterns for new components.
- Avoid breaking changes to existing API routes or DB schema without discussion.

---

## Reporting Bugs

Please include:

- OS and browser version
- Node.js / Bun version
- Exact steps to reproduce
- Expected vs actual behavior
- Relevant terminal output or screenshots

Report issues at: https://github.com/Victor-Zarzar/my-portfolio/issues

---

## Need Help?

Open an issue and provide context. We appreciate all contributions.
