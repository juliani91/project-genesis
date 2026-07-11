import { promises as fs } from "fs";
import path from "path";

import { WizardAnswer } from "../lib/models";

import {
    GenerationPlanner,
    GenerationService,
    PreparationService,
    TemplateDiscoveryService
} from "../lib/services";

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

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    const template = templates.find(
        (item) =>
            item.manifest.id ===
            "project-genesis"
    );

    if (!template) {

        throw new Error(
            "Project Genesis template was not found."
        );

    }

    const answers: WizardAnswer[] = [
        {
            key: "PROJECT_NAME",
            value: "Wizard Generated Project"
        },
        {
            key: "CLIENT_NAME",
            value: "Internal Test Client"
        },
        {
            key: "PROJECT_DESCRIPTION",
            value: "A project generated entirely from wizard answers."
        },
        {
            key: "TECH_STACK",
            value: "TypeScript, Docker, and PostgreSQL"
        },
        {
            key: "USE_DOCKER",
            value: "true"
        },
        {
            key: "USE_DATABASE",
            value: "true"
        },
        {
            key: "DATABASE",
            value: "postgres"
        }
    ];

    const preparationService =
        new PreparationService();

    const preparationResult =
        await preparationService.prepare(
            template,
            answers
        );

    if (
        !preparationResult.success ||
        !preparationResult.template
    ) {

        throw new Error(
            [
                "Wizard-driven preparation failed:",
                ...preparationResult.errors
            ].join(" ")
        );

    }

    const preparedTemplate =
        preparationResult.template;

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "wizard-generated-project"
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

    const readmePath = path.join(
        outputPath,
        "README.md"
    );

    const dockerfilePath = path.join(
        outputPath,
        "Docker",
        "Dockerfile"
    );

    const postgresReadmePath = path.join(
        outputPath,
        "Database",
        "PostgreSQL",
        "README.md"
    );

    const readme =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    const dockerfileExists =
        await pathExists(
            dockerfilePath
        );

    const postgresReadmeExists =
        await pathExists(
            postgresReadmePath
        );

    console.log(
        "Dockerfile exists:",
        dockerfileExists
    );

    console.log(
        "PostgreSQL README exists:",
        postgresReadmeExists
    );

    if (
        !readme.includes(
            "# Wizard Generated Project"
        )
    ) {

        throw new Error(
            "README.md did not use the wizard PROJECT_NAME answer."
        );

    }

    if (
        !readme.includes(
            "Internal Test Client"
        )
    ) {

        throw new Error(
            "README.md did not use the wizard CLIENT_NAME answer."
        );

    }

    if (!dockerfileExists) {

        throw new Error(
            "Dockerfile was not generated from the USE_DOCKER answer."
        );

    }

    if (!postgresReadmeExists) {

        throw new Error(
            "PostgreSQL content was not generated from the database answers."
        );

    }

    console.log(
        "Wizard-driven generation test completed successfully."
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
        "Wizard-driven generation test failed.",
        error
    );

    process.exitCode = 1;

});