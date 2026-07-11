# Interactive Runner Specification

## Purpose

The Interactive Runner collects user answers for a Project Genesis wizard and passes those answers into the existing preparation and generation pipeline.

The runner provides the first direct user interface for Project Genesis.

---

# Architecture

```text
Wizard
      ↓
WizardRunner
      ↓
PromptProvider
      ↓
WizardAnswer[]
      ↓
PreparationService
      ↓
GenerationPlanner
      ↓
GenerationService
      ↓
Generated Project
```

---

# Responsibilities

The Interactive Runner is responsible for:

- Reading wizard steps in order.
- Prompting for each wizard field.
- Collecting user answers.
- Preserving wizard field keys.
- Producing `WizardAnswer[]`.
- Requesting an output directory.
- Starting project generation.
- Reporting success or failure.

---

# Non-Responsibilities

The Interactive Runner must not:

- Validate template descriptors directly.
- Build variables directly.
- Evaluate generation rules.
- Render files.
- Create folders or files itself.
- Modify template packages.

These responsibilities belong to the existing engine services.

---

# Prompt Provider

A Prompt Provider defines how the runner asks a user for information.

The initial implementation is:

```text
ConsolePromptProvider
```

Future providers may include:

```text
WebPromptProvider
DesktopPromptProvider
TestPromptProvider
```

The runner must depend on the Prompt Provider abstraction rather than directly using console input.

---

# Wizard Execution

Wizard steps execute in their declared order.

Within each step, fields execute in their declared order.

Example:

```text
Step: Project Information

Project Name:
Client Name:
Project Description:
Tech Stack:
```

Then:

```text
Step: Generation Options

Use Docker:
Use Database:
Database:
```

---

# Answer Collection

Each prompted field produces one `WizardAnswer`.

Example:

```json
{
  "key": "PROJECT_NAME",
  "value": "Inventory Application"
}
```

The runner must preserve the field key exactly as defined in `wizard.json`.

---

# Required Fields

Required answers must not be empty.

The runner may reprompt the user when a required value is blank.

Final validation remains the responsibility of `WizardRuntime` and `WizardSessionValidator`.

---

# Optional Fields

Optional fields may accept an empty value.

An empty optional answer may either:

- be preserved as an empty string, or
- be omitted from the final answer collection

Version 1 preserves the answer as an empty string.

---

# Output Location

The runner must ask for or derive the output location.

The output path must be separate from the Project Genesis repository unless the user explicitly selects a location inside it.

The runner must not delete an existing project automatically.

---

# Generation Flow

```text
Select template
      ↓
Run wizard
      ↓
Collect answers
      ↓
Prepare template
      ↓
Create generation plan
      ↓
Generate project
      ↓
Report result
```

---

# Error Handling

The runner should report actionable errors for:

- Template not found
- Required answer missing
- Invalid wizard answers
- Preparation failure
- Planning failure
- Existing output conflict
- Filesystem generation failure

Errors should be presented without exposing unnecessary stack traces during normal CLI use.

---

# Design Principles

The Interactive Runner must be:

- Independent from rendering logic
- Independent from generation rules
- Independent from descriptor loading
- Replaceable by another user interface
- Testable with a non-console Prompt Provider
- Focused on orchestration and user interaction

---

# Future Capabilities

Future versions may support:

- Multiple template selection
- Select and boolean field types
- Default values
- Back navigation
- Session cancellation
- Saved answers
- Configuration profiles
- Non-interactive command-line arguments
- JSON input mode
- Project preview before generation

---

```md
# Current Implementation Status

The Interactive Runner currently supports:

- Console-based wizard execution
- Ordered wizard steps and fields
- String and single-line multiline prompts
- Required-field reprompting
- Optional blank answers
- Interactive output-directory selection
- Existing destination protection
- Full integration with preparation, planning, rendering, rules, and generation
- Automated testing through `TestPromptProvider`

The CLI is available through:

```bash
npm run genesis