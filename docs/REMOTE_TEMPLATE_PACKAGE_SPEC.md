# Remote Template Package Specification

## Purpose

Remote template packages allow Project Genesis to download complete template packages from remote registries.

A template package contains the same structure as a local template directory after extraction.

The generation engine should not distinguish between templates loaded from a local directory and templates loaded from a cached remote package.

---

# Package Lifecycle

Registry Manifest

↓

Registry Template

↓

Package Download

↓

Integrity Verification

↓

Archive Extraction

↓

Template Cache

↓

Template Discovery

↓

Template Package

---

# Supported Archive Formats

Current

- ZIP

Future

- TAR.GZ
- OCI Artifacts
- Git Archives

---

# Download

The package downloader is responsible for:

- downloading archive files
- writing temporary downloads
- reporting download metadata

It is NOT responsible for:

- checksum validation
- archive extraction
- template validation

---

# Integrity Verification

Downloaded archives may contain an advertised SHA-256 checksum.

When present, the downloaded archive must match the advertised checksum before extraction.

If no checksum is provided, the archive may still be downloaded but cannot be verified.

Future registry policies may require checksum verification.

---

# Extraction

Extraction is responsible for:

- expanding archives
- creating template cache directories
- preserving directory structure

Extraction is NOT responsible for:

- template validation
- composition
- generation

---

# Template Cache

Downloaded packages are extracted into the local template cache.

Future cache policies may include:

- expiration
- version cleanup
- storage quotas
- automatic updates

---

# Error Handling

Package downloads must:

- report descriptive network errors
- avoid partially written archives
- never overwrite valid cached templates

Extraction failures must:

- remove incomplete extraction directories
- preserve existing valid cached templates

Verification failures must:

- prevent extraction
- report checksum mismatch details

---

# Design Goals

- Deterministic
- Safe
- Atomic
- Cache-friendly
- Extensible

---

# Backward Compatibility

Local template directories remain fully supported.

Remote template packages ultimately produce the same TemplatePackage model used throughout the existing generation pipeline.