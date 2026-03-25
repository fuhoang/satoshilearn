# BlockWise

Next.js 16 app for BlockWise.

## Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint
npm run build
```

## Git Flow

This repository uses the Gitflow branching model.

- `main` stores production-ready history.
- `develop` is the main integration branch for ongoing work.
- `feature/*` branches are created from `develop` and merged back into `develop`.
- `release/*` branches are created from `develop` and merged into both `main` and `develop`.
- `hotfix/*` branches are created from `main` and merged into both `main` and `develop`.

### Branch Model

Use these branch names:

- `feature/<short-description>`
- `release/<version>`
- `hotfix/<short-description>`

Examples:

```bash
git checkout develop
git checkout -b feature/auth-flow
git checkout -b release/0.1.0
git checkout -b hotfix/fix-login-redirect
```

### Commit Style

Keep commits focused and readable. Prefer imperative messages:

- `Add login form validation`
- `Fix build script for webpack`
- `Update CI to run lint and build`

## Pull Requests

Every pull request should:

- target the correct base branch for Gitflow
- use `develop` for feature work
- use `main` only for release and hotfix promotion
- describe the user-facing change
- reference any related issue
- include screenshots for UI changes
- pass `npm run lint` and `npm run build`

Detailed expectations live in [CONTRIBUTING.md](./CONTRIBUTING.md).
