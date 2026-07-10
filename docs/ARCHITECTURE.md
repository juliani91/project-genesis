# Architecture

## Purpose

Project Genesis is a platform for generating complete software projects from reusable templates.

The architecture is designed to separate project definition, project generation, and user interaction into independent layers. This separation allows new templates, generators, and interfaces to be added without changing the core platform.

---

# Core Principles

Project Genesis follows several architectural principles.

- Documentation drives implementation.
- Templates define projects.
- Descriptors define templates.
- Loaders convert descriptors into domain models.
- Services orchestrate business operations.
- Template Packages are immutable.
- Templates are progressively enriched as descriptors are loaded.

These principles are documented in the project's Architecture Decision Records (ADRs).

---

# High-Level Architecture

```
          User Interface
                 │
                 ▼
             Services
                 │
                 ▼
             Loaders
                 │
                 ▼
          Domain Models
                 │
                 ▼
          Template Files
```

Each layer has a single responsibility and communicates only with the layer directly beneath it.

---

# Repository Structure

```
ProjectGenesis/

app/
docs/
templates/
lib/
tests/
```

Responsibilities:

- app/ contains the user interface.
- docs/ contains architecture and specifications.
- templates/ contains reusable project templates.
- lib/ contains the application logic.
- tests/ contains automated tests.

---

# Layered Architecture

Within `lib`, responsibilities are separated into layers.

```
lib/

models/
loaders/
services/
validators/
generators/
utilities/
```

### Models

Represent business concepts.

Examples:

- TemplatePackage
- TemplateManifest
- Wizard

---

### Loaders

Read descriptors from disk and convert them into domain models.

Each loader has a single responsibility.

---

### Services

Coordinate business operations.

Services compose multiple loaders and models into higher-level workflows.

---

### Validators

Validate templates, descriptors, and user input.

Validators report issues but never modify data.

---

### Generators

Produce project output from validated templates and collected user input.

---

### Utilities

Contain generic helper functions that do not belong to another layer.

Utilities must remain small and reusable.

---

# Template Lifecycle

A template progresses through several stages.

```
Template Files
      │
      ▼
Discovery
      │
      ▼
Template Package
      │
      ▼
Progressive Enrichment
      │
      ▼
Validated Template
      │
      ▼
Generation
```

Each stage builds upon the previous one without modifying earlier artifacts.

---

# Generation Pipeline (Future)

The generation engine will follow this pipeline.

```
Discover Template

↓

Load Descriptors

↓

Collect Variables

↓

Validate

↓

Build Generation Plan

↓

Generate Project

↓

Execute Modules

↓

Completed Project
```

---

# Design Principles

Project Genesis emphasizes:

- High cohesion
- Low coupling
- Single Responsibility Principle
- Immutable domain objects
- Documentation-first development
- Extensibility through modules
- Predictable data flow

---

# Future Evolution

The current architecture establishes the foundation for:

- Multiple user interfaces
- Template modules
- Plugin support
- Remote template repositories
- AI-assisted project generation
- Additional descriptor types

The architecture is intended to evolve while preserving the separation of responsibilities established by the layered design.