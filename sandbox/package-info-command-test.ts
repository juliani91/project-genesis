import {
    promises as fs
} from "fs";

import path from "path";

import {
    TemplateRegistryIndex
} from "../lib/models";

import {
    PackageInfoCommand
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
            "package-info-command-test"
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
        new PackageInfoCommand(
            manager
        );

    const formatter =
        new PackageCommandFormatter();

    const index:
        TemplateRegistryIndex = {

        generatedAt:
            new Date(
                "2026-07-15T22:00:00.000Z"
            ),

        templates: [
            {
                templateId:
                    "nextjs",

                name:
                    "Next.js",

                description:
                    "Official Next.js application template.",

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
                    },
                    {
                        version:
                            "3.5.0",

                        downloadUrl:
                            "https://official.example.com/nextjs-3.5.0.zip",

                        archiveFormat:
                            "zip",

                        sha256:
                            "b".repeat(
                                64
                            )
                    }
                ]
            },

            {
                templateId:
                    "nextjs",

                name:
                    "Internal Next.js",

                description:
                    "Internal Next.js template.",

                registryId:
                    "internal",

                source:
                    "https://internal.example.com",

                latestVersion:
                    "5.0.0",

                versions: [
                    {
                        version:
                            "5.0.0",

                        downloadUrl:
                            "https://internal.example.com/nextjs-5.0.0.zip",

                        archiveFormat:
                            "zip",

                        sha256:
                            "c".repeat(
                                64
                            )
                    }
                ]
            },

            {
                templateId:
                    "react",

                name:
                    "React",

                description:
                    "React application template.",

                registryId:
                    "official",

                source:
                    "https://official.example.com",

                latestVersion:
                    "3.0.0",

                versions: [
                    {
                        version:
                            "3.0.0",

                        downloadUrl:
                            "https://official.example.com/react-3.0.0.zip",

                        archiveFormat:
                            "zip",

                        sha256:
                            "d".repeat(
                                64
                            )
                    }
                ]
            }
        ]
    };

    await store.install({
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
            "a".repeat(
                64
            ),

        source:
            "https://official.example.com",

        installedAt:
            new Date(
                "2026-07-15T21:00:00.000Z"
            )
    });

    await store.install({
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
            "b".repeat(
                64
            ),

        source:
            "https://official.example.com",

        installedAt:
            new Date(
                "2026-07-15T20:00:00.000Z"
            )
    });

    /*
     * Ambiguous package without registry selection.
     */
    const ambiguous =
        await command.execute(
            index,
            "nextjs"
        );

    if (
        ambiguous.success
    ) {

        throw new Error(
            "An ambiguous package lookup reported success."
        );

    }

    if (
        !ambiguous.message.includes(
            "exists in multiple registries"
        ) ||
        !ambiguous.message.includes(
            "internal"
        ) ||
        !ambiguous.message.includes(
            "official"
        )
    ) {

        throw new Error(
            "The ambiguous package information message was incorrect."
        );

    }

    if (
        formatter.formatInfo(
            ambiguous
        ) !==
        ambiguous.message
    ) {

        throw new Error(
            "The ambiguous package output was formatted incorrectly."
        );

    }

    /*
     * Exact package and registry lookup.
     */
    const official =
        await command.execute(
            index,
            " NEXTJS ",
            " OFFICIAL "
        );

    if (
        !official.success
    ) {

        throw new Error(
            "The official package information command reported failure."
        );

    }

    if (
        official.template
            ?.registryId !==
        "official"
    ) {

        throw new Error(
            "The package information command selected the wrong registry."
        );

    }

    if (
        official.template
            ?.latestVersion !==
        "4.0.0"
    ) {

        throw new Error(
            "The package information latest version was incorrect."
        );

    }

    if (
        official.template
            ?.versions.length !==
        2
    ) {

        throw new Error(
            "The package information available-version count was incorrect."
        );

    }

    if (
        official.installedVersions.length !==
        2
    ) {

        throw new Error(
            "The package information installed-version count was incorrect."
        );

    }

    if (
        official.installedVersions[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The newest installed package version was not returned first."
        );

    }

    const officialOutput =
        formatter.formatInfo(
            official
        );

    const expectedOfficialValues = [
        'Package information for "nextjs".',
        "Package Information",
        "Template    : nextjs",
        "Name        : Next.js",
        "Registry    : official",
        "Source      : https://official.example.com",
        "Latest      : 4.0.0",
        "Available Versions",
        "- 4.0.0",
        "- 3.5.0",
        "Installed Versions"
    ];

    for (
        const expected
        of expectedOfficialValues
    ) {

        if (
            !officialOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Package information output was missing: ${expected}`
            );

        }

    }

    /*
     * Package with no installed versions.
     */
    const react =
        await command.execute(
            index,
            "react"
        );

    if (
        !react.success
    ) {

        throw new Error(
            "The React package information command reported failure."
        );

    }

    if (
        react.installedVersions.length !==
        0
    ) {

        throw new Error(
            "React unexpectedly had installed versions."
        );

    }

    const reactOutput =
        formatter.formatInfo(
            react
        );

    if (
        !reactOutput.includes(
            "Installed Versions"
        ) ||
        !reactOutput.includes(
            "None"
        )
    ) {

        throw new Error(
            "The package information output did not show an empty installed list."
        );

    }

    /*
     * Missing package.
     */
    const missing =
        await command.execute(
            index,
            "missing-package"
        );

    if (
        missing.success
    ) {

        throw new Error(
            "A missing package information lookup reported success."
        );

    }

    if (
        missing.message !==
        'Package "missing-package" was not found.'
    ) {

        throw new Error(
            "The missing package information message was incorrect."
        );

    }

    /*
     * Missing package in a specified registry.
     */
    const missingRegistry =
        await command.execute(
            index,
            "react",
            "internal"
        );

    if (
        missingRegistry.success
    ) {

        throw new Error(
            "A package missing from the requested registry reported success."
        );

    }

    if (
        missingRegistry.message !==
        'Package "react" was not found in registry "internal".'
    ) {

        throw new Error(
            "The missing-registry package information message was incorrect."
        );

    }

    /*
     * Empty package ID.
     */
    let emptyIdThrown =
        false;

    try {

        await command.execute(
            index,
            "   "
        );

    } catch (error) {

        emptyIdThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Package template ID is required"
            )
        ) {

            throw new Error(
                `Unexpected empty package-ID error: ${message}`
            );

        }

    }

    if (!emptyIdThrown) {

        throw new Error(
            "An empty package information ID was accepted."
        );

    }

    console.log(
        "Package information lookup verified."
    );

    console.log(
        "Package information ambiguity handling verified."
    );

    console.log(
        "Package information formatting verified."
    );

    console.log(
        "Package information validation verified."
    );

    console.log(
        "Package information command test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Package information command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);