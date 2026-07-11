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

        console.error(
            "Project Genesis template was not found."
        );

        return;

    }

    const preparationService =
        new PreparationService();

    const preparationResult =
        await preparationService.prepare(template);

    if (
        !preparationResult.success ||
        !preparationResult.template
    ) {

        console.error(
            "Template preparation failed.",
            preparationResult.errors
        );

        return;

    }

    const preparedTemplate =
        preparationResult.template;

    preparedTemplate.variables.set(
        "PROJECT_NAME",
        "Genesis Test Project"
    );

    preparedTemplate.variables.set(
        "CLIENT_NAME",
        "Internal Test Client"
    );

    preparedTemplate.variables.set(
        "PROJECT_DESCRIPTION",
        "A generated test project used to verify the Project Genesis pipeline."
    );

    preparedTemplate.variables.set(
        "TECH_STACK",
        "TypeScript"
    );

    preparedTemplate.variables.set(
        "CREATED_DATE",
        new Date().toISOString()
    );

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "project-genesis-test"
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

    console.log(
        "Project Genesis template generated successfully."
    );

    console.log(
        `Output: ${outputPath}`
    );

    console.log(
        `Folders created: ${plan.folders.length}`
    );

    console.log(
        `Files created: ${plan.files.length}`
    );

}

main().catch((error: unknown) => {

    console.error(
        "Template generation test failed.",
        error
    );

    process.exitCode = 1;

});