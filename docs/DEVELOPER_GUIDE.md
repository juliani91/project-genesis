# Developer Guide

## Purpose

This document explains the development standards used throughout Project Genesis.

The goal is to keep the project consistent as it grows.

---

## Project Layers

The application is divided into clearly defined layers.

### Models

Located in:

lib/models/

Models describe data structures only.

Models never contain business logic.

---

### Loaders

Located in:

lib/loaders/

Loaders read data from disk and convert it into models.

Loaders do not validate or modify data.

---

### Validators

Located in:

lib/validators/

Validators inspect models and report errors.

Validators never modify data.

---

### Services

Located in:

lib/services/

Services coordinate workflows.

Services may call loaders, validators, or other services.

Each service should have a single primary responsibility.

---

### Generators

Located in:

lib/generators/

Generators create folders, files, or other output artifacts.

---

### Utilities

Located in:

lib/utilities/

Utility classes contain reusable helper functions.

Utilities should remain generic and independent of business logic.

---

## Coding Standards

- Services are classes.
- Models are interfaces or type aliases.
- Keep methods small and focused.
- Prefer composition over inheritance.
- Avoid duplicated logic.
- Do not mix I/O with business logic.

---

## Import Guidelines

- Use barrel exports (`index.ts`) when importing from another folder.
- Use relative (`./`) imports for files within the same folder.

---

## Development Workflow

Every new feature should follow this order:

1. Design the model.
2. Create the service.
3. Integrate the service.
4. Test the workflow.
5. Refactor only when needed.