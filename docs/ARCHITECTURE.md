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

```text
TemplateDiscoveryService
        ↓
ParentTemplateResolver
        ↓
TemplateInheritanceService
        ↓
Resolved TemplatePackage
        ↓
PreparationService
        ↓
GenerationPlanner
        ↓
GenerationService

## ParentTemplateResolver

`ParentTemplateResolver` locates parent templates, resolves inheritance chains, rejects missing parents, detects circular references, and validates template ID uniqueness.

## TemplateInheritanceService

`TemplateInheritanceService` loads and merges descriptors from the root parent through the final child.

It coordinates:

- File inheritance
- Folder inheritance
- Wizard inheritance
- Source-file ownership

## ResolvedTemplateFile

`ResolvedTemplateFile` connects a file descriptor to the template path that owns its source file.

This allows inherited files to be rendered from the correct parent template directory.

```text
TemplateDiscoveryService
        ↓
TemplateCatalogService
        ↓
TemplateCatalogEntry[]
        ↓
TemplateCatalogPresenter
        ↓
CLI Template Selection
        ↓
TemplateInheritanceService
        ↓
PreparationService

## TemplateCatalogService

`TemplateCatalogService` converts discovered templates into normalized catalog entries.

It provides:

- Default sorting
- Category filtering
- Tag filtering
- Author filtering
- Search by name, description, and tags

## TemplateCatalogPresenter

`TemplateCatalogPresenter` formats a catalog entry for user-facing preview.

It displays:

- Name
- Description
- Category
- Version
- Author
- Tags
- Parent template

Template Discovery
        │
        ▼
Template Catalog
        │
        ▼
Template Selection
        │
        ▼
Composition Planner
        │
        ▼
Dependency Resolver
        │
        ▼
Composition Service
        │
        ▼
Preparation Service
        │
        ▼
Generation Planner
        │
        ▼
Renderer

Template Discovery
        │
        ▼
Template Catalog
        │
        ▼
Template Selection
        │
        ▼
Composition Planner
        │
        ▼
Capability Resolver
        │
        ▼
Compatibility Validator
        │
        ▼
Composition Service
        │
        ▼
Preparation Service
        │
        ▼
Generation Planner
        │
        ▼
Renderer

Template Discovery
        │
        ▼
Profile Discovery
        │
        ▼
Generation Mode
   │           │
   ▼           ▼
Profile     Manual Selection
   │           │
   └──────┬────┘
          ▼
Composition Planner
          ▼
Capability Resolver
          ▼
Compatibility Validator
          ▼
Composition Service
          ▼
Preparation Service
          ▼
Generation Planner
          ▼
Renderer

Template Discovery
        │
Profile Discovery
        │
        ▼
Generation Mode
   │           │
   ▼           ▼
Profile     Manual Selection
   │           │
   └──────┬────┘
          ▼
Composition Planner
          ▼
Capability Validator
          ▼
Version Report Service
          ├───────────────┐
          │               │
          ▼               ▼
Engine Validator   Template Validator
          │               │
          └──────┬────────┘
                 ▼
      Deprecation Validator
                 ▼
        Preparation Service
                 ▼
        Generation Planner
                 ▼
            Renderer