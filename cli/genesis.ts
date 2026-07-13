import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplateCatalogEntry,
    TemplateCompositionPlan,
    TemplateProfile,
    WizardOption
} from "../lib/models";

import {
    ConsolePromptProvider,
    PromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateCatalogPresenter,
    TemplateCatalogService,
    TemplateCompatibilityPresenter,
    TemplateCompatibilityValidator,
    TemplateCompositionPlanner,
    TemplateCompositionPresenter,
    TemplateCompositionSelectionService,
    TemplateCompositionService,
    TemplateDiscoveryService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService,
    TemplateProfilePresenter,
    TemplateProfileSelectionService,
    TemplateVersionPresenter,
    TemplateVersionReportService,
    WizardRunner
} from "../lib/services";

import {
    ENGINE_VERSION
} from "../lib/constants";

const DONE_FEATURE_VALUE =
    "__done__";

const MODE_PROFILE =
    "profile";

const MODE_MANUAL =
    "manual";

async function pathExists(
    targetPath: string
): Promise<boolean> {

    try {

        await fs.access(
            targetPath
        );

        return true;

    } catch {

        return false;

    }

}

function buildTemplateOptions(
    entries:
        readonly TemplateCatalogEntry[]
): WizardOption[] {

    return entries.map(
        (entry) => ({
            label:
                [
                    entry.name,
                    `(${entry.category})`
                ].join(" "),

            value:
                entry.id
        })
    );

}

function buildProfileOptions(
    profiles:
        readonly TemplateProfile[]
): WizardOption[] {

    return profiles.map(
        (profile) => ({
            label:
                [
                    profile.name,
                    `(${profile.category})`
                ].join(" "),

            value:
                profile.id
        })
    );

}

async function selectFeatureTemplateIds(
    featureEntries:
        readonly TemplateCatalogEntry[],

    promptProvider:
        PromptProvider
): Promise<string[]> {

    if (
        featureEntries.length === 0
    ) {

        console.log(
            "No optional feature templates are available."
        );

        console.log("");

        return [];

    }

    const selectedIds:
        string[] = [];

    while (true) {

        const remainingEntries =
            featureEntries.filter(
                (entry) =>
                    !selectedIds.includes(
                        entry.id
                    )
            );

        if (
            remainingEntries.length === 0
        ) {

            break;

        }

        const options:
            WizardOption[] = [
            ...buildTemplateOptions(
                remainingEntries
            ),
            {
                label:
                    "Done",

                value:
                    DONE_FEATURE_VALUE
            }
        ];

        const selectedId =
            await promptProvider.select(
                "Select an optional feature",
                options
            );

        if (
            selectedId ===
            DONE_FEATURE_VALUE
        ) {

            break;

        }

        selectedIds.push(
            selectedId
        );

        const selectedEntry =
            remainingEntries.find(
                (entry) =>
                    entry.id ===
                    selectedId
            );

        console.log("");

        console.log(
            `Added feature: ${
                selectedEntry?.name ??
                selectedId
            }`
        );

        console.log("");

    }

    return selectedIds;

}

async function main(): Promise<void> {

    console.log("");

    console.log(
        "===================================="
    );

    console.log(
        "      Project Genesis"
    );

    console.log(
        "  Template Generation Engine"
    );

    console.log(
        "===================================="
    );

    console.log("");

    const promptProvider =
        new ConsolePromptProvider();

    try {

        /*
         * Discover available templates.
         */
        const discoveryService =
            new TemplateDiscoveryService();

        const templates =
            await discoveryService.discover();

        if (
            templates.length === 0
        ) {

            throw new Error(
                "No Project Genesis templates were discovered."
            );

        }

        /*
         * Build the template catalog used by the
         * manual composition workflow.
         */
        const catalogService =
            new TemplateCatalogService();

        const catalog =
            catalogService.createCatalog(
                templates
            );

        /*
         * Discover and sort reusable profiles.
         */
        const profileDiscoveryService =
            new TemplateProfileDiscoveryService();

        const discoveredProfiles =
            await profileDiscoveryService.discover();

        const profileSelectionService =
            new TemplateProfileSelectionService();

        const profiles =
            profileSelectionService.sort(
                discoveredProfiles
            );

        /*
         * Choose between profile-driven generation
         * and manual template composition.
         */
        const modeOptions:
            WizardOption[] = [
            {
                label:
                    "Use a Profile",

                value:
                    MODE_PROFILE
            },
            {
                label:
                    "Build Manually",

                value:
                    MODE_MANUAL
            }
        ];

        const selectedMode =
            await promptProvider.select(
                "Choose a generation mode",
                modeOptions
            );

        let compositionPlan:
            TemplateCompositionPlan;

        /*
         * Profile workflow.
         */
        if (
            selectedMode ===
            MODE_PROFILE
        ) {

            if (
                profiles.length === 0
            ) {

                throw new Error(
                    "No template profiles were discovered."
                );

            }

            console.log("");

            console.log(
                "Available Profiles"
            );

            console.log("");

            const selectedProfileId =
                await promptProvider.select(
                    "Select a profile",
                    buildProfileOptions(
                        profiles
                    )
                );

            const selectedProfile =
                profileSelectionService.findById(
                    profiles,
                    selectedProfileId
                );

            const profilePresenter =
                new TemplateProfilePresenter();

            console.log("");

            console.log(
                profilePresenter.format(
                    selectedProfile
                )
            );

            console.log("");

            const profileCompositionService =
                new TemplateProfileCompositionService();

            const profileResult =
                profileCompositionService.build(
                    selectedProfile,
                    templates
                );

            compositionPlan =
                profileResult.plan;

        } else if (
            selectedMode ===
            MODE_MANUAL
        ) {

            /*
             * Manual composition workflow.
             */
            const selectionService =
                new TemplateCompositionSelectionService();

            const baseEntries =
                selectionService.getBaseTemplates(
                    catalog
                );

            const featureEntries =
                selectionService.getFeatureTemplates(
                    catalog
                );

            if (
                baseEntries.length === 0
            ) {

                throw new Error(
                    "No base templates were discovered."
                );

            }

            console.log("");

            console.log(
                "Available Base Templates"
            );

            console.log("");

            const selectedBaseId =
                await promptProvider.select(
                    "Select a base template",
                    buildTemplateOptions(
                        baseEntries
                    )
                );

            const selectedBaseEntry =
                baseEntries.find(
                    (entry) =>
                        entry.id ===
                        selectedBaseId
                );

            if (!selectedBaseEntry) {

                throw new Error(
                    [
                        "The selected base template could not be found:",
                        selectedBaseId
                    ].join(" ")
                );

            }

            const catalogPresenter =
                new TemplateCatalogPresenter();

            console.log("");

            console.log(
                catalogPresenter.formatPreview(
                    selectedBaseEntry
                )
            );

            console.log("");

            const selectedFeatureIds =
                await selectFeatureTemplateIds(
                    featureEntries,
                    promptProvider
                );

            const compositionRequest =
                selectionService.createRequest(
                    selectedBaseId,
                    selectedFeatureIds,
                    templates
                );

            const planner =
                new TemplateCompositionPlanner();

            compositionPlan =
                planner.createPlan(
                    compositionRequest,
                    templates
                );

        } else {

            throw new Error(
                `Unknown generation mode: ${selectedMode}`
            );

        }

        /*
         * Show the dependency-aware composition plan.
         */
        const compositionPresenter =
            new TemplateCompositionPresenter();

        console.log("");

        console.log(
            compositionPresenter.format(
                compositionPlan
            )
        );

        console.log("");

        /*
         * Validate capabilities before composing or
         * running any wizard prompts.
         */
        const compatibilityValidator =
            new TemplateCompatibilityValidator();

        const compatibilityReport =
            compatibilityValidator.validate(
                compositionPlan
            );

        const compatibilityPresenter =
            new TemplateCompatibilityPresenter();

        console.log(
            compatibilityPresenter.format(
                compositionPlan,
                compatibilityReport
            )
        );

        console.log("");

        if (
            !compatibilityReport.compatible
        ) {

            throw new Error(
                [
                    "The selected template composition is incompatible.",
                    "Resolve the compatibility issues shown above and try again."
                ].join(" ")
            );

        }

        const versionReportService =
            new TemplateVersionReportService();

        const versionReport =
            versionReportService.createReport(
                compositionPlan,
                ENGINE_VERSION
            );

        const versionPresenter =
            new TemplateVersionPresenter();

        console.log("");

        console.log(
            versionPresenter.format(
                ENGINE_VERSION,
                versionReport
            )
        );

        console.log("");

        if (
            !versionReport.compatible
        ) {

            throw new Error(
                [
                    "The selected template composition is not compatible",
                    "with the current Project Genesis engine version."
                ].join(" ")
            );

        }

        /*
         * Merge the base template, resolved dependencies,
         * and selected feature templates.
         */
        const compositionService =
            new TemplateCompositionService();

        const composedTemplate =
            await compositionService.compose(
                compositionPlan,
                templates
            );

        const wizard =
            composedTemplate
                .descriptors
                .wizard;

        if (!wizard) {

            throw new Error(
                "The composed template does not contain a wizard."
            );

        }

        /*
         * Run the merged wizard.
         */
        const wizardRunner =
            new WizardRunner();

        const answers =
            await wizardRunner.run(
                wizard,
                promptProvider
            );

        console.log("");

        /*
         * Select the output location.
         */
        const outputResponse =
            await promptProvider.ask(
                "Output directory:"
            );

        if (!outputResponse) {

            throw new Error(
                "An output directory is required."
            );

        }

        const outputPath =
            path.resolve(
                outputResponse
            );

        if (
            await pathExists(
                outputPath
            )
        ) {

            throw new Error(
                [
                    "The output directory already exists:",
                    outputPath
                ].join(" ")
            );

        }

        const request:
            GenerationRequest = {

            template:
                composedTemplate,

            answers,

            outputPath
        };

        console.log("");

        console.log(
            "Generating project..."
        );

        console.log("");

        const generationService =
            new ProjectGenerationService();

        const generationPlan =
            await generationService.generate(
                request
            );

        console.log("");

        console.log(
            "Generation completed successfully."
        );

        console.log("");

        console.log(
            `Base Template : ${compositionPlan.baseTemplate.manifest.name}`
        );

        console.log(
            `Features      : ${compositionPlan.featureTemplates.length}`
        );

        console.log(
            `Output Folder : ${generationPlan.outputPath}`
        );

        console.log(
            `Folders       : ${generationPlan.folders.length}`
        );

        console.log(
            `Files         : ${generationPlan.files.length}`
        );

        console.log("");

    } finally {

        promptProvider.close();

    }

}

main().catch(
    (error: unknown) => {

        console.error("");

        console.error(
            error instanceof Error
                ? error.message
                : "Project generation failed."
        );

        process.exitCode = 1;

    }
);