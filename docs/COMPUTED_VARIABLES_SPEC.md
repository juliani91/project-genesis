# Computed Variables Specification

## Purpose

Computed Variables allow Project Genesis to derive additional template variables automatically from values already collected by the wizard.

Users should not be prompted for information that can be computed.

---

# Examples

Wizard answer:

```text
PROJECT_NAME

Inventory Management System
```

Automatically generates:

```text
PROJECT_SLUG

inventory-management-system
```

---

Wizard answer:

```text
PROJECT_NAME

Blood Donor Network
```

Automatically generates:

```text
PROJECT_SLUG

blood-donor-network
```

---

# Initial Built-in Variables

Version 1 supports:

- PROJECT_SLUG
- CREATED_DATE
- CURRENT_YEAR

Future versions may support:

- UUID
- TIMESTAMP
- AUTHOR
- COMPANY
- CURRENT_MONTH
- CURRENT_DAY
- CURRENT_TIME
- RANDOM_ID

---

# Generation Order

Wizard Answers

↓

VariableCollectionBuilder

↓

Computed Variable Service

↓

VariableCollection

↓

Template Rendering

Computed variables are added after user answers have been collected.

---

# Variable Ownership

Wizard answers always take precedence.

Computed variables may not overwrite values supplied by the user.

Example:

```text
PROJECT_NAME
```

is provided by the wizard.

```text
PROJECT_SLUG
```

is generated.

---

# Collision Rules

If a computed variable already exists:

- do not overwrite it
- preserve the existing value

This allows future templates to provide custom values.

---

# Built-in Variables

## PROJECT_SLUG

Generated from:

```text
PROJECT_NAME
```

Rules:

- lowercase
- trim whitespace
- spaces become hyphens
- repeated hyphens collapse
- remove unsupported characters

Example:

```text
Inventory Management System
```

↓

```text
inventory-management-system
```

---

## CREATED_DATE

Format:

```text
YYYY-MM-DD
```

Example:

```text
2026-07-11
```

---

## CURRENT_YEAR

Format:

```text
2026
```

---

# Extensibility

Future versions may allow templates to register custom computed-variable generators.

Example:

```text
API_NAMESPACE

↓

inventory.management.api
```

---

# Design Goals

Computed Variables should:

- require no user interaction
- be deterministic
- be reusable
- never overwrite wizard answers
- execute before rendering
- remain independent of templates

---

# Backward Compatibility

Existing templates continue to function without modification.

Templates may begin using computed variables whenever desired.

# Current Implementation Status

Project Genesis currently generates three built-in computed variables.

## PROJECT_SLUG

Derived from `PROJECT_NAME`.

Example:

```text
Inventory Management System