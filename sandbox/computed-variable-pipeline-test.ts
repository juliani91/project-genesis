import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest
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

    const template =
        templates.find(
            item =>
                item.manifest.id ===
                "project-genesis"
        );

    if (!template) {

        throw new Error(
            "Project Genesis template not found."
        );

    }

    const outputPath =
        path.join(
            process.cwd(),
            "sandbox-output",
            "computed-variable-pipeline-test"
        );

    await fs.rm(
        outputPath,
        {
            recursive: true,
            force: true
        }
    );

    const request: GenerationRequest = {

        template,

        outputPath,

        answers: [

            {
                key: "PROJECT_NAME",
                value: "Inventory Management System"
            },

            {
                key: "CLIENT_NAME",
                value: "Internal Test"
            },

            {
                key: "PROJECT_DESCRIPTION",
                value: "Tests computed variables."
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

        ]

    };

    const generationService =
        new ProjectGenerationService();

    await generationService.generate(
        request
    );

    const readme =
        await fs.readFile(
            path.join(
                outputPath,
                "README.md"
            ),
            "utf8"
        );

    console.log(readme);

    if (
        !readme.includes(
            "inventory-management-system"
        )
    ) {

        throw new Error(
            "PROJECT_SLUG was not rendered."
        );

    }

    if (
        !readme.includes(
            new Date()
                .getUTCFullYear()
                .toString()
        )
    ) {

        throw new Error(
            "CURRENT_YEAR was not rendered."
        );

    }

    if (
        !/\d{4}-\d{2}-\d{2}/
            .test(readme)
    ) {

        throw new Error(
            "CREATED_DATE was not rendered."
        );

    }

    if (
        readme.includes(
            "{{PROJECT_SLUG}}"
        )
    ) {

        throw new Error(
            "PROJECT_SLUG placeholder was not replaced."
        );

    }

    if (
        readme.includes(
            "{{CURRENT_YEAR}}"
        )
    ) {

        throw new Error(
            "CURRENT_YEAR placeholder was not replaced."
        );

    }

    console.log(
        "Computed variable pipeline test completed successfully."
    );

}

main().catch(
    (
        error: unknown
    ) => {

        console.error(
            "Computed variable pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);