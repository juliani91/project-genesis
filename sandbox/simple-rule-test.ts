import path from "path";

import {
    GenerationPlanner,
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
        "Simple Rule Test"
    );

    preparedTemplate.variables.set(
        "CLIENT_NAME",
        "Internal Test Client"
    );

    preparedTemplate.variables.set(
        "PROJECT_DESCRIPTION",
        "A test of simple generation rules."
    );

    preparedTemplate.variables.set(
        "TECH_STACK",
        "TypeScript"
    );

    preparedTemplate.variables.set(
        "CREATED_DATE",
        "2026-07-11"
    );

    const planner =
        new GenerationPlanner();

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "simple-rule-test"
    );

    preparedTemplate.variables.set(
        "USE_DOCKER",
        "true"
    );

    const enabledPlan =
        await planner.createPlan(
            preparedTemplate,
            outputPath
        );

    const enabledFolder =
        enabledPlan.folders.some(
            (folder) =>
                folder.relativePath === "Docker"
        );

    const enabledFile =
        enabledPlan.files.some(
            (file) =>
                file.relativePath ===
                "Docker/Dockerfile"
        );

    console.log(
        "Docker enabled folder:",
        enabledFolder
    );

    console.log(
        "Docker enabled file:",
        enabledFile
    );

    preparedTemplate.variables.set(
        "USE_DOCKER",
        "false"
    );

    const disabledPlan =
        await planner.createPlan(
            preparedTemplate,
            outputPath
        );

    const disabledFolder =
        disabledPlan.folders.some(
            (folder) =>
                folder.relativePath === "Docker"
        );

    const disabledFile =
        disabledPlan.files.some(
            (file) =>
                file.relativePath ===
                "Docker/Dockerfile"
        );

    console.log(
        "Docker disabled folder:",
        disabledFolder
    );

    console.log(
        "Docker disabled file:",
        disabledFile
    );

    if (
        !enabledFolder ||
        !enabledFile
    ) {

        throw new Error(
            "Docker descriptors were not included when USE_DOCKER was true."
        );

    }

    if (
        disabledFolder ||
        disabledFile
    ) {

        throw new Error(
            "Docker descriptors were included when USE_DOCKER was false."
        );

    }

    console.log(
        "Simple generation rule test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Simple generation rule test failed.",
        error
    );

    process.exitCode = 1;

});