# Template Inheritance Specification

## Purpose

Template Inheritance allows one template to extend another.

This promotes reuse while reducing duplication.

---

# Example

Base Template

```
base-web
```

Child Template

```
nextjs-api
```

Manifest:

```json
{
  "id": "nextjs-api",
  "extends": "base-web"
}
```

---

# Resolution Order

Parent Template

↓

Child Template

Child values override parent values.

---

# Files

Files are inherited.

If both templates contain:

```
README.md
```

the child version replaces the parent version.

---

# Generation Rules

Generation rules are inherited.

Child rules override matching parent rules.

New child rules are appended.

---

# Wizard

Wizard steps are inherited.

Matching step IDs replace parent steps.

New steps are appended.

---

# Manifest

Parent manifest values are inherited.

Child manifest values override.

---

# Merge Rules

Parent

↓

Child

Priority:

Child > Parent

---

# Circular References

The resolver must reject:

```
A extends B
B extends A
```

and:

```
A

↓

B

↓

C

↓

A
```

---

# Multiple Inheritance

Version 1 supports exactly one parent.

Future versions may support:

```json
{
  "extends": [
    "base-web",
    "docker"
  ]
}
```

---

# Design Goals

Inheritance should:

- reduce duplication
- remain deterministic
- preserve backward compatibility
- avoid hidden conflicts
- keep child templates explicit

---

# Backward Compatibility

Templates without an `extends` property continue to function exactly as they do today.

# Current Implementation Status

Project Genesis currently supports single-parent template inheritance.

The inheritance chain is resolved in this order:

```text
root parent
    ↓
intermediate parent
    ↓
final child