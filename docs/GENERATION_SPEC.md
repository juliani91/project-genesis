# Generation Engine Specification

## Purpose

The Generation Engine is responsible for transforming a prepared template into a complete project on disk.

Generation occurs in two phases:

1. Planning
2. Execution

---

# Generation Pipeline

PreparedTemplate

↓

GenerationPlan

↓

Folder Generation

↓

File Generation

↓

Generated Project

---

# Generation Plan

A Generation Plan is an in-memory representation of everything that will be generated.

The plan contains:

- Folders
- Files
- Variables
- Output location

The plan does not modify the file system.

---

# Execution

Execution applies the Generation Plan to disk.

Execution should:

1. Create folders
2. Render template files
3. Replace variables
4. Write generated files

---

# Design Goals

- Predictable
- Repeatable
- Testable
- Previewable

---

# Current Implementation Status

The first Generation Engine execution pipeline is complete.

The engine can:

- Execute an immutable `GenerationPlan`.
- Create planned folders.
- Write prepared file contents.
- Generate nested paths.
- Produce a complete project structure on disk.

Generation plans are currently constructed manually.

Descriptor-driven planning, template rendering, conflict handling, and overwrite strategies remain future work.

# Future Features

The Generation Engine should support:

- Dry run mode
- Existing project detection
- Overwrite strategies
- Conditional generation
- Feature modules
- Progress reporting

These features are outside the scope of Sprint 5 but should influence the architecture.