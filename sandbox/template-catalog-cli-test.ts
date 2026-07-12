import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplateCatalogEntry,
    WizardOption
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateCatalogPresenter,
    TemplateCatalogService,
    TemplateDiscoveryService,
    TemplateInheritanceService,
    WizardRunner
} from "../lib/services";

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

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    if (templates.length === 0) {

        throw new Error(
            "No templates were discovered."
        );

    }

    const catalogService =
        new TemplateCatalogService();

    const catalog =
        catalogService.createCatalog(
            templates
        );

    const promptProvider =
        new TestPromptProvider([
            "project-genesis",
            "Catalog CLI Project",
            "Internal Test Client",
            "Tests catalog-driven project generation.",
            "TypeScript",
            "false",
            "false"
        ]);

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
            "The selected catalog entry was not found."
        );

    }

    if (
        selectedEntry.id !==
        "project-genesis"
    ) {

        throw new Error(
            "The automated catalog selection returned the wrong template."
        );

    }

    const presenter =
        new TemplateCatalogPresenter();

    const preview =
        presenter.formatPreview(
            selectedEntry
        );

    if (
        !preview.includes(
            "Project Genesis"
        )
    ) {

        throw new Error(
            "The selected template preview was not formatted correctly."
        );

    }

    const inheritanceService =
        new TemplateInheritanceService();

    const resolvedTemplate =
        await inheritanceService.resolve(
            selectedEntry.template,
            templates
        );

    const wizard =
        resolvedTemplate
            .descriptors
            .wizard;

    if (!wizard) {

        throw new Error(
            "The selected template did not contain a resolved wizard."
        );

    }

    const runner =
        new WizardRunner();

    const answers =
        await runner.run(
            wizard,
            promptProvider
        );

    if (
        answers.some(
            (answer) =>
                answer.key ===
                "DATABASE"
        )
    ) {

        throw new Error(
            "The hidden DATABASE field was collected unexpectedly."
        );

    }

    const outputPath =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-catalog-cli-test"
        );

    await fs.rm(
        outputPath,
        {
            recursive: true,
            force: true
        }
    );

    const request:
        GenerationRequest = {

        template:
            selectedEntry.template,

        answers,

        outputPath
    };

    const generationService =
        new ProjectGenerationService();

    const plan =
        await generationService.generate(
            request
        );

    const readmePath =
        path.join(
            outputPath,
            "README.md"
        );

    if (
        !await pathExists(
            readmePath
        )
    ) {

        throw new Error(
            "The catalog-selected template did not generate README.md."
        );

    }

    const readme =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    if (
        !readme.includes(
            "# Catalog CLI Project"
        )
    ) {

        throw new Error(
            "The generated README did not contain the project name."
        );

    }

    if (
        !readme.includes(
            "catalog-cli-project"
        )
    ) {

        throw new Error(
            "The generated README did not contain the computed project slug."
        );

    }

    if (
        readme.includes(
            "{{PROJECT_NAME}}"
        ) ||
        readme.includes(
            "{{PROJECT_SLUG}}"
        )
    ) {

        throw new Error(
            "The generated README contained unresolved placeholders."
        );

    }

    const messages =
        promptProvider.getMessages();

    if (
        messages.length !== 7
    ) {

        throw new Error(
            `Expected 7 prompt messages but received ${messages.length}.`
        );

    }

    if (
        messages[0] !==
        "Select a template"
    ) {

        throw new Error(
            "The first prompt was not the catalog template picker."
        );

    }

    console.log(preview);

    console.log(
        "Selected template:",
        selectedEntry.name
    );

    console.log(
        "Prompt count:",
        messages.length
    );

    console.log(
        "Generated output:",
        plan.outputPath
    );

    console.log(
        "Template catalog CLI test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template catalog CLI test failed.",
            error
        );

        process.exitCode = 1;

    }
);