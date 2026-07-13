# Remote Registry Specification

## Purpose

Remote registries allow Project Genesis to discover template catalogs hosted over HTTP or HTTPS.

Remote registries extend the existing registry abstraction without changing the downstream generation pipeline.

---

# Discovery Pipeline

Registry Discovery

↓

Registry Resolution

↓

Remote Registry Loader

↓

Registry Manifest

↓

Template Discovery

---

# Supported Protocols

Current

- HTTPS
- HTTP

Future

- Git
- OCI
- Package registries

---

# Remote Registry Manifest

A remote registry exposes the same manifest format used by local registries.

Example

```json
{
  "registry": {
    "id": "official",
    "name": "Project Genesis Official Registry",
    "type": "remote",
    "location": "https://registry.projectgenesis.dev"
  },
  "templates": [
    {
      "templateId": "nextjs",
      "version": "3.2.0",
      "name": "Next.js"
    }
  ]
}
```

---

# Download Responsibilities

The remote registry loader is responsible for:

- downloading registry manifests
- validating responses
- caching registry manifests

It is NOT responsible for:

- template composition
- compatibility validation
- generation

---

# Cache

Downloaded manifests may be cached locally.

The cache should be transparent to the generation pipeline.

Future enhancements include:

- expiration
- ETag support
- offline mode

---

# Error Handling

Network failures must:

- produce descriptive errors
- never corrupt the local cache
- never partially overwrite valid manifests

---

# Design Goals

- Source independent
- Deterministic
- Cache friendly
- Offline capable
- Extensible

---

# Backward Compatibility

Existing local registries remain fully supported.

Remote registries introduce no breaking changes to existing workflows.