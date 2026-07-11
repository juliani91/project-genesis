# File Descriptor Specification

## Purpose

A File Descriptor defines a file that Project Genesis should include in the generated project.

File descriptors are read during generation planning and converted into `GeneratedFile` models.

The descriptor defines intent only. It does not read, render, copy, or write files directly.

---

# Descriptor Location

File descriptors are stored in:

```text
files.json
```

Source files referenced by the descriptor are stored under the template package's `files/` directory.

Example:

```text
template-name/
├── files.json
└── files/
    ├── README.md
    ├── CLAUDE.md
    └── Docs/
        └── ARCHITECTURE.md
```

---

# Initial Format

`files.json` contains an array of file descriptors.

```json
[
  {
    "source": "README.md",
    "destination": "README.md",
    "mode": "render"
  },
  {
    "source": "CLAUDE.md",
    "destination": "CLAUDE.md",
    "mode": "render"
  },
  {
    "source": "logo.png",
    "destination": "Content/logo.png",
    "mode": "copy"
  }
]
```

---

# Properties

## source

The relative path of the source file inside the template package's `files/` directory.

Example:

```text
Docs/ARCHITECTURE.md
```

The source path must not be absolute.

---

## destination

The relative output path inside the generated project.

Example:

```text
Docs/ARCHITECTURE.md
```

The destination path must not be absolute.

---

## mode

Defines how Project Genesis processes the source file.

Supported values:

| Mode | Behavior |
|------|----------|
| `render` | Read the file as text and replace template variables. |
| `copy` | Copy the file without modifying its contents. |

---

# Rules

A valid file descriptor must:

- Define a non-empty `source`.
- Define a non-empty `destination`.
- Use a supported `mode`.
- Use forward slashes (`/`) in relative paths.
- Reference a source file located inside the template package.
- Write only to a destination inside the generated project.
- Avoid duplicate destination paths.

Absolute paths are not allowed.

---

# Variable Rendering

Files using `render` mode may contain variables.

Example:

```text
{{PROJECT_NAME}}
```

Project Genesis replaces variables during generation planning before the file is written.

Undefined variables must produce a validation error before generation begins.

Files using `copy` mode are not interpreted and must remain unchanged.

---

# Planning

The `GenerationPlanner` converts each File Descriptor into a `GeneratedFile`.

The planner combines:

- the template package path
- the template `files/` directory
- the descriptor source
- the selected output path
- the descriptor destination
- the prepared variable collection

No filesystem output occurs during planning.

---

# File Type Support

Project Genesis supports any file type.

Text files may use `render` mode.

Binary files should use `copy` mode.

Examples include:

- Markdown
- JSON
- YAML
- TypeScript
- JavaScript
- Python
- Dockerfiles
- Images
- PDFs
- Other static assets

---

# Generation Rules

File descriptors may define optional generation rules.

Example:

```json
{
  "source": "Dockerfile",
  "destination": "Dockerfile",
  "mode": "render",
  "rules": [
    {
      "type": "condition",
      "variable": "USE_DOCKER",
      "equals": "true"
    }
  ]
}
```

When no rules are present, the file is always included.

When rules are present, all rules must evaluate to true for the file to participate in the Generation Plan.

Rules are evaluated during planning before the source file is rendered.

---

# Future Extensions

Future versions may support:

- Conditional files
- Feature-module files
- Overwrite strategies
- File permissions
- Executable flags
- Encoding selection
- Line-ending selection
- Rename rules