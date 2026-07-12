# Changelog

## v0.1.0-alpha

### Added
- Initial Next.js application
- Project documentation
- Template package specification
- Template discovery service
- Template service layer
- Dynamic template rendering on the home page

## v0.2.0

### Added

- Folder descriptor system
- File descriptor system
- Template package enrichment
- GenerationPlanner integration
- Real template generation

### Changed

- GenerationPlanner now supports asynchronous planning.
- Preparation pipeline loads folder and file descriptors.

### Fixed

- Template package lookup uses manifest ID consistently.

## v0.3.0

### Added

- Rendering Engine
- TemplateRenderer
- RenderedContent model
- Copy mode support
- Placeholder validation

### Changed

- GenerationPlanner now delegates rendering.
- Rendering pipeline separated from planning.

### Fixed

- Unsupported rendering modes now fail explicitly.
- Missing template variables are detected before generation.

## v0.4.0

### Added

- Generation rule specification
- GenerationRule model
- ConditionRule model
- ConditionEvaluator
- Folder descriptor rules
- File descriptor rules
- Conditional project generation
- Single-rule and multiple-rule sandbox tests

### Changed

- GenerationPlanner now evaluates descriptor rules before planning.
- Excluded files are skipped before rendering.

### Fixed

- Unsupported generation rule types now fail explicitly.
- Missing condition variables now exclude descriptors predictably.

## v0.5.0

### Added

- WizardRuntime
- WizardSession
- WizardAnswer
- WizardSessionValidator
- VariableCollectionBuilder
- Wizard-driven preparation
- Wizard-driven generation
- Automatic CREATED_DATE variable

### Changed

- PreparationService now supports wizard answers.
- Generation pipeline is driven by WizardAnswer collections.

```md
## v0.6.0

### Added

- Interactive Runner specification
- PromptProvider abstraction
- ConsolePromptProvider
- TestPromptProvider
- WizardRunner
- GenerationRequest
- ProjectGenerationService
- Project Genesis CLI
- `npm run genesis`
- Required-field reprompting
- Existing output-directory protection

### Changed

- Project generation can now be initiated through an interactive CLI.
- Wizard answers are collected dynamically instead of being hardcoded.

### Fixed

- Added `tsx` as a local development dependency so npm scripts work reliably.

## v0.7.0

### Added

- Typed Wizard specification
- WizardOption model
- Boolean wizard fields
- Select wizard fields
- Boolean console prompts
- Select console prompts
- Typed prompt routing in WizardRunner
- Typed field-definition validation
- Typed answer validation
- End-to-end typed wizard pipeline test

### Changed

- Project Genesis wizard now uses guided boolean and select prompts.
- Docker and database configuration no longer rely on free-text values.
- PromptProvider now supports `confirm()` and `select()`.

### Fixed

- Invalid boolean answers are rejected.
- Invalid select values are rejected.
- Select fields without options are rejected.
- Duplicate select option values are rejected.

## v0.8.0

### Added

- Conditional Wizard specification
- FieldVisibilityRule model
- `visibleWhen` support for wizard fields
- FieldVisibilityEvaluator
- Conditional field-definition validation
- Chained field visibility
- End-to-end conditional wizard pipeline test

### Changed

- WizardRunner now evaluates field visibility before prompting.
- Hidden fields no longer create WizardAnswer entries.
- Database selection is shown only when database support is enabled.
- The obsolete `None` database option was removed.

### Fixed

- Hidden required fields no longer produce missing-answer errors.
- Unknown visibility references are rejected.
- Self-referencing visibility rules are rejected.
- Visibility rules that reference later fields are rejected.