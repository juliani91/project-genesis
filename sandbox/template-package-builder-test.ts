import {
    promises as fs
} from "fs";

import path from "path";

import * as unzipper from "unzipper";

import {
    TemplatePackageBuilder
} from "../lib/services";

async function createTemplate(
    templatePath:
        string,

    readmeContents:
        string = "# Package Builder Test"
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
                    "package-builder-test",

                name:
                    "Package Builder Test",

                version:
                    "1.0.0",

                description:
                    "Template package builder test.",

                author:
                    "Project Genesis"
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
        JSON.stringify(
            {
                title:
                    "Package Builder Test",

                description:
                    "",

                steps: []
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files.json"
        ),
        JSON.stringify(
            [
                {
                    source:
                        "README.md",

                    destination:
                        "README.md",

                    mode:
                        "copy"
                }
            ],
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files",
            "README.md"
        ),
        readmeContents,
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-builder-test"
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

    const packagePath =
        path.join(
            root,
            "packages",
            "package-builder-test-1.0.0.zip"
        );

    await createTemplate(
        templatePath
    );

    const builder =
        new TemplatePackageBuilder();

    /*
     * Initial package build.
     */
    const result =
        await builder.build({
            templatePath,

            packagePath,

            overwrite:
                false
        });

    if (
        result.templatePath !==
        path.resolve(
            templatePath
        )
    ) {

        throw new Error(
            "The package build source path was incorrect."
        );

    }

    if (
        result.packagePath !==
        path.resolve(
            packagePath
        )
    ) {

        throw new Error(
            "The generated package path was incorrect."
        );

    }

    if (
        result.metadata.templateId !==
        "package-builder-test"
    ) {

        throw new Error(
            "The package metadata template ID was incorrect."
        );

    }

    if (
        result.metadata.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The package metadata version was incorrect."
        );

    }

    if (
        result.metadata.archiveName !==
        "package-builder-test-1.0.0.zip"
    ) {

        throw new Error(
            "The package metadata archive name was incorrect."
        );

    }

    if (
        result.metadata.archiveFormat !==
        "zip"
    ) {

        throw new Error(
            "The package metadata archive format was incorrect."
        );

    }

    if (
        result.metadata.sizeBytes <=
        0
    ) {

        throw new Error(
            "The package metadata size was not populated."
        );

    }

    if (
    !/^[a-f0-9]{64}$/.test(
        result.metadata.sha256
    )
) {

    throw new Error(
        "The generated package SHA-256 checksum was invalid."
    );

}

    if (
        !(result.metadata.createdAt instanceof Date)
    ) {

        throw new Error(
            "The package metadata timestamp was not a Date."
        );

    }

    await fs.access(
        result.packagePath
    );

    /*
     * Inspect the archive structure.
     */
    const archive =
        await unzipper.Open.file(
            result.packagePath
        );

    const archiveEntries =
        archive.files.map(
            (entry) =>
                entry.path.replace(
                    /\\/g,
                    "/"
                )
        );

    const expectedEntries = [
        "genesis.json",
        "wizard.json",
        "files.json",
        "files/README.md"
    ];

    for (
        const expectedEntry
        of expectedEntries
    ) {

        if (
            !archiveEntries.includes(
                expectedEntry
            )
        ) {

            throw new Error(
                [
                    "The generated package was missing:",
                    expectedEntry,
                    `Entries: ${archiveEntries.join(", ")}`
                ].join(" ")
            );

        }

    }

    if (
        archiveEntries.some(
            (entry) =>
                entry.startsWith(
                    "template/"
                )
        )
    ) {

        throw new Error(
            "The package incorrectly wrapped the template in an extra directory."
        );

    }

    const rootEntries =
        await fs.readdir(
            path.dirname(
                result.packagePath
            )
        );

    if (
        rootEntries.some(
            (entry) =>
                entry.includes(
                    ".tmp.zip"
                )
        )
    ) {

        throw new Error(
            "A temporary package archive remained after success."
        );

    }

    /*
     * Existing archive is rejected when overwrite is false.
     */
    let existingThrown =
        false;

    try {

        await builder.build({
            templatePath,

            packagePath,

            overwrite:
                false
        });

    } catch (error) {

        existingThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "already exists"
            )
        ) {

            throw new Error(
                `Unexpected existing-package error: ${message}`
            );

        }

    }

    if (!existingThrown) {

        throw new Error(
            "An existing package was overwritten without permission."
        );

    }

    /*
     * Overwrite creates an updated package.
     */
    await fs.writeFile(
        path.join(
            templatePath,
            "files",
            "README.md"
        ),
        "# Updated Package Builder Test",
        "utf-8"
    );

    const overwritten =
        await builder.build({
            templatePath,

            packagePath,

            overwrite:
                true
        });

    const overwrittenArchive =
        await unzipper.Open.file(
            overwritten.packagePath
        );

    const readmeEntry =
        overwrittenArchive.files.find(
            (entry) =>
                entry.path.replace(
                    /\\/g,
                    "/"
                ) ===
                "files/README.md"
        );

    if (!readmeEntry) {

        throw new Error(
            "The overwritten package did not contain README.md."
        );

    }

    const readme =
        (
            await readmeEntry.buffer()
        ).toString(
            "utf-8"
        );

    if (
        readme !==
        "# Updated Package Builder Test"
    ) {

        throw new Error(
            "The package overwrite did not include the updated contents."
        );

    }

    /*
     * Non-ZIP destination is rejected.
     */
    let extensionThrown =
        false;

    try {

        await builder.build({
            templatePath,

            packagePath:
                path.join(
                    root,
                    "packages",
                    "invalid-package.tar"
                ),

            overwrite:
                true
        });

    } catch (error) {

        extensionThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                ".zip extension"
            )
        ) {

            throw new Error(
                `Unexpected extension error: ${message}`
            );

        }

    }

    if (!extensionThrown) {

        throw new Error(
            "A non-ZIP package destination was accepted."
        );

    }

    console.log(
        "Template package builder test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package builder test failed.",
            error
        );

        process.exitCode = 1;

    }
);