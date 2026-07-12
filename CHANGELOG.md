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

## v0.9.0

### Added

- Computed Variables specification
- ComputedVariable model
- `VariableCollection.setIfMissing()`
- ProjectSlugGenerator
- CurrentDateGenerator
- CurrentYearGenerator
- ComputedVariableService
- End-to-end computed-variable pipeline test

### Changed

- PreparationService now applies computed variables automatically.
- VariableCollectionBuilder now copies wizard answers only.
- The Project Genesis README template now renders project slug and current year.
- CREATED_DATE now uses `YYYY-MM-DD`.

### Fixed

- Computed variables no longer overwrite existing custom values.
- Date and year generation now use one consistent UTC timestamp.

## v0.10.0

### Added

- Template Inheritance specification
- Optional `extends` property on template manifests
- ParentTemplateResolver
- Inheritance-chain resolution
- Circular inheritance detection
- Duplicate template ID detection
- ResolvedTemplateFile model
- File inheritance
- Folder and rule inheritance
- Wizard-step inheritance
- TemplateInheritanceService
- End-to-end inheritance pipeline test

### Changed

- PreparationService now resolves template inheritance before validation.
- GenerationPlanner now preserves inherited source-file ownership.
- The CLI now loads the resolved inherited wizard before collecting answers.
- Child file descriptors override parent files with the same destination.
- Child folder descriptors override parent folders with the same path.
- Child wizard steps override parent steps with the same ID.

### Fixed

- Missing parent templates now produce actionable errors.
- Circular inheritance chains no longer risk infinite resolution.
- Duplicate template IDs are rejected before parent lookup.
- Inherited files are no longer incorrectly loaded from the child template directory.

## v0.11.0

### Added

- Template Catalog specification
- Optional template category metadata
- Optional template tag metadata
- TemplateCatalogEntry model
- TemplateCatalogService
- Default catalog sorting
- Category filtering
- Tag filtering
- Author filtering
- Case-insensitive multi-term search
- TemplateCatalogPresenter
- Interactive CLI template picker
- Template preview
- Real catalog integration test
- Automated catalog-driven CLI acceptance test

### Changed

- The CLI no longer hardcodes the `project-genesis` template ID.
- Templates are now selected from the discovered catalog.
- The CLI displays template details before starting the wizard.
- The final generation summary includes the selected template name.

### Fixed

- Blank categories are normalized to `Uncategorized`.
- Blank and missing tags are removed from catalog entries.
- Blank search and filter values return the complete catalog.
- Catalog operations do not mutate the original entry collection.