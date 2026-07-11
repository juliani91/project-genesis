import { promises as fs } from "fs";
import path from "path";

import {
    GenerationPlanner,
    GenerationService,
    PreparationService,
    TemplateDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    const template = templates.find(
        (item) =>
            item.manifest.id === "project-genesis"
    );

    if (!template) {

        throw new Error(
            "Project Genesis template was not found."
        );

    }

    const preparationService =
        new PreparationService();

    const preparationResult =
        await preparationService.prepare(template);

    if (
        !preparationResult.success ||
        !preparationResult.template
    ) {

        throw new Error(
            [
                "Template preparation failed:",
                ...preparationResult.errors
            ].join(" ")
        );

    }

    const preparedTemplate =
        preparationResult.template;

    preparedTemplate.variables.set(
        "PROJECT_NAME",
        "Rendering Pipeline Test"
    );

    preparedTemplate.variables.set(
        "CLIENT_NAME",
        "Internal Test Client"
    );

    preparedTemplate.variables.set(
        "PROJECT_DESCRIPTION",
        "A complete test of render and copy modes."
    );

    preparedTemplate.variables.set(
        "TECH_STACK",
        "TypeScript"
    );

    preparedTemplate.variables.set(
        "CREATED_DATE",
        "2026-07-10"
    );

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "rendering-pipeline-test"
    );

    await fs.rm(outputPath, {
        recursive: true,
        force: true
    });

    const planner =
        new GenerationPlanner();

    const plan =
        await planner.createPlan(
            preparedTemplate,
            outputPath
        );

    const generationService =
        new GenerationService();

    await generationService.generate(plan);

    const generatedReadme =
        await fs.readFile(
            path.join(
                outputPath,
                "README.md"
            ),
            "utf-8"
        );

    const copiedFile =
        await fs.readFile(
            path.join(
                outputPath,
                "Content",
                "copy-test.txt"
            ),
            "utf-8"
        );

    if (
        !generatedReadme.includes(
            "# Rendering Pipeline Test"
        )
    ) {

        throw new Error(
            "README.md did not contain the rendered project name."
        );

    }

    if (
        generatedReadme.includes(
            "{{PROJECT_NAME}}"
        )
    ) {

        throw new Error(
            "README.md still contains an unresolved PROJECT_NAME placeholder."
        );

    }

    if (
        !copiedFile.includes(
            "{{PROJECT_NAME}}"
        )
    ) {

        throw new Error(
            "Copy-mode file was modified during generation."
        );

    }

    console.log(
        "Rendering pipeline test completed successfully."
    );

    console.log(
        `Output: ${outputPath}`
    );

    console.log(
        `Folders generated: ${plan.folders.length}`
    );

    console.log(
        `Files generated: ${plan.files.length}`
    );

}

main().catch((error: unknown) => {

    console.error(
        "Rendering pipeline test failed.",
        error
    );

    process.exitCode = 1;

});