import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplateCatalogEntry,
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
    TemplateCompositionPlanner,
    TemplateCompositionPresenter,
    TemplateCompositionSelectionService,
    TemplateCompositionService,
    TemplateDiscoveryService,
    WizardRunner
} from "../lib/services";

const DONE_FEATURE_VALUE =
    "__done__";

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
            label: [
                entry.name,
                `(${entry.category})`
            ].join(" "),

            value:
                entry.id
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
                label: "Done",
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

        const catalogService =
            new TemplateCatalogService();

        const catalog =
            catalogService.createCatalog(
                templates
            );

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

        const compositionPlan =
            planner.createPlan(
                compositionRequest,
                templates
            );

        const compositionPresenter =
            new TemplateCompositionPresenter();

        console.log("");

        console.log(
            compositionPresenter.format(
                compositionPlan
            )
        );

        console.log("");

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

        const wizardRunner =
            new WizardRunner();

        const answers =
            await wizardRunner.run(
                wizard,
                promptProvider
            );

        console.log("");

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

            /*
             * The composed package already contains the
             * merged wizard, folders, files, and source
             * ownership information.
             */
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