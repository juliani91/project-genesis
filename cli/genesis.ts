import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest
} from "../lib/models";

import {
    ConsolePromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
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

        const template =
            templates.find(
                (item) =>
                    item.manifest.id ===
                    "project-genesis"
            );

        if (!template) {

            throw new Error(
                "Project Genesis template was not found."
            );

        }

        const inheritanceService =
            new TemplateInheritanceService();

        /*
         * Resolve inheritance before collecting answers
         * so inherited wizard steps are included.
         */
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

            /*
             * Pass the original discovered template.
             * PreparationService performs authoritative
             * inheritance and descriptor resolution.
             */
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