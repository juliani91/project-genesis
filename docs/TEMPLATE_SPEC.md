# Template Specification

## Purpose

This document defines the contract that every Project Genesis template must follow.

A template is a self-contained package that describes how a project should be generated.

Project Genesis discovers, validates, and executes templates according to this specification.

---

# Template Package

A template package is a directory located under:

```

templates/

```

Example:

```

templates/
└── architect-builder/

```

A template package contains descriptors and supporting resources required to generate a project.

---

# Required Files

Every template must contain the following descriptors.

| File | Purpose |
|------|---------|
| genesis.json | Template manifest and metadata |
| wizard.json | User input definition |

A template missing a required descriptor is considered invalid.

---

# Optional Files

Templates may include additional descriptors and resources.

Examples include:

| File | Purpose |
|------|---------|
| folders.json | Folder generation rules |
| files.json | File generation rules |
| features.json | Optional feature modules |
| README.md | Template documentation |
| preview.png | Preview image |

Optional descriptors extend the template without changing the core specification.

---

# Descriptor Specifications

Each descriptor has a single responsibility.

## genesis.json

Defines template metadata.

Examples:

- Name
- Version
- Description
- Author
- Category

---

## wizard.json

Defines the information required from the user before project generation.

The wizard describes required data rather than presentation.

---

Future descriptor specifications will be documented separately as they are introduced.

---

# Variable Substitution

Templates may reference variables collected by the wizard.

Example:

```

{{projectName}}

```

Variables are resolved during project generation.

Undefined variables should produce validation errors before generation begins.

---

# Versioning

Each template declares its own version.

Future versions of Project Genesis may support template specification versioning to maintain backward compatibility.

---

# Validation Rules

A valid template must:

- Contain all required descriptors.
- Use valid descriptor formats.
- Contain unique variable keys.
- Avoid circular dependencies between descriptors.
- Pass all platform validation rules.

Templates that fail validation must not be generated.

---

# Design Principles

Templates should be:

- Self-contained
- Portable
- Deterministic
- Human-readable
- Source-control friendly

Templates should never contain secrets, credentials, or environment-specific configuration.

---

# Future Extensions

The specification is designed to support additional capabilities, including:

- Feature modules
- Plugin descriptors
- Remote template repositories
- Conditional generation
- Custom validators
- AI-assisted template creation

Future extensions should preserve backward compatibility whenever practical.