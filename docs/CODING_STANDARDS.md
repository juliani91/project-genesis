# Coding Standards

## Purpose

This document defines the coding conventions used throughout Project Genesis.

These standards exist to keep the codebase predictable, maintainable, and easy to review.

---

# General Principles

- Prefer readability over cleverness.
- Favor explicit code over hidden behavior.
- Keep methods focused on a single responsibility.
- Refactor when duplication becomes meaningful.
- Follow the Rule of Three before introducing abstractions.

---

# Folder Organization

Each folder has a single purpose.

| Folder | Responsibility |
|---------|----------------|
| models | Data contracts |
| loaders | Read external data |
| validators | Validate models |
| services | Coordinate workflows |
| generators | Produce project artifacts |
| utilities | Generic reusable helpers |

---

# File Naming

- PascalCase for classes and interfaces.
- camelCase for variables and functions.
- One primary class or interface per file.
- File names should match the exported type.

Examples:

```
TemplateService.ts
TemplateManifest.ts
VariableCollection.ts
```

---

# Class Layout

Use this order:

1. Imports
2. Class declaration
3. Constructor
4. Public methods
5. Private methods

Example:

```ts
import ...

export class ExampleService {

    constructor() {}

    public execute() {}

    private helper() {}

}
```

---

# Services

- Services are classes.
- Services coordinate work.
- Services may call other services.
- Services should avoid direct file system access whenever possible.
- Keep one primary responsibility per service.

---

# Models

- Models are interfaces or type aliases.
- Models contain no business logic.
- Models should describe data only.

---

# Loaders

- Loaders read files.
- Loaders return models.
- Loaders do not validate.
- Loaders do not modify data.

---

# Validators

- Validators inspect data.
- Validators never modify data.
- Validators return validation errors.

---

# Error Handling

- Prefer returning meaningful results over throwing exceptions for expected failures.
- Unexpected exceptions should be caught at service boundaries.
- Error messages should be actionable.

---

# Imports

Same folder:

```ts
import { Something } from "./Something";
```

Different folder:

```ts
import { Something } from "../models";
```

Use barrel exports whenever appropriate.

---

# Async Code

- Prefer async/await.
- Avoid nested promise chains.
- Await all asynchronous operations.

---

# Comments

Write comments that explain **why**, not **what**.

Good:

```ts
// Validation occurs after enrichment because
// descriptors are loaded during enrichment.
```

Avoid:

```ts
// Call validate().
validate();
```

---

# Documentation

Every new architectural concept should be documented under `/docs`.

Code explains implementation.

Documentation explains intent.

---

# Public APIs Should Read Like English

Good:

```ts
const preparationService = new PreparationService();

const result =
    await preparationService.prepare(template);
```

Good:

```ts
await generationService.generate(preparedTemplate);
```

Avoid:

```ts
executePreparationPipeline()

runTemplateProcessor()

processEverything()
```

---

# Prefer Composition Over Configuration

Instead of giant configuration objects that try to control every behavior, prefer composing small services together.

PreparationService

↓

TemplatePackageService

↓

TemplateValidator

↓

VariableCollectionService