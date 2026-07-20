# Project Genesis

Project Genesis generates AI-ready project workspaces from reusable templates.

It provides a layered template engine, registry and package management, package publishing, registry synchronization, an inspection UI, and an enterprise policy foundation.

## Capabilities

- Template discovery, inheritance, composition, capabilities, profiles, and version validation
- Wizard-driven project generation
- Remote registry loading with cache fallback
- Remote template package download, verification, extraction, and installation
- Package publishing and registry manifest updates
- CLI package commands for search, info, install, uninstall, publish, and sync
- Web console for catalog, registry, profile, package, enterprise, and roadmap inspection
- Organization, role, permission, policy check, and audit summary foundations

## Development

```powershell
npm install
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

Project Genesis runs the CLI through `tsx`, which is installed as a local dev dependency by `npm install`. You do not need to install `tsx` globally. If `npm.cmd run genesis` reports that `tsx` is not recognized, run `npm install` from the repository root and try again.

## CLI

```powershell
npm install
npm.cmd run genesis
npm.cmd run genesis -- search <query>
npm.cmd run genesis -- info <template-id>
npm.cmd run genesis -- install <template-id>
npm.cmd run genesis -- uninstall <template-id> <version>
npm.cmd run genesis -- publish <template-id> --version <version> --package <zip-path> --registry <registry-id>
npm.cmd run genesis -- sync
```

## Verification

```powershell
npm.cmd run verify
npm.cmd run test:registry-sync
npm.cmd run test:enterprise
```

## Documentation

Primary documentation lives in `docs/`.

Start with:

- `docs/VISION.md`
- `docs/ARCHITECTURE.md`
- `docs/MILESTONES.md`
- `docs/REMOTE_REGISTRY_SPEC.md`
- `docs/ENTERPRISE_FEATURES_SPEC.md`
- `docs/TEMPLATE_LIBRARY_GUIDE.md`
- `docs/PACKAGE_INSTALL_DESCRIPTOR_SPEC.md`
- `docs/RELEASE_CHECKLIST.md`
