# ADR-002 – Progressive Enrichment

## Status

Accepted

---

## Context

Templates consist of multiple descriptors.

Loading every descriptor during discovery would increase startup time and tightly couple discovery to every template component.

---

## Decision

Template Packages are progressively enriched.

Discovery loads only the manifest.

Additional descriptors are loaded when required.

---

## Consequences

Benefits:

- Faster startup
- Clear separation of responsibilities
- Lazy loading
- Extensible architecture

Trade-offs:

- Multiple loading stages
- Optional properties during enrichment