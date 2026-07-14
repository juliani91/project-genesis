import {
    TemplateRegistryIndex
} from "../lib/models";

import {
    PackageSearchCommand
} from "../lib/commands";

import {
    PackageCommandFormatter,
    TemplatePackageSearchService,
    TemplateRegistryIndexService,
    TemplateRegistryManager
} from "../lib/services";

function createIndex():
    TemplateRegistryIndex {

    return {
        generatedAt:
            new Date(
                "2026-07-15T19:00:00.000Z"
            ),

        templates: [
            {
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
                            "https://official.example.com/packages/nextjs-4.0.0.zip",

                        archiveFormat:
                            "zip",

                        sha256:
                            "a".repeat(
                                64
                            )
                    }
                ]
            },

            {
                templateId:
                    "nextjs-enterprise",

                name:
                    "Enterprise Next.js",

                description:
                    "Internal enterprise application template.",

                registryId:
                    "internal",

                source:
                    "https://internal.example.com",

                latestVersion:
                    "2.0.0",

                versions: [
                    {
                        version:
                            "2.0.0",

                        downloadUrl:
                            "https://internal.example.com/packages/nextjs-enterprise-2.0.0.zip",

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
                    "react",

                name:
                    "React",

                description:
                    "Frontend React application template.",

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
                            "https://official.example.com/packages/react-3.0.0.zip",

                        archiveFormat:
                            "zip",

                        sha256:
                            "c".repeat(
                                64
                            )
                    }
                ]
            }
        ]
    };

}

function main(): void {

    const manager =
        new TemplateRegistryManager(
            new TemplateRegistryIndexService(),
            new TemplatePackageSearchService()
        );

    const command =
        new PackageSearchCommand(
            manager
        );

    const formatter =
        new PackageCommandFormatter();

    const index =
        createIndex();

    /*
     * Search with multiple matches.
     */
    const nextResults =
        command.execute(
            index,
            " next "
        );

    if (
        !nextResults.success
    ) {

        throw new Error(
            "The package search command reported failure."
        );

    }

    if (
        nextResults.results.length !==
        2
    ) {

        throw new Error(
            [
                "The package search command returned the wrong number of matches.",
                "Expected: 2",
                `Actual: ${nextResults.results.length}`
            ].join(" ")
        );

    }

    if (
        nextResults.results[0]
            ?.template
            .templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The strongest package search command result was incorrect."
        );

    }

    if (
        nextResults.message !==
        'Found 2 packages matching "next".'
    ) {

        throw new Error(
            [
                "The package search command message was incorrect.",
                `Actual: ${nextResults.message}`
            ].join(" ")
        );

    }

    const formattedNextResults =
        formatter.formatSearch(
            nextResults
        );

    if (
        !formattedNextResults.includes(
            "nextjs v4.0.0 (official)"
        )
    ) {

        throw new Error(
            "The formatted search command output was missing Next.js."
        );

    }

    if (
        !formattedNextResults.includes(
            "nextjs-enterprise v2.0.0 (internal)"
        )
    ) {

        throw new Error(
            "The formatted search command output was missing Enterprise Next.js."
        );

    }

    /*
     * Search with one exact match.
     */
    const reactResults =
        command.execute(
            index,
            "react"
        );

    if (
        reactResults.results.length !==
        1
    ) {

        throw new Error(
            "The exact package search returned the wrong number of results."
        );

    }

    if (
        reactResults.message !==
        'Found 1 package matching "react".'
    ) {

        throw new Error(
            "The singular package search message was incorrect."
        );

    }

    if (
        reactResults.results[0]
            ?.rank !==
        0
    ) {

        throw new Error(
            "The exact package search result had the wrong rank."
        );

    }

    /*
     * No matches.
     */
    const missingResults =
        command.execute(
            index,
            "missing-package"
        );

    if (
        !missingResults.success
    ) {

        throw new Error(
            "A no-match search should still complete successfully."
        );

    }

    if (
        missingResults.results.length !==
        0
    ) {

        throw new Error(
            "The missing package search unexpectedly returned results."
        );

    }

    if (
        missingResults.message !==
        'No packages matched "missing-package".'
    ) {

        throw new Error(
            "The no-match package search message was incorrect."
        );

    }

    const formattedMissingResults =
        formatter.formatSearch(
            missingResults
        );

    if (
        formattedMissingResults !==
        'No packages matched "missing-package".'
    ) {

        throw new Error(
            "The no-match search output was formatted incorrectly."
        );

    }

    /*
     * Empty search query.
     */
    let emptyQueryThrown =
        false;

    try {

        command.execute(
            index,
            "   "
        );

    } catch (error) {

        emptyQueryThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Package search query is required"
            )
        ) {

            throw new Error(
                `Unexpected empty-query error: ${message}`
            );

        }

    }

    if (!emptyQueryThrown) {

        throw new Error(
            "An empty package search query was accepted."
        );

    }

    console.log(
        "Package search command result verified."
    );

    console.log(
        "Package search command formatting verified."
    );

    console.log(
        "Package search command validation verified."
    );

    console.log(
        "Package search command test completed successfully."
    );

}

main();