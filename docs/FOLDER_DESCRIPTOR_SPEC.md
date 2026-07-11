# Folder Descriptor Specification

## Purpose

A Folder Descriptor defines the directory structure that Project Genesis should generate.

Folder descriptors are read during generation planning and become part of the immutable GenerationPlan.

The descriptor contains metadata only. It never creates folders directly.

---

# Design Goals

- Human readable
- Versionable
- Easy to validate
- Predictable
- Extensible

---

# Initial Format

Folders are stored in:

folders.json

Example:

[
    {
        "path": "docs"
    },
    {
        "path": "src"
    },
    {
        "path": "app"
    }
]

---

# Rules

- Paths are relative to the project root.
- Duplicate paths are not allowed.
- Empty paths are invalid.
- Paths must use forward slashes (`/`) for portability.
- Folder descriptors do not contain absolute paths.

---

# Planning

GenerationPlanner converts folder descriptors into GeneratedFolder models by combining:

- outputPath
- descriptor path

No filesystem operations occur during planning.

---

# Generation Rules

Folder descriptors may define optional generation rules.

Example:

```json
{
  "path": "Docker",
  "rules": [
    {
      "type": "condition",
      "variable": "USE_DOCKER",
      "equals": "true"
    }
  ]
}
```
---

# Future Extensions

Future versions may support:

- conditional folders
- feature modules
- generated folder permissions
- platform-specific folders
- template inheritance