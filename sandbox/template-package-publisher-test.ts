import {
    promises as fs
} from "fs";

import path from "path";

import {
    TemplatePackagePublisher
} from "../lib/services";

async function createTemplate(
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
                id:
                    "publisher-test",

                name:
                    "Publisher Test",

                version:
                    "1.0.0",

                description:
                    "Publisher test template.",

                author:
                    "Project Genesis"
            },
            null,
            2
        )
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "wizard.json"
        ),
        "{}"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files.json"
        ),
        "[]"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-publisher-test"
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

    const outputDirectory =
        path.join(
            root,
            "packages"
        );

    await createTemplate(
        templatePath
    );

    const publisher =
        new TemplatePackagePublisher();

    /*
     * Initial publish.
     */
    const first =
        await publisher.publish({

            templatePath,

            outputDirectory,

            overwrite:
                false

        });

    if (
        first.status !==
        "published"
    ) {

        throw new Error(
            "The first publish should have returned 'published'."
        );

    }

    if (
        first.result.templateId !==
        "publisher-test"
    ) {

        throw new Error(
            "The published template ID was incorrect."
        );

    }

    if (
        first.result.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The published template version was incorrect."
        );

    }

    if (
        !/^[a-f0-9]{64}$/.test(
            first.result.sha256
        )
    ) {

        throw new Error(
            "The published package SHA-256 was invalid."
        );

    }

    await fs.access(
        first.result.packagePath
    );

    /*
     * Existing package.
     */
    const second =
        await publisher.publish({

            templatePath,

            outputDirectory,

            overwrite:
                true

        });

    if (
        second.status !==
        "existing"
    ) {

        throw new Error(
            "The second publish should have returned 'existing'."
        );

    }

    if (
        second.result.packagePath !==
        first.result.packagePath
    ) {

        throw new Error(
            "The package path changed unexpectedly."
        );

    }

    console.log(
        "Template package publisher test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package publisher test failed.",
            error
        );

        process.exitCode = 1;

    }
);