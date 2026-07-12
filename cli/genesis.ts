import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplateCatalogEntry,
    WizardOption
} from "../lib/models";

import {
    ConsolePromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateCatalogPresenter,
    TemplateCatalogService,
    TemplateDiscoveryService,
    TemplateInheritanceService,
    WizardRunner
} from "../lib/services";

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
    catalog:
        readonly TemplateCatalogEntry[]
): WizardOption[] {

    return catalog.map(
        (entry) => {

            return {
                label:
                    [
                        entry.name,
                        `(${entry.category})`
                    ].join(" "),

                value:
                    entry.id
            };

        }
    );

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

        if (templates.length === 0) {

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

        console.log(
            "Available Templates"
        );

        console.log("");

        const selectedTemplateId =
            await promptProvider.select(
                "Select a template",
                buildTemplateOptions(
                    catalog
                )
            );

        const selectedEntry =
            catalog.find(
                (entry) =>
                    entry.id ===
                    selectedTemplateId
            );

        if (!selectedEntry) {

            throw new Error(
                [
                    "The selected template could not be found:",
                    selectedTemplateId
                ].join(" ")
            );

        }

        const template =
            selectedEntry.template;

        console.log("");

        const catalogPresenter =
            new TemplateCatalogPresenter();

        console.log(
            catalogPresenter.formatPreview(
                selectedEntry
            )
        );

        console.log("");

        const inheritanceService =
            new TemplateInheritanceService();

        const resolvedTemplate =
            await inheritanceService.resolve(
                template,
                templates
            );

        const wizard =
            resolvedTemplate
                .descriptors
                .wizard;

        if (!wizard) {

            throw new Error(
                "The selected template does not contain a wizard."
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

            template,

            answers,

            outputPath
        };

        console.log("");
        console.log(
            "Generating project..."
        );
        console.log("");

        const projectGenerationService =
            new ProjectGenerationService();

        const plan =
            await projectGenerationService
                .generate(
                    request
                );

        console.log("");
        console.log(
            "Generation completed successfully."
        );
        console.log("");

        console.log(
            `Template      : ${selectedEntry.name}`
        );

        console.log(
            `Output Folder : ${plan.outputPath}`
        );

        console.log(
            `Folders       : ${plan.folders.length}`
        );

        console.log(
            `Files         : ${plan.files.length}`
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