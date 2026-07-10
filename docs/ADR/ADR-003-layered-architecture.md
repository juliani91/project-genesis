# ADR-003 – Layered Architecture

## Status

Accepted

---

## Context

As Project Genesis grows, responsibilities must remain clearly separated.

Without defined layers, services, loaders, generators, and validators become tightly coupled.

---

## Decision

Project Genesis adopts a layered architecture.

Layers include:

- Models
- Loaders
- Services
- Validators
- Generators

Each layer has a single responsibility.

---

## Consequences

Benefits:

- High cohesion
- Low coupling
- Easier testing
- Better maintainability

Trade-offs:

- More files
- Additional abstraction