# Template Registry Specification

## Purpose

Template registries provide a source of discoverable templates outside the local repository.

Registries may represent:

- local repositories
- internal company repositories
- remote template marketplaces

The Project Genesis engine treats every registry uniformly.

---

# Registry

A registry is a collection of templates.

Example

```json
{
  "id": "official",
  "name": "Project Genesis Official Registry",
  "url": "https://registry.projectgenesis.dev"
}
```

---

# Registry Types

Supported registry types

- local
- remote

Future

- git
- zip
- package

---

# Registry Entry

Each registry entry contains metadata describing a template.

Example

```json
{
  "templateId": "nextjs",
  "version": "3.2.0",
  "description": "Next.js project template"
}
```

---

# Registry Responsibilities

Registries provide:

- template discovery
- template metadata
- available versions
- download location

Registries do not perform:

- composition
- compatibility validation
- generation

---

# Discovery

Discovery occurs before template selection.

Pipeline

Registry Discovery
↓

Template Discovery
↓

Composition

---

# Design Goals

- Source independent
- Registry independent
- Backward compatible
- Offline capable
- Extensible

---

# Future Enhancements

- Signed templates
- Registry authentication
- Marketplace search
- Automatic updates
- Download caching
- Template ratings

---

# Backward Compatibility

The existing local templates directory remains a valid registry.

No existing repositories require modification.

```md
# Package Uploads

Remote registries may expose a package-upload endpoint.

A successful upload returns package identity metadata:

```json
{
  "templateId": "nextjs",
  "version": "4.0.0",
  "packageUrl": "https://registry.example.com/packages/nextjs-4.0.0.zip"
}