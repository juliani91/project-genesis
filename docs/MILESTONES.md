# Milestones

This document defines the planned development phases for Project Genesis.

Each milestone should produce a functional, testable improvement to the application.

---

# Milestone 1 — Project Generator Engine

## Objective

Build the core engine capable of generating a project from a template.

## Deliverables

- Project generation engine
- Folder creation
- File creation
- Variable replacement
- CLI execution

## Success Criteria

Generate a complete project structure from a single template.

# Sprint 5 — Generation Engine

## Objective

Build the first executable generation pipeline.

## Completed

- Defined the Generation Engine specification.
- Created `GeneratedFolder`.
- Created `GeneratedFile`.
- Created `GenerationPlan`.
- Created `GenerationPlanner`.
- Created `FolderGenerator`.
- Created `FileGenerator`.
- Created `GenerationService`.
- Verified folder and file generation through a sandbox test.

## Current Limitation

Generation plans are currently constructed manually.

Template-driven folder and file planning will be implemented in the next sprint.

## Status

Complete

---

# Milestone 2 — Template System

## Objective

Create a reusable template format that defines project structure and content.

## Deliverables

- Template specification
- Template loader
- Markdown templates
- Variable definitions

## Success Criteria

Support multiple project templates without changing application code.

---

# Milestone 3 — Feature Modules

## Objective

Allow templates to include optional features.

## Deliverables

- Conditional folders
- Conditional files
- Feature dependencies
- Feature validation

## Success Criteria

Generated projects change based on selected features.

---

# Milestone 4 — Preview Engine

## Objective

Allow users to preview generated output before creation.

## Deliverables

- Folder tree preview
- File preview
- Generation summary

## Success Criteria

Users can review the generated project before writing files.

---

# Milestone 5 — User Interface

## Objective

Replace the command-line interface with a guided project wizard.

## Deliverables

- Multi-step wizard
- Project configuration forms
- Review screen
- Generation screen

## Success Criteria

A complete project can be generated without using the command line.

---

# Milestone 6 — Plugin Architecture

## Objective

Support external templates and feature modules.

## Deliverables

- Template discovery
- Plugin loading
- Template validation

## Success Criteria

New templates can be installed without modifying Project Genesis.

---

# Milestone 7 — AI Workspace

## Objective

Generate AI-ready documentation and prompts.

## Deliverables

- CLAUDE.md generation
- Prompt templates
- Architect/Builder workflow documents
- AI context files

## Success Criteria

An AI assistant can begin work using only the generated repository.

---

# Milestone 8 — Project Templates

## Objective

Expand the built-in template library.

## Planned Templates

- Web Application
- REST API
- Desktop Application
- CLI Tool
- Automation Project
- Unity Game
- Python Library

## Success Criteria

Users can select from multiple project types during generation.

---

# Future Milestones

Potential future enhancements include:

- Template marketplace
- Team template repositories
- Project updates from templates
- Template versioning
- Cloud synchronization
- Multi-user collaboration


# Sprint 7 – Rendering Engine

## Objective

Extract rendering responsibilities from the Generation Planner.

## Completed

- Created Rendering Engine specification.
- Introduced RenderedContent model.
- Added TemplateRenderer.
- Added render mode.
- Added copy mode.
- Added unsupported mode handling.
- Refactored GenerationPlanner.
- Added unresolved placeholder detection.
- Added end-to-end rendering validation.

## Status

Complete

# Sprint 8 – Generation Rules

## Objective

Introduce conditional folder and file generation based on prepared template variables.

## Completed

- Added the Generation Rule specification.
- Added the base `GenerationRule` model.
- Added `ConditionRule`.
- Added optional rule support to folder descriptors.
- Added optional rule support to file descriptors.
- Added `ConditionEvaluator`.
- Integrated rule evaluation into `GenerationPlanner`.
- Added simple single-rule planning tests.
- Added multiple-rule planning tests.
- Verified conditional generation through the full filesystem pipeline.

## Rule Behavior

- Descriptors without rules are always included.
- Descriptors with rules require every rule to evaluate to true.
- Missing variables cause condition rules to evaluate to false.
- Unsupported rule types produce an explicit error.
- Excluded file descriptors are skipped before rendering.

## Status

Complete

---

# Sprint 9 – Wizard Runtime

## Objective

Replace manual variable creation with a wizard-driven runtime.

## Completed

- Wizard Runtime specification
- WizardAnswer model
- WizardSession model
- WizardRuntime
- WizardSessionValidator
- VariableCollectionBuilder
- Wizard-driven PreparationService
- Wizard-driven Generation pipeline
- Automatic CREATED_DATE variable
- End-to-end wizard pipeline demonstration

## Status

Complete

---

# Sprint 10 – Interactive Wizard Runner

## Objective

Create the first interactive command-line interface for Project Genesis.

## Completed

- Added the Interactive Runner specification.
- Added the `PromptProvider` abstraction.
- Added `ConsolePromptProvider`.
- Added `TestPromptProvider`.
- Added `WizardRunner`.
- Added required-field reprompting.
- Added field-type prompt formatting.
- Added automated answer-collection testing.
- Added `GenerationRequest`.
- Added `ProjectGenerationService`.
- Added the CLI entry point.
- Added the `npm run genesis` command.
- Added safe existing-output protection.
- Verified full and basic interactive generation.

## CLI Command

```bash
npm run genesis

# Sprint 11 – Typed Wizard Fields

## Objective

Replace error-prone free-text configuration values with typed wizard fields and guided prompts.

## Completed

- Added the Typed Wizard specification.
- Added `WizardOption`.
- Expanded `WizardFieldType` with `boolean` and `select`.
- Added optional select-field options.
- Added boolean prompts.
- Added select prompts.
- Expanded the `PromptProvider` contract.
- Added automated typed-prompt testing.
- Updated `WizardRunner` to choose prompts by field type.
- Added typed wizard field-definition validation.
- Added typed wizard answer validation.
- Updated the Project Genesis template to use boolean and select fields.
- Verified typed answers through the complete generation pipeline.

## Supported Field Types

- `string`
- `multiline`
- `boolean`
- `select`

## Status

Complete

# Sprint 12 – Conditional Wizard Flow

## Objective

Allow wizard fields to appear or be skipped based on answers collected earlier in the same wizard session.

## Completed

- Added the Conditional Wizard specification.
- Added `FieldVisibilityRule`.
- Added `visibleWhen` support to `WizardField`.
- Added `FieldVisibilityEvaluator`.
- Added visibility-rule validation.
- Added support for hidden required fields.
- Added chained field visibility.
- Updated `WizardRunner` to skip hidden fields.
- Updated the Project Genesis wizard so database selection is shown only when database support is enabled.
- Removed the obsolete `None` database option.
- Added an end-to-end conditional wizard pipeline test.

## Visibility Behavior

- Fields without `visibleWhen` are always visible.
- Conditional fields are evaluated immediately before prompting.
- Missing or non-matching dependencies hide the field.
- Hidden fields do not produce answers.
- Hidden required fields do not produce validation errors.
- Visibility rules may reference only earlier fields.

## Status

Complete

# Sprint 13 – Computed Variables

## Objective

Allow Project Genesis to derive reusable template variables automatically from wizard answers and runtime context.

## Completed

- Added the Computed Variables specification.
- Added `ComputedVariable`.
- Added `VariableCollection.setIfMissing()`.
- Added `ProjectSlugGenerator`.
- Added `CurrentDateGenerator`.
- Added `CurrentYearGenerator`.
- Added `ComputedVariableService`.
- Integrated computed variables into `PreparationService`.
- Removed built-in date creation from `VariableCollectionBuilder`.
- Updated the Project Genesis README template to use computed values.
- Added an end-to-end computed-variable pipeline test.

## Built-in Variables

- `PROJECT_SLUG`
- `CREATED_DATE`
- `CURRENT_YEAR`

## Collision Behavior

Existing values are preserved.

Computed values are added only when the target variable is missing.

## Status

Complete