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

## v0.12.0

### Added

- Template composition specification
- Template roles
- Template composition request model
- Template composition plan model
- Composition planner
- Feature dependency resolution
- Dependency cycle detection
- Composition merge service
- Composition selection service
- Composition presenter
- CLI support for composed projects
- End-to-end composition pipeline test

### Changed

- The CLI now supports one base template plus optional feature templates.
- Template inheritance now preserves existing resolved file ownership.
- Inheritance services recognize already-enriched descriptor collections without reloading them from disk.

### Fixed

- Preserved source ownership during composed template generation.
- Prevented descriptor reloading for intentionally empty descriptor collections.
- Correctly retained feature file ownership after composition.

## v0.13.0

### Added

- Template capability model
- Compatibility issue model
- Compatibility report model
- Capability resolver
- Compatibility validator
- Capability conflict detection
- Compatibility presenter
- CLI compatibility preview
- End-to-end compatibility pipeline tests

### Changed

- Template manifests now support:
  - provides
  - requiresCapabilities
  - conflictsWith
- CLI validates compatibility before composition and generation.

### Fixed

- Prevented incompatible template compositions from reaching the merge and generation pipeline.
- Normalized capability identifiers for matching.

## v0.14.0

### Added

- Template profile model
- Resolved profile model
- Profile validation result model
- Profile composition result model
- Profile discovery service
- Profile resolver
- Profile validator
- Profile composition service
- Profile selection service
- Profile presenter
- CLI profile generation workflow
- End-to-end profile pipeline tests

### Changed

- CLI now supports:
  - Profile-based generation
  - Manual template composition
- Both workflows reuse the same composition and compatibility engine.

### Fixed

- Eliminated duplicated template-selection logic.
- Preserved backward compatibility with manual generation.

## v0.15.0

### Added

- SemanticVersionService
- Engine version validator
- Template version validator
- Deprecation validator
- Version report service
- Version presenter
- Engine version metadata
- Template version constraints
- Deprecation metadata
- CLI version preview
- End-to-end version validation tests

### Changed

- Generation now performs version validation after capability validation.
- Version warnings are displayed without blocking generation.
- Blocking version errors stop generation before the wizard.

### Fixed

- Prevented incompatible engine/template combinations from reaching generation.

## v0.16.0

### Added

- Template registry specification
- Registry models
- Registry manifests
- Registry discovery service
- Registry resolver
- Registry presenter
- Source-aware template discovery
- Registry-aware CLI workflow
- Registry integration tests
- Registry pipeline tests

### Changed

- Template discovery now supports registry-backed sources.
- CLI now begins with registry selection before template discovery.

### Fixed

- Discovery is no longer tightly coupled to the local templates directory.

## v0.17.0

### Added

- Remote registry specification
- Registry cache entry models
- Remote registry response and load-result models
- Remote template download metadata
- Registry HTTP client
- Remote registry loader
- Local registry cache service
- Unified registry load service
- Network, cache, and local source previews
- Remote registry integration tests
- Cached registry pipeline tests

### Changed

- Registry manifests can now be loaded from local storage, a remote HTTP endpoint, or a local cache.
- Successful remote loads update the registry cache.
- Failed remote loads fall back to a valid cached manifest.

### Fixed

- Registry cache writes use a temporary file to avoid partial cache corruption.
- Unsafe registry IDs are rejected before being used as cache filenames.
- Cached timestamps are restored as JavaScript Date objects.

# Sprint 22

## Added

### Remote Package Infrastructure

- Template package download models.
- Template package extraction models.
- Template package cache models.
- Template package integrity models.

### Services

- TemplatePackageDownloader
- TemplatePackageIntegrityService
- TemplatePackageExtractionService
- TemplatePackageCacheService
- TemplatePackagePreparationService

### Security

- SHA-256 package verification.
- ZIP Slip protection.
- Safe temporary extraction.
- Safe temporary downloads.

### Caching

- Versioned package archive cache.
- Versioned extracted template cache.
- Automatic cache reuse.
- Automatic cache rebuild after invalidation.

### Integration

- Remote package discovery.
- Remote template preparation.
- Registry-to-package pipeline.

### Tests

Added comprehensive tests covering:

- Package downloading.
- Package integrity verification.
- Package extraction.
- Package caching.
- Package preparation.
- Remote package integration.
- Remote package generation pipeline.

## Changed

- Template discovery now supports loading a single extracted template.
- Remote templates now produce the same `TemplatePackage` model used by local templates.

## v0.19.0

### Added

- Template package publish request, result, status, and outcome models
- Template package metadata and build models
- Template package validation service
- ZIP package builder
- SHA-256 package hash service
- Template package publisher
- Registry upload request and result models
- Multipart registry upload service
- Optional bearer-token authentication
- Package publish pipeline tests
- Registry publish pipeline tests

### Changed

- Template packages can now be created from valid local template directories.
- Published packages use the `<template-id>-<version>.zip` naming convention.
- Registry upload responses are validated against the expected template ID and version.

### Security

- Package uploads require validated SHA-256 metadata.
- Upload URLs are restricted to HTTP and HTTPS.
- Package paths must reference non-empty ZIP files.
- Registry response identity mismatches are rejected.

# Sprint 24

## Added

- Installed package metadata model.
- Registry indexing model.
- Registry search result model.
- Installed package persistence store.
- Registry indexing service.
- Registry search service.
- Registry manager.
- Package installation service.
- Package removal service.

## Added Tests

- installed-template-package-store-test
- template-registry-index-service-test
- template-package-search-service-test
- template-registry-manager-test
- template-package-installation-service-test
- template-package-removal-service-test
- template-registry-manager-pipeline-test
- template-installation-lifecycle-pipeline-test

## Improved

- Registry package lifecycle.
- Permanent installation workflow.
- Safe uninstall process.
- Cache reuse after uninstall.
- Registry coordination.