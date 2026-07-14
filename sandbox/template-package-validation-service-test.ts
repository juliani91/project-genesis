import { promises as fs } from "fs";
import path from "path";

import {
    TemplatePackageBuildRequest
} from "../lib/models";

import {
    TemplatePackageValidationService
} from "../lib/services";

async function createValidTemplate(
    templatePath: string
): Promise<void> {

    await fs.mkdir(
        path.join(
            templatePath,
            "files"
        ),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id: "validation-test",
                name: "Validation Test",
                version: "1.0.0",
                description: "Validation test template.",
                author: "Project Genesis"
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "wizard.json"
        ),
        "{}",
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files.json"
        ),
        "[]",
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-validation-service-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const templatePath =
        path.join(
            root,
            "template"
        );

    await createValidTemplate(
        templatePath
    );

    const request:
        TemplatePackageBuildRequest = {

        templatePath,

        packagePath:
            path.join(
                root,
                "package.zip"
            ),

        overwrite:
            true

    };

    const service =
        new TemplatePackageValidationService();

    const result =
        await service.validate(
            request
        );

    if (
        result.manifest.id !==
        "validation-test"
    ) {

        throw new Error(
            "The validated template ID was incorrect."
        );

    }

    if (
        result.manifest.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The validated template version was incorrect."
        );

    }

    /*
     * Missing required file.
     */
    await fs.rm(
        path.join(
            templatePath,
            "wizard.json"
        )
    );

    let missingFileThrown =
        false;

    try {

        await service.validate(
            request
        );

    } catch (error) {

        missingFileThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Required template file is missing"
            )
        ) {

            throw new Error(
                `Unexpected missing-file error: ${message}`
            );

        }

    }

    if (!missingFileThrown) {

        throw new Error(
            "A template with a missing required file was accepted."
        );

    }

    console.log(
        "Template package validation service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package validation service test failed.",
            error
        );

        process.exitCode = 1;

    }
);