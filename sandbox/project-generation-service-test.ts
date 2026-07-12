import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    WizardAnswer
} from "../lib/models";

import {
    ProjectGenerationService,
    TemplateDiscoveryService
} from "../lib/services";

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
            value: "Project Generation Service Test"
        },
        {
            key: "CLIENT_NAME",
            value: "Internal Test Client"
        },
        {
            key: "PROJECT_DESCRIPTION",
            value: "Tests the application-level generation service."
        },
        {
            key: "TECH_STACK",
            value: "TypeScript"
        },
        {
            key: "USE_DOCKER",
            value: "false"
        },
        {
            key: "USE_DATABASE",
            value: "false"
        }
    ];

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "project-generation-service-test"
    );

    await fs.rm(outputPath, {
        recursive: true,
        force: true
    });

    const request: GenerationRequest = {
        template,
        answers,
        outputPath
    };

    const projectGenerationService =
        new ProjectGenerationService();

    const plan =
        await projectGenerationService.generate(
            request
        );

    const readmePath = path.join(
        outputPath,
        "README.md"
    );

    const readme =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    if (
        !readme.includes(
            "# Project Generation Service Test"
        )
    ) {

        throw new Error(
            "The generated README did not contain the project name."
        );

    }

    console.log(
        "Project generation service test completed successfully."
    );

    console.log(
        `Output: ${plan.outputPath}`
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
        "Project generation service test failed.",
        error
    );

    process.exitCode = 1;

});