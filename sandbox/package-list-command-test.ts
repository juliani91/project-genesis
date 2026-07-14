import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage
} from "../lib/models";

import {
    PackageListCommand
} from "../lib/commands";

import {
    InstalledTemplatePackageStore,
    PackageCommandFormatter,
    TemplatePackageSearchService,
    TemplateRegistryIndexService,
    TemplateRegistryManager
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-list-command-test"
        );

    await fs.rm(
        root,
        {
            recursive:
                true,

            force:
                true
        }
    );

    const store =
        new InstalledTemplatePackageStore(
            path.join(
                root,
                "installed",
                "packages.json"
            )
        );

    const manager =
        new TemplateRegistryManager(
            new TemplateRegistryIndexService(),
            new TemplatePackageSearchService(),
            store
        );

    const command =
        new PackageListCommand(
            manager
        );

    const formatter =
        new PackageCommandFormatter();

    /*
     * Empty installed-package list.
     */
    const empty =
        await command.execute();

    if (
        !empty.success
    ) {

        throw new Error(
            "The empty package list command reported failure."
        );

    }

    if (
        empty.packages.length !==
        0
    ) {

        throw new Error(
            "The empty package list command returned packages."
        );

    }

    if (
        empty.message !==
        "No packages are installed."
    ) {

        throw new Error(
            [
                "The empty package list message was incorrect.",
                `Actual: ${empty.message}`
            ].join(" ")
        );

    }

    const emptyOutput =
        formatter.formatInstalled(
            empty
        );

    if (
        emptyOutput !==
        "No packages are installed."
    ) {

        throw new Error(
            "The empty package list output was formatted incorrectly."
        );

    }

    const installedPackages:
        InstalledTemplatePackage[] = [
        {
            templateId:
                "react",

            version:
                "3.0.0",

            installPath:
                path.join(
                    root,
                    "templates",
                    "react",
                    "3.0.0"
                ),

            sha256:
                "c".repeat(
                    64
                ),

            source:
                "https://official.example.com",

            installedAt:
                new Date(
                    "2026-07-15T21:00:00.000Z"
                )
        },

        {
            templateId:
                "nextjs",

            version:
                "3.5.0",

            installPath:
                path.join(
                    root,
                    "templates",
                    "nextjs",
                    "3.5.0"
                ),

            sha256:
                "a".repeat(
                    64
                ),

            source:
                "https://official.example.com",

            installedAt:
                new Date(
                    "2026-07-15T19:00:00.000Z"
                )
        },

        {
            templateId:
                "nextjs",

            version:
                "4.0.0",

            installPath:
                path.join(
                    root,
                    "templates",
                    "nextjs",
                    "4.0.0"
                ),

            sha256:
                "b".repeat(
                    64
                ),

            source:
                "https://official.example.com",

            installedAt:
                new Date(
                    "2026-07-15T20:00:00.000Z"
                )
        }
    ];

    for (
        const installedPackage
        of installedPackages
    ) {

        await store.install(
            installedPackage
        );

    }

    /*
     * List every installed package.
     */
    const all =
        await command.execute();

    if (
        !all.success
    ) {

        throw new Error(
            "The package list command reported failure."
        );

    }

    if (
        all.packages.length !==
        3
    ) {

        throw new Error(
            [
                "The package list command returned the wrong number of packages.",
                "Expected: 3",
                `Actual: ${all.packages.length}`
            ].join(" ")
        );

    }

    if (
        all.message !==
        "Found 3 installed packages."
    ) {

        throw new Error(
            [
                "The package list command message was incorrect.",
                `Actual: ${all.message}`
            ].join(" ")
        );

    }

    if (
        all.packages[0]
            ?.templateId !==
            "nextjs" ||
        all.packages[0]
            ?.version !==
            "3.5.0"
    ) {

        throw new Error(
            "The first listed installed package was incorrect."
        );

    }

    if (
        all.packages[1]
            ?.templateId !==
            "nextjs" ||
        all.packages[1]
            ?.version !==
            "4.0.0"
    ) {

        throw new Error(
            "The second listed installed package was incorrect."
        );

    }

    if (
        all.packages[2]
            ?.templateId !==
        "react"
    ) {

        throw new Error(
            "The installed React package was sorted incorrectly."
        );

    }

    const allOutput =
        formatter.formatInstalled(
            all
        );

    if (
        !allOutput.includes(
            "nextjs v3.5.0"
        ) ||
        !allOutput.includes(
            "nextjs v4.0.0"
        ) ||
        !allOutput.includes(
            "react v3.0.0"
        )
    ) {

        throw new Error(
            "The formatted package list was missing installed packages."
        );

    }

    /*
     * Filter by one template ID.
     */
    const nextjs =
        await command.execute(
            " NEXTJS "
        );

    if (
        nextjs.packages.length !==
        2
    ) {

        throw new Error(
            [
                "The filtered package list returned the wrong number of versions.",
                "Expected: 2",
                `Actual: ${nextjs.packages.length}`
            ].join(" ")
        );

    }

    if (
        nextjs.message !==
        'Found 2 installed versions of "NEXTJS".'
    ) {

        throw new Error(
            [
                "The filtered package list message was incorrect.",
                `Actual: ${nextjs.message}`
            ].join(" ")
        );

    }

    if (
        nextjs.packages[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The newest filtered package version was not listed first."
        );

    }

    if (
        nextjs.packages[1]
            ?.version !==
        "3.5.0"
    ) {

        throw new Error(
            "The older filtered package version was listed incorrectly."
        );

    }

    /*
     * Filter with one result.
     */
    const react =
        await command.execute(
            "react"
        );

    if (
        react.packages.length !==
        1
    ) {

        throw new Error(
            "The React package filter returned the wrong number of versions."
        );

    }

    if (
        react.message !==
        'Found 1 installed version of "react".'
    ) {

        throw new Error(
            "The singular filtered-package message was incorrect."
        );

    }

    /*
     * Filter with no results.
     */
    const missing =
        await command.execute(
            "missing-package"
        );

    if (
        !missing.success
    ) {

        throw new Error(
            "A missing installed-package filter should still complete successfully."
        );

    }

    if (
        missing.packages.length !==
        0
    ) {

        throw new Error(
            "The missing installed-package filter returned results."
        );

    }

    if (
        missing.message !==
        'No installed versions of "missing-package" were found.'
    ) {

        throw new Error(
            "The missing installed-package message was incorrect."
        );

    }

    console.log(
        "Package list command result verified."
    );

    console.log(
        "Package list filtering verified."
    );

    console.log(
        "Package list command formatting verified."
    );

    console.log(
        "Package list command test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Package list command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);