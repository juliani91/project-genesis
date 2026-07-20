import path from "path";

import {
    RegistryPublishEntry
} from "../lib/models";

import {
    RegistryPublishManifestBuilder
} from "../lib/services";

function main(): void {

    const builder =
        new RegistryPublishManifestBuilder();

    const empty =
        builder.create(
            " OFFICIAL "
        );

    if (
        empty.registryId !==
        "official"
    ) {

        throw new Error(
            "The publish manifest registry ID was not normalized."
        );

    }

    if (
        empty.packages.length !==
        0
    ) {

        throw new Error(
            "A new publish manifest was not empty."
        );

    }

    if (
        !(empty.generatedAt instanceof Date)
    ) {

        throw new Error(
            "The publish manifest timestamp was not a Date."
        );

    }

    const firstEntry:
        RegistryPublishEntry = {

        templateId:
            " NEXTJS ",

        version:
            "4.0.0",

        packagePath:
            path.join(
                process.cwd(),
                "sandbox-output",
                "registry-publish-manifest-builder-test",
                "nextjs-4.0.0.zip"
            ),

        sha256:
            "A".repeat(
                64
            ),

        publishedAt:
            new Date(
                "2026-07-16T12:00:00.000Z"
            )
    };

    const withFirst =
        builder.add(
            empty,
            firstEntry
        );

    if (
        withFirst.packages.length !==
        1
    ) {

        throw new Error(
            "The first publish manifest entry was not added."
        );

    }

    const storedFirst =
        withFirst.packages[0];

    if (!storedFirst) {

        throw new Error(
            "The stored publish manifest entry was missing."
        );

    }

    if (
        storedFirst.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The publish manifest template ID was not normalized."
        );

    }

    if (
        storedFirst.sha256 !==
        "a".repeat(
            64
        )
    ) {

        throw new Error(
            "The publish manifest SHA-256 was not normalized."
        );

    }

    if (
        !path.isAbsolute(
            storedFirst.packagePath
        )
    ) {

        throw new Error(
            "The publish manifest package path was not absolute."
        );

    }

    /*
     * Replacing the same template and version should not
     * create a duplicate.
     */
    const replacement =
        builder.add(
            withFirst,
            {
                ...firstEntry,

                packagePath:
                    path.join(
                        process.cwd(),
                        "sandbox-output",
                        "registry-publish-manifest-builder-test",
                        "replacement",
                        "nextjs-4.0.0.zip"
                    ),

                sha256:
                    "b".repeat(
                        64
                    ),

                publishedAt:
                    new Date(
                        "2026-07-16T13:00:00.000Z"
                    )
            }
        );

    if (
        replacement.packages.length !==
        1
    ) {

        throw new Error(
            "Replacing a publish entry created a duplicate."
        );

    }

    if (
        replacement.packages[0]
            ?.sha256 !==
        "b".repeat(
            64
        )
    ) {

        throw new Error(
            "The existing publish entry was not replaced."
        );

    }

    /*
     * Add multiple templates and versions.
     */
    const completed =
        builder.addMany(
            replacement,
            [
                {
                    templateId:
                        "nextjs",

                    version:
                        "3.5.0",

                    packagePath:
                        path.join(
                            process.cwd(),
                            "sandbox-output",
                            "registry-publish-manifest-builder-test",
                            "nextjs-3.5.0.zip"
                        ),

                    sha256:
                        "c".repeat(
                            64
                        ),

                    publishedAt:
                        new Date(
                            "2026-07-16T11:00:00.000Z"
                        )
                },
                {
                    templateId:
                        "react",

                    version:
                        "3.0.0",

                    packagePath:
                        path.join(
                            process.cwd(),
                            "sandbox-output",
                            "registry-publish-manifest-builder-test",
                            "react-3.0.0.zip"
                        ),

                    sha256:
                        "d".repeat(
                            64
                        ),

                    publishedAt:
                        new Date(
                            "2026-07-16T14:00:00.000Z"
                        )
                }
            ]
        );

    if (
        completed.packages.length !==
        3
    ) {

        throw new Error(
            [
                "The completed publish manifest contained the wrong number of packages.",
                "Expected: 3",
                `Actual: ${completed.packages.length}`
            ].join(" ")
        );

    }

    if (
        completed.packages[0]
            ?.templateId !==
            "nextjs" ||
        completed.packages[0]
            ?.version !==
            "4.0.0"
    ) {

        throw new Error(
            "The newest Next.js publish entry was sorted incorrectly."
        );

    }

    if (
        completed.packages[1]
            ?.templateId !==
            "nextjs" ||
        completed.packages[1]
            ?.version !==
            "3.5.0"
    ) {

        throw new Error(
            "The older Next.js publish entry was sorted incorrectly."
        );

    }

    if (
        completed.packages[2]
            ?.templateId !==
            "react"
    ) {

        throw new Error(
            "The React publish entry was sorted incorrectly."
        );

    }

    /*
     * Invalid SHA-256 is rejected.
     */
    let invalidShaThrown =
        false;

    try {

        builder.add(
            empty,
            {
                ...firstEntry,

                sha256:
                    "invalid"
            }
        );

    } catch (error) {

        invalidShaThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "invalid SHA-256"
            )
        ) {

            throw new Error(
                `Unexpected invalid-SHA error: ${message}`
            );

        }

    }

    if (!invalidShaThrown) {

        throw new Error(
            "A publish entry with an invalid SHA-256 was accepted."
        );

    }

    /*
     * Non-ZIP package paths are rejected.
     */
    let invalidExtensionThrown =
        false;

    try {

        builder.add(
            empty,
            {
                ...firstEntry,

                packagePath:
                    "package.tar"
            }
        );

    } catch (error) {

        invalidExtensionThrown =
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
                `Unexpected package-extension error: ${message}`
            );

        }

    }

    if (!invalidExtensionThrown) {

        throw new Error(
            "A non-ZIP publish entry was accepted."
        );

    }

    console.log(
        "Publish manifest creation verified."
    );

    console.log(
        "Publish manifest entry replacement verified."
    );

    console.log(
        "Publish manifest sorting verified."
    );

    console.log(
        "Publish manifest validation verified."
    );

    console.log(
        "Registry publish manifest builder test completed successfully."
    );

}

main();