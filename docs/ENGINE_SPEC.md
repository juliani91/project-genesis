# Engine Specification

## Purpose

The Project Genesis Engine transforms a template package into a generated project.

The engine is responsible for discovering templates, preparing them for execution, and generating the final project.

---

# Engine Overview

The engine is organized into three sequential phases.

```
Discovery

↓

Preparation

↓

Generation
```

Each phase has a well-defined responsibility and produces output consumed by the next phase.

---

# Phase 1 – Discovery

The Discovery phase identifies available templates.

Responsibilities:

- Locate template directories
- Read `genesis.json`
- Build initial `TemplatePackage` objects

Output:

```
TemplatePackage
```

At this stage, only template metadata is loaded.

---

# Phase 2 – Preparation

The Preparation phase enriches and validates the selected template.

Responsibilities:

- Load descriptors
- Progressively enrich the `TemplatePackage`
- Collect user input through the Wizard
- Resolve variables
- Validate descriptors and user input

Output:

```
Prepared Template
```

Only validated templates proceed to generation.

---

# Phase 3 – Generation

The Generation phase creates the final project.

Responsibilities:

- Build the generation plan
- Create folders
- Render files
- Execute feature modules
- Write output to disk

Output:

```
Generated Project
```

Generation should be deterministic when given the same template and inputs.

---

# Engine Components

The engine is composed of several cooperating layers.

| Component | Responsibility |
|-----------|----------------|
| Discovery Service | Find available templates |
| Loaders | Load descriptors |
| Validators | Verify templates and input |
| Services | Coordinate workflows |
| Generators | Produce project output |

Each component has a single responsibility.

---

# Data Flow

```
Template Files

↓

Discovery

↓

Template Package

↓

Progressive Enrichment

↓

Prepared Template

↓

Generation Plan

↓

Generated Project
```

Data flows in one direction.

Each stage consumes the previous stage's output without modifying it.

---

# Error Handling

Errors should be detected as early as possible.

Validation failures prevent project generation.

Generation should fail gracefully with actionable error messages.

The engine should avoid partial project generation whenever possible.

---

# Future Capabilities

The engine is designed to support future enhancements, including:

- Feature modules
- Plugin execution
- Remote template repositories
- Conditional generation
- Parallel generation tasks
- AI-assisted generation
- Incremental project updates

These capabilities should build upon the existing engine phases without changing the overall architecture.