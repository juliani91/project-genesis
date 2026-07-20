# Release Checklist

## Purpose

This checklist defines the release-readiness workflow for Project Genesis.

It is intended to be run before packaging, tagging, or handing the project to another maintainer.

---

# Verification

Run:

```powershell
npm.cmd run verify
npm.cmd run test:registry-sync
npm.cmd run test:enterprise
npm.cmd run test:template-library
npm.cmd run test:package-install
```

Expected result:

- TypeScript passes.
- ESLint reports no errors.
- Next.js production build passes.
- Registry synchronization sandbox test passes.
- Enterprise workspace sandbox test passes.
- Template library expansion sandbox test passes.
- Package install guidance sandbox test passes.

Known current lint warnings are tracked in existing sandbox and service files and do not block this release pass.

---

# CLI Smoke Test

Run:

```powershell
npm.cmd run genesis -- sync
npm.cmd run genesis -- list
```

Expected result:

- Registry synchronization reports discovered registries.
- Installed package listing completes without errors.

---

# UI Smoke Test

Run:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000
```

Confirm:

- Catalog tab loads.
- Registries tab loads.
- Profiles tab loads.
- Packages tab loads.
- Enterprise tab loads.
- Roadmap shows Sprint 26-48 complete.

---

# Documentation

Confirm these files are current:

- `README.md`
- `docs/MILESTONES.md`
- `docs/REMOTE_REGISTRY_SPEC.md`
- `docs/ENTERPRISE_FEATURES_SPEC.md`
- `docs/RELEASE_CHECKLIST.md`

---

# Packaging Notes

Project Genesis is currently marked private in `package.json`.

Before public distribution, decide whether to:

- keep the app private and package source archives manually,
- publish only template packages,
- or create a separate distributable CLI package.
