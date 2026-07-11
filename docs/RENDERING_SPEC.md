# Rendering Engine Specification

## Purpose

The Rendering Engine transforms source files from a template package into prepared output that can be included in a `GenerationPlan`.

The Rendering Engine does not write files to disk.

---

# Responsibilities

The Rendering Engine is responsible for:

- Reading source template files.
- Processing files according to their descriptor mode.
- Replacing variables in rendered text files.
- Preserving unmodified files in copy mode.
- Producing prepared file content for the Generation Planner.
- Reporting unsupported rendering modes and invalid source files.

---

# Non-Responsibilities

The Rendering Engine must not:

- Decide which files belong in a project.
- Create output folders.
- Write generated files to disk.
- Select the output directory.
- Modify the `PreparedTemplate`.
- Modify the template package.

These responsibilities belong to planners, generators, and services.

---

# Rendering Modes

Project Genesis initially supports two rendering modes.

| Mode | Behavior |
|------|----------|
| `render` | Read a source file as text and replace template variables. |
| `copy` | Read a source file without interpreting or modifying its contents. |

---

# Render Mode

Files using `render` mode are treated as UTF-8 text.

Example source:

```text
# {{PROJECT_NAME}}

Client: {{CLIENT_NAME}}
```

Example output:

```text
# Inventory Application

Client: Example Client
```

Variables are resolved using the `VariableCollection` from the prepared template.

---

# Copy Mode

Files using `copy` mode are preserved exactly.

Typical examples include:

- Images
- PDFs
- Fonts
- Archives
- Binary assets

Copy-mode files must not undergo variable replacement.

---

# Rendering Flow

```text
FileDescriptor
      │
      ▼
Resolve Source Path
      │
      ▼
Read Source File
      │
      ├── render → Resolve variables
      │
      └── copy   → Preserve content
      │
      ▼
Prepared File Content
```

---

# Planner Integration

The `GenerationPlanner` determines which descriptors belong in the plan.

For every file descriptor, it delegates source-file processing to the Rendering Engine.

The renderer returns prepared content.

The planner combines that content with:

- Source path
- Destination path
- Relative destination path

to create a `GeneratedFile`.

---

# Variable Resolution

Template variables use this format:

```text
{{VARIABLE_NAME}}
```

Variable names must contain:

- Uppercase letters
- Numbers
- Underscores

Example:

```text
{{PROJECT_NAME}}
{{CREATED_DATE}}
```

Undefined variables must remain visible during rendering so that validation can detect them before generation.

---

# Immutability

Rendering must not modify:

- The source template file
- The `FileDescriptor`
- The `PreparedTemplate`
- The `VariableCollection`

Each rendering operation returns new prepared output.

---

# Error Handling

The Rendering Engine should report actionable errors for:

- Missing source files
- Unsupported rendering modes
- Invalid source paths
- Files that cannot be read
- Text files that cannot be decoded
- Unresolved required variables

Expected rendering failures should be reported clearly before filesystem generation begins.

---

# Design Principles

The Rendering Engine must be:

- Deterministic
- Independent from the user interface
- Independent from filesystem output
- Testable without generating a project
- Compatible with future rendering modes

---

# Future Capabilities

Future versions may support:

- Additional text encodings
- Line-ending normalization
- Conditional content blocks
- Template helper functions
- File-specific renderers
- Executable permission metadata
- Content transforms
- AI-assisted content generation

# Current Implementation Status

The Rendering Engine currently supports:

- UTF-8 text rendering
- Variable replacement
- Binary copy mode
- Unsupported mode detection
- Unresolved placeholder detection

Rendering integrates with the Generation Planner and Generation Service to produce complete generated projects.

Future work includes:

- Conditional rendering
- Helper functions
- Line-ending normalization
- Encoding selection
- Additional rendering modes