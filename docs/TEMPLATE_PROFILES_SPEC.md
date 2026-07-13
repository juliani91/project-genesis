# Template Profiles Specification

## Purpose

Template Profiles provide predefined collections of templates that represent complete project stacks.

Profiles improve usability by allowing users to select one profile instead of manually selecting multiple templates.

Profiles integrate with the existing composition engine.

---

# Examples

## Next.js SaaS

Templates

- nextjs
- postgresql
- docker
- playwright
- github-actions

---

## FastAPI API

Templates

- fastapi
- postgresql
- docker
- pytest

---

## Unity Game

Templates

- unity
- git-lfs
- github-actions

---

# Profile Structure

Each profile contains:

- unique identifier
- display name
- description
- category
- base template
- feature templates

---

# Validation

Profiles must satisfy:

- exactly one base template
- zero or more feature templates
- unique template IDs
- compatibility validation
- dependency resolution

---

# Composition

A profile expands into a standard TemplateCompositionRequest.

Profiles do not bypass:

- dependency resolution
- compatibility validation
- composition planning

---

# Future Enhancements

- User-defined profiles
- Profile inheritance
- Marketplace profiles
- Favorites
- Team profiles
- Cloud synchronization

---

# Design Goals

- Simple JSON format
- Human editable
- Version controllable
- Compatible with existing composition engine
- No duplicated composition logic

---

# Backward Compatibility

Profiles are optional.

The existing manual template selection workflow remains fully supported.