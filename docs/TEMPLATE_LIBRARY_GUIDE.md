# Template Library Guide

## Purpose

Project Genesis includes a balanced starter library for web, software, mobile, and game development.

The library uses the existing composition model:

- one base template
- zero or more feature templates
- optional profiles for complete stack selection

---

# Base Templates

| Template | Category | Purpose |
|---|---|---|
| `nextjs-app` | Web | Next.js TypeScript application starter |
| `react-spa` | Web | React single-page application starter |
| `fastapi-service` | Software | Python FastAPI service starter |
| `node-cli` | Software | TypeScript command-line application starter |
| `react-native-app` | Mobile | Expo-style React Native mobile starter |
| `unity-game` | Game Development | Unity game workspace starter |
| `godot-game` | Game Development | Godot game workspace starter |

---

# Feature Templates

| Template | Purpose |
|---|---|
| `feature-docker` | Container files and Docker notes |
| `feature-github-actions` | CI workflow scaffold |
| `feature-postgresql` | PostgreSQL docs, env example, and migration folder |
| `feature-sqlite` | SQLite docs and schema scaffold |
| `feature-playwright` | Playwright E2E test scaffold |
| `feature-pytest` | Python pytest scaffold |
| `feature-auth` | Authentication planning and env placeholders |
| `feature-tailwind` | Tailwind styling scaffold |
| `feature-mobile-navigation` | Mobile navigation scaffold |
| `feature-game-design-docs` | Game design, asset pipeline, and sprint docs |
| `feature-ai-workspace` | AI collaboration docs and planning state |

---

# Profiles

| Profile | Base | Features |
|---|---|---|
| `web-saas-starter` | `nextjs-app` | Tailwind, PostgreSQL, Auth, Playwright, GitHub Actions, AI Workspace |
| `marketing-web-app` | `nextjs-app` | Tailwind, GitHub Actions, AI Workspace |
| `frontend-dashboard` | `react-spa` | Tailwind, Playwright, GitHub Actions, AI Workspace |
| `api-service` | `fastapi-service` | PostgreSQL, Pytest, Docker, GitHub Actions, AI Workspace |
| `developer-cli` | `node-cli` | GitHub Actions, AI Workspace |
| `mobile-app` | `react-native-app` | Mobile Navigation, GitHub Actions, AI Workspace |
| `unity-game-jam` | `unity-game` | Game Design Docs, GitHub Actions, AI Workspace |
| `godot-indie-game` | `godot-game` | Game Design Docs, GitHub Actions, AI Workspace |

---

# Capability Guidelines

Base templates provide broad capabilities such as:

- `web`
- `api`
- `mobile`
- `game`
- `node`
- `python`
- `typescript`
- `react`

Feature templates declare required capabilities and conflicts.

Examples:

- `feature-playwright` requires `web` and `node`.
- `feature-pytest` requires `python`.
- `feature-postgresql` conflicts with `sqlite`.
- `feature-sqlite` conflicts with `postgres`.

---

# Authoring Rules

To keep composition deterministic:

- Base templates own root-level runnable project files.
- Feature templates write to scoped folders such as `Docs/`, `Database/`, `Security/`, `Styling/`, `Tests/`, or `.github/`.
- Feature templates must avoid producing the same destination file as another template.
- Files containing `{{VARIABLE}}` placeholders must use `render` mode.

---

# Install Guidance

Templates may include `packageInstall.json`.

Project Genesis composes these descriptors and generates a root-level `packageInstall.md` file for selected templates and features.

Use install metadata for:

- runtimes
- package managers
- dependency install commands
- run commands
- verification commands
- environment variables
- troubleshooting notes

Feature templates should append setup instructions through `packageInstall.json` instead of directly generating `packageInstall.md`.
