# Package Publishing

## Overview

Project Genesis includes a package publishing system that allows template packages to be published into a registry manifest.

Publishing performs validation, computes integrity information, and updates the registry manifest atomically.

---

## Architecture

```
CLI
 │
 ▼
PackageCommandDispatcher
 │
 ▼
PackagePublishCommand
 │
 ▼
TemplatePublishingPipeline
 │
 ▼
TemplatePublishingService
 │
 ▼
TemplatePublishValidationService
 │
 ▼
RegistryPublishManifestStore
 │
 ▼
publish-manifest.json
```

---

## Publishing Workflow

1. Validate the publish request.
2. Verify the package archive exists.
3. Validate the filename and package identity.
4. Compute the SHA-256 checksum.
5. Read the registry manifest.
6. Replace an existing package entry if the template/version already exists.
7. Otherwise append a new package entry.
8. Persist the manifest atomically.
9. Return the publishing outcome.

---

## Command Line

Publish a package:

```bash
npm run genesis -- publish nextjs \
    --version 1.0.0 \
    --package ./packages/nextjs-1.0.0.zip \
    --registry official
```

Specify a custom manifest:

```bash
npm run genesis -- publish nextjs \
    --version 1.0.0 \
    --package ./packages/nextjs-1.0.0.zip \
    --registry official \
    --manifest ./registries/official/publish-manifest.json
```

---

## Validation

Publishing validates:

- Template ID
- Version
- Registry ID
- Package archive
- Archive filename
- Package identity
- SHA-256 checksum

Invalid packages do not modify the registry.

---

## Manifest

Example:

```json
{
  "registryId": "official",
  "packages": [
    {
      "templateId": "nextjs",
      "version": "1.0.0",
      "packagePath": "packages/nextjs-1.0.0.zip",
      "sha256": "...",
      "publishedAt": "2026-07-20T14:32:00Z"
    }
  ]
}
```

---

## Replacement Behavior

Publishing the same:

- template ID
- version

replaces the previous package entry instead of creating duplicates.

Publishing a new version appends another entry.

---

## Testing

Publishing is covered by:

- package-publish-command-test
- package-publish-cli-integration-test
- package-publish-end-to-end-test
- template-publishing-pipeline-test
- template-publish-validation-service-test
- template-publishing-service-test
- registry-publish-manifest-store-test

These tests verify:

- validation
- checksum generation
- persistence
- replacement
- CLI integration
- dispatcher integration
- rollback behavior
- manifest reload