# Developer Setup

## Requirements

Install globally:

- Git
- Node.js LTS
- npm
- Visual Studio Code or another code editor

Project dependencies are installed locally.

Do not install TypeScript, Next.js, or `tsx` globally. The `genesis` npm script uses the local `tsx` dev dependency installed by `npm install`.

---

## Initial Setup

Clone the repository and enter the project directory.

```bash
git clone <repository-url>
cd project-genesis

npm install
```

If `npm.cmd run genesis` reports that `tsx` is not recognized, dependencies have not been installed in this checkout yet. Run `npm install` from the repository root, then rerun the command.

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
