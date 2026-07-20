# Developer Setup

## Requirements

Install globally:

- Git
- Node.js LTS
- npm
- Visual Studio Code or another code editor

Project dependencies are installed locally.

Do not install TypeScript, Next.js, or `tsx` globally.

---

## Initial Setup

Clone the repository and enter the project directory.

```bash
git clone <repository-url>
cd project-genesis

npm install
```

---

## Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Verification

Before handing off a release candidate, run:

```bash
npm run verify
npm run test:registry-sync
npm run test:enterprise
```

The verification script runs type checking, linting, and the production build.

Additional release checks are documented in:

```text
docs/RELEASE_CHECKLIST.md
```
