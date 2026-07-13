# Template Versioning Specification

## Purpose

Template versioning allows Project Genesis to validate whether templates are compatible with the running engine and with other templates.

Version validation occurs before composition and generation.

---

# Template Version

Every template declares its own version.

Example

```json
{
  "version": "1.2.0"
}
```

---

# Engine Compatibility

Templates may declare:

- minimum supported Project Genesis version
- maximum supported Project Genesis version

Example

```json
{
  "minGenesisVersion": "1.4.0",
  "maxGenesisVersion": "2.0.0"
}
```

If omitted, no restriction exists.

---

# Template Compatibility

Feature templates may declare version constraints on other templates.

Example

```json
{
  "requiresTemplateVersions": {
    "nextjs": ">=2.1.0",
    "docker": "^1.5.0"
  }
}
```

This allows templates to evolve independently.

---

# Deprecation

Templates may be marked as deprecated.

Example

```json
{
  "deprecated": true,
  "replacementTemplate": "nextjs-v2"
}
```

Deprecated templates remain usable.

Generation continues after displaying warnings.

---

# Validation

Version validation occurs after capability validation.

Pipeline

Discovery
↓

Composition

↓

Capability Validation

↓

Version Validation

↓

Generation

---

# Design Goals

- Semantic versioning
- Backward compatible
- Independent template evolution
- Friendly warnings
- Human-editable manifests
- Extensible

---

# Future Enhancements

- Automatic template upgrades
- Version pinning
- Marketplace compatibility
- Remote compatibility checks
- Version migrations

---

# Backward Compatibility

Existing templates without version metadata remain valid.

No changes are required to existing repositories.