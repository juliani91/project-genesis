# Project Genesis Documentation

Welcome to the Project Genesis documentation.

This folder contains the architecture, specifications, and design decisions that define how Project Genesis is built. The documentation follows the same philosophy as the software itself: design first, implementation second.

---

# Documentation Map

## Vision

Defines the long-term goals and purpose of Project Genesis.

- VISION.md

---

## Architecture

Describes the high-level structure of the application.

- ARCHITECTURE.md

---

## Milestones

Tracks the planned development roadmap.

- MILESTONES.md

---

## Specifications

Defines the contracts used by the platform.

- TEMPLATE_SPEC.md
- ENGINE_SPEC.md
- [PACKAGE_PUBLISHING.md](PACKAGE_PUBLISHING.md) — Package publishing architecture, workflow, and CLI usage.
---

## Architecture Decision Records

Explains why major architectural decisions were made.

- ADR/

---

## Glossary

Defines common terminology used throughout the project.

- GLOSSARY.md

---

# Development Philosophy

Project Genesis follows a documentation-first workflow.

1. Design
2. Review
3. Implement
4. Refactor
5. Document

Documentation is considered the primary source of truth for architecture and design.

---

# Audience

The documentation is intended for:

- Contributors
- Template authors
- Future maintainers
- AI coding assistants

## Package Publishing

Project Genesis supports publishing template packages into a registry manifest.

Example:

```bash
npm run genesis -- publish nextjs \
    --version 1.0.0 \
    --package ./packages/nextjs-1.0.0.zip \
    --registry official
```

Publishing performs validation, calculates a SHA-256 checksum, and atomically updates the registry manifest.