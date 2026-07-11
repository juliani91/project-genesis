import { promises as fs } from "fs";
import path from "path";

import {
    GenerationPlanner,
    GenerationService,
    PreparationService,
    TemplateDiscoveryService
} from "../lib/services";

import { PreparedTemplate } from "../lib/models";

async function prepareTemplate(): Promise<PreparedTemplate> {

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

    const result =
        await preparationService.prepare(template);

    if (
        !result.success ||
        !result.template
    ) {

        throw new Error(
            [
                "Template preparation failed:",
                ...result.errors
            ].join(" ")
        );

    }

    return result.template;

}

function setCommonVariables(
    preparedTemplate: PreparedTemplate,
    projectName: string
): void {

    preparedTemplate.variables.set(
        "PROJECT_NAME",
        projectName
    );

    preparedTemplate.variables.set(
        "CLIENT_NAME",
        "Internal Test Client"
    );

    preparedTemplate.variables.set(
        "PROJECT_DESCRIPTION",
        "A complete conditional generation test."
    );

    preparedTemplate.variables.set(
        "TECH_STACK",
        "TypeScript"
    );

    preparedTemplate.variables.set(
        "CREATED_DATE",
        "2026-07-11"
    );

}

async function generateEnabledProject(): Promise<string> {

    const preparedTemplate =
        await prepareTemplate();

    setCommonVariables(
        preparedTemplate,
        "Conditional Features Enabled"
    );

    preparedTemplate.variables.set(
        "USE_DOCKER",
        "true"
    );

    preparedTemplate.variables.set(
        "USE_DATABASE",
        "true"
    );

    preparedTemplate.variables.set(
        "DATABASE",
        "postgres"
    );

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "conditional-enabled"
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

    return outputPath;

}

async function generateDisabledProject(): Promise<string> {

    const preparedTemplate =
        await prepareTemplate();

    setCommonVariables(
        preparedTemplate,
        "Conditional Features Disabled"
    );

    preparedTemplate.variables.set(
        "USE_DOCKER",
        "false"
    );

    preparedTemplate.variables.set(
        "USE_DATABASE",
        "false"
    );

    preparedTemplate.variables.set(
        "DATABASE",
        "sqlite"
    );

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "conditional-disabled"
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

    return outputPath;

}

async function pathExists(
    targetPath: string
): Promise<boolean> {

    try {

        await fs.access(targetPath);

        return true;

    } catch {

        return false;

    }

}

async function main(): Promise<void> {

    const enabledPath =
        await generateEnabledProject();

    const disabledPath =
        await generateDisabledProject();

    const enabledDockerFolder =
        await pathExists(
            path.join(
                enabledPath,
                "Docker"
            )
        );

    const enabledDockerFile =
        await pathExists(
            path.join(
                enabledPath,
                "Docker",
                "Dockerfile"
            )
        );

    const enabledPostgresFolder =
        await pathExists(
            path.join(
                enabledPath,
                "Database",
                "PostgreSQL"
            )
        );

    const enabledPostgresFile =
        await pathExists(
            path.join(
                enabledPath,
                "Database",
                "PostgreSQL",
                "README.md"
            )
        );

    const disabledDockerFolder =
        await pathExists(
            path.join(
                disabledPath,
                "Docker"
            )
        );

    const disabledDockerFile =
        await pathExists(
            path.join(
                disabledPath,
                "Docker",
                "Dockerfile"
            )
        );

    const disabledPostgresFolder =
        await pathExists(
            path.join(
                disabledPath,
                "Database",
                "PostgreSQL"
            )
        );

    const disabledPostgresFile =
        await pathExists(
            path.join(
                disabledPath,
                "Database",
                "PostgreSQL",
                "README.md"
            )
        );

    console.log(
        "Enabled Docker folder:",
        enabledDockerFolder
    );

    console.log(
        "Enabled Dockerfile:",
        enabledDockerFile
    );

    console.log(
        "Enabled PostgreSQL folder:",
        enabledPostgresFolder
    );

    console.log(
        "Enabled PostgreSQL file:",
        enabledPostgresFile
    );

    console.log(
        "Disabled Docker folder:",
        disabledDockerFolder
    );

    console.log(
        "Disabled Dockerfile:",
        disabledDockerFile
    );

    console.log(
        "Disabled PostgreSQL folder:",
        disabledPostgresFolder
    );

    console.log(
        "Disabled PostgreSQL file:",
        disabledPostgresFile
    );

    if (
        !enabledDockerFolder ||
        !enabledDockerFile ||
        !enabledPostgresFolder ||
        !enabledPostgresFile
    ) {

        throw new Error(
            "Enabled conditional artifacts were not generated."
        );

    }

    if (
        disabledDockerFolder ||
        disabledDockerFile ||
        disabledPostgresFolder ||
        disabledPostgresFile
    ) {

        throw new Error(
            "Disabled conditional artifacts were generated unexpectedly."
        );

    }

    console.log(
        "Conditional generation test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Conditional generation test failed.",
        error
    );

    process.exitCode = 1;

});