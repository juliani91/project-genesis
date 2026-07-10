# ADR-001 – Immutable Template Packages

## Status

Accepted

---

## Context

Template Packages are progressively enriched as additional descriptors are loaded.

A mutable implementation would allow services to modify shared objects in place, increasing the risk of unintended side effects.

---

## Decision

Template Packages are immutable.

Each enrichment operation returns a new TemplatePackage rather than modifying the existing instance.

---

## Consequences

Benefits:

- Predictable data flow
- Easier testing
- Reduced side effects
- Cleaner enrichment pipeline

Trade-offs:

- Slightly more object allocation
- Additional copying during enrichment