# Generation Rule Specification

## Purpose

Generation Rules determine whether a template descriptor should participate in generation planning.

Rules are evaluated during planning.

Descriptors whose rules evaluate to false are omitted from the GenerationPlan.

Generation Rules never create or modify files directly.

---

# Initial Rule Type

The first supported rule type is:

Condition

A condition compares a wizard variable to an expected value.

Example:

```json
{
    "variable": "DATABASE",
    "equals": "postgres"
}
```

The descriptor is included only when:

```
DATABASE == "postgres"
```

---

# Rule Location

Rules are optional.

Example:

```json
{
    "source": "Dockerfile",
    "destination": "Dockerfile",
    "mode": "render",

    "rules": [
        {
            "variable": "USE_DOCKER",
            "equals": "true"
        }
    ]
}
```

When no rules exist, the descriptor always participates.

---

# Evaluation

All rules must evaluate to true.

Future versions may support:

- Any rule
- Nested rule groups
- Negation
- Comparisons
- Numeric operators
- Custom evaluators

---

# Design Principles

Rules must be:

- JSON
- Human readable
- Deterministic
- Easy to validate
- Independent of rendering

---

# Current Implementation Status

Project Genesis currently supports condition rules that compare one prepared variable against an expected string value.

Example:

```json
{
  "type": "condition",
  "variable": "USE_DOCKER",
  "equals": "true"
}
```

---

# Future Extensions

Future rule types may include:

- Platform
- Feature module
- Plugin
- Generation phase
- AI decision