import {
    InstalledPackageCommandResult,
    PackageInstallationCommandResult,
    PackageRemovalCommandResult,
    PackageSearchCommandResult
} from "../lib/models";

import {
    PackageCommandFormatter
} from "../lib/services";

function main(): void {

    const formatter =
        new PackageCommandFormatter();

    const installedPackage = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        installPath:
            "C:/Genesis/Templates/nextjs/4.0.0",

        sha256:
            "a".repeat(
                64
            ),

        source:
            "https://official.example.com",

        installedAt:
            new Date(
                "2026-07-15T18:00:00.000Z"
            )

    };

    /*
     * Search result formatting.
     */
    const searchResult:
        PackageSearchCommandResult = {

        success:
            true,

        message:
            "Found 1 package.",

        results: [
            {
                template: {
                    templateId:
                        "nextjs",

                    name:
                        "Next.js",

                    description:
                        "Next.js application template.",

                    registryId:
                        "official",

                    source:
                        "https://official.example.com",

                    latestVersion:
                        "4.0.0",

                    versions: [
                        {
                            version:
                                "4.0.0",

                            downloadUrl:
                                "https://official.example.com/nextjs-4.0.0.zip",

                            archiveFormat:
                                "zip",

                            sha256:
                                "a".repeat(
                                    64
                                )
                        }
                    ]
                },

                rank:
                    0,

                matchedBy: [
                    "id",
                    "name"
                ]
            }
        ]
    };

    const searchOutput =
        formatter.formatSearch(
            searchResult
        );

    const expectedSearchValues = [
        "Found 1 package.",
        "Available Packages",
        "nextjs v4.0.0 (official)",
        "Name        : Next.js",
        "Description : Next.js application template.",
        "Source      : https://official.example.com",
        "Matched By  : id, name"
    ];

    for (
        const expected
        of expectedSearchValues
    ) {

        if (
            !searchOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Search output was missing: ${expected}`
            );

        }

    }

    /*
     * Empty search formatting.
     */
    const emptySearchOutput =
        formatter.formatSearch({
            success:
                true,

            message:
                "No packages matched.",

            results: []
        });

    if (
        emptySearchOutput !==
        "No packages matched."
    ) {

        throw new Error(
            "Empty search output was formatted incorrectly."
        );

    }

    /*
     * Installed-package formatting.
     */
    const installedResult:
        InstalledPackageCommandResult = {

        success:
            true,

        message:
            "Found 1 installed package.",

        packages: [
            installedPackage
        ]
    };

    const installedOutput =
        formatter.formatInstalled(
            installedResult
        );

    const expectedInstalledValues = [
        "Found 1 installed package.",
        "Installed Packages",
        "nextjs v4.0.0",
        "Path      : C:/Genesis/Templates/nextjs/4.0.0",
        "Source    : https://official.example.com",
        "Installed : 2026-07-15T18:00:00.000Z"
    ];

    for (
        const expected
        of expectedInstalledValues
    ) {

        if (
            !installedOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Installed output was missing: ${expected}`
            );

        }

    }

    /*
     * Empty installed-package formatting.
     */
    const emptyInstalledOutput =
        formatter.formatInstalled({
            success:
                true,

            message:
                "No packages are installed.",

            packages: []
        });

    if (
        emptyInstalledOutput !==
        "No packages are installed."
    ) {

        throw new Error(
            "Empty installed-package output was formatted incorrectly."
        );

    }

    /*
     * Installation formatting.
     */
    const installationResult:
        PackageInstallationCommandResult = {

        success:
            true,

        message:
            "Package installed successfully.",

        package:
            installedPackage
    };

    const installationOutput =
        formatter.formatInstallation(
            installationResult
        );

    const expectedInstallationValues = [
        "Package installed successfully.",
        "Installed Package",
        "Template : nextjs",
        "Version  : 4.0.0",
        "Path     : C:/Genesis/Templates/nextjs/4.0.0",
        "Source   : https://official.example.com",
        `SHA-256  : ${"a".repeat(64)}`
    ];

    for (
        const expected
        of expectedInstallationValues
    ) {

        if (
            !installationOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Installation output was missing: ${expected}`
            );

        }

    }

    /*
     * Successful removal formatting.
     */
    const removalResult:
        PackageRemovalCommandResult = {

        success:
            true,

        message:
            "Package removed successfully.",

        removed:
            installedPackage
    };

    const removalOutput =
        formatter.formatRemoval(
            removalResult
        );

    const expectedRemovalValues = [
        "Package removed successfully.",
        "Removed Package",
        "Template : nextjs",
        "Version  : 4.0.0",
        "Path     : C:/Genesis/Templates/nextjs/4.0.0"
    ];

    for (
        const expected
        of expectedRemovalValues
    ) {

        if (
            !removalOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Removal output was missing: ${expected}`
            );

        }

    }

    /*
     * Missing removal formatting.
     */
    const missingRemovalOutput =
        formatter.formatRemoval({
            success:
                false,

            message:
                "The requested package is not installed."
        });

    if (
        missingRemovalOutput !==
        "The requested package is not installed."
    ) {

        throw new Error(
            "Missing-package removal output was formatted incorrectly."
        );

    }

    console.log(
        "Package command formatter test completed successfully."
    );

}

main();