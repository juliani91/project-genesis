# Template Composition Specification

## Purpose

Template Composition allows a generated project to be assembled from multiple templates.

Instead of selecting exactly one template, users may select:

- One base template
- Zero or more feature templates

The generation engine combines them into one resolved project.

---

# Design Goals

The composition system should:

- Prevent duplicate work
- Reuse existing inheritance
- Preserve deterministic generation
- Detect conflicts
- Support optional modules
- Scale to many templates

---

# Template Roles

Every template belongs to one role.

Current roles:

- Base
- Feature

Future roles:

- Language
- Framework
- Infrastructure
- Tooling
- Testing
- Deployment
- Documentation

---

# Composition Example

Selected Templates

```
Next.js

Docker

Playwright

GitHub Actions
```

Composition

```
Next.js
        +
Docker
        +
Playwright
        +
GitHub Actions
```

Generated Project

```
One merged project
```

---

# Merge Order

Generation occurs in deterministic order.

```
Base
        ↓
Feature 1
        ↓
Feature 2
        ↓
Feature N
```

---

# Conflict Rules

If two feature templates generate the same destination file:

- Detect the conflict.
- Report the conflict.
- Stop generation.

Automatic overwriting is not allowed.

---

# Future Enhancements

- Dependency graphs
- Optional recommendations
- Automatic dependency selection
- Version constraints
- Online template registry
- Marketplace
- Feature packs

---

# Backward Compatibility

Selecting a single base template behaves exactly as it does today.

Existing templates require no changes.