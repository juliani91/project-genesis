import {
    TemplateRegistryIndex
} from "../lib/models";

import {
    TemplatePackageSearchService
} from "../lib/services";

function main(): void {

    const index:
        TemplateRegistryIndex = {

        generatedAt:
            new Date(
                "2026-07-15T12:00:00.000Z"
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
                            "https://official.example.com/nextjs-4.0.0.zip",

                        archiveFormat:
                            "zip"
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
                            "https://internal.example.com/nextjs-enterprise-2.0.0.zip",

                        archiveFormat:
                            "zip"
                    }
                ]
            },

            {
                templateId:
                    "react",

                name:
                    "React",

                description:
                    "Frontend application template using React.",

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
                            "zip"
                    }
                ]
            },

            {
                templateId:
                    "api-service",

                name:
                    "API Service",

                description:
                    "Backend service template for enterprise systems.",

                registryId:
                    "internal",

                source:
                    "https://internal.example.com",

                latestVersion:
                    "1.0.0",

                versions: [
                    {
                        version:
                            "1.0.0",

                        downloadUrl:
                            "https://internal.example.com/api-service-1.0.0.zip",

                        archiveFormat:
                            "zip"
                    }
                ]
            }

        ]

    };

    const service =
        new TemplatePackageSearchService();

    /*
     * Exact template ID.
     */
    const exact =
        service.search(
            index,
            "nextjs"
        );

    if (
        exact.length !==
        2
    ) {

        throw new Error(
            [
                "The exact-ID search returned the wrong number of results.",
                "Expected: 2",
                `Actual: ${exact.length}`
            ].join(" ")
        );

    }

    if (
        exact[0]
            ?.template
            .templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The exact template-ID result was not ranked first."
        );

    }

    if (
        exact[0]
            ?.rank !==
        0
    ) {

        throw new Error(
            "The exact template-ID match had the wrong rank."
        );

    }

    if (
        !exact[0]
            ?.matchedBy
            .includes(
                "id"
            )
    ) {

        throw new Error(
            "The exact search result did not report an ID match."
        );

    }

    if (
        exact[1]
            ?.template
            .templateId !==
        "nextjs-enterprise"
    ) {

        throw new Error(
            "The template-ID prefix result was not ranked second."
        );

    }

    if (
        exact[1]
            ?.rank !==
        1
    ) {

        throw new Error(
            "The template-ID prefix match had the wrong rank."
        );

    }

    /*
     * Case-insensitive search.
     */
    const caseInsensitive =
        service.search(
            index,
            " ReAcT "
        );

    if (
        caseInsensitive.length !==
            1 ||
        caseInsensitive[0]
            ?.template
            .templateId !==
            "react"
    ) {

        throw new Error(
            "Case-insensitive search did not return React."
        );

    }

    if (
        caseInsensitive[0]
            ?.rank !==
        0
    ) {

        throw new Error(
            "The case-insensitive exact ID match had the wrong rank."
        );

    }

    /*
     * Search matches both the ID and the name.
     *
     * "enterprise" appears inside:
     *   nextjs-enterprise
     *
     * and starts:
     *   Enterprise Next.js
     *
     * The ID-contains match has rank 2, which is stronger
     * than the name-starts match at rank 3.
     */
    const enterprise =
        service.search(
            index,
            "enterprise"
        );

    if (
        enterprise.length !==
        2
    ) {

        throw new Error(
            [
                "The enterprise search returned the wrong number of results.",
                "Expected: 2",
                `Actual: ${enterprise.length}`
            ].join(" ")
        );

    }

    if (
        enterprise[0]
            ?.template
            .templateId !==
        "nextjs-enterprise"
    ) {

        throw new Error(
            "The enterprise package match was not ranked first."
        );

    }

    if (
        enterprise[0]
            ?.rank !==
        2
    ) {

        throw new Error(
            [
                "The enterprise package match had the wrong rank.",
                "Expected: 2",
                `Actual: ${enterprise[0]?.rank}`
            ].join(" ")
        );

    }

    if (
        !enterprise[0]
            ?.matchedBy
            .includes(
                "id"
            )
    ) {

        throw new Error(
            "The enterprise package result did not report an ID match."
        );

    }

    if (
        !enterprise[0]
            ?.matchedBy
            .includes(
                "name"
            )
    ) {

        throw new Error(
            "The enterprise package result did not report a name match."
        );

    }

    if (
        !enterprise[0]
            ?.matchedBy
            .includes(
                "description"
            )
    ) {

        throw new Error(
            "The enterprise package result did not report a description match."
        );

    }

    if (
        enterprise[1]
            ?.template
            .templateId !==
        "api-service"
    ) {

        throw new Error(
            "The enterprise description match was not ranked second."
        );

    }

    if (
        enterprise[1]
            ?.rank !==
        5
    ) {

        throw new Error(
            "The enterprise description match had the wrong rank."
        );

    }

    if (
        enterprise[1]
            ?.matchedBy
            .length !==
        1 ||
        !enterprise[1]
            ?.matchedBy
            .includes(
                "description"
            )
    ) {

        throw new Error(
            "The API service result did not report only a description match."
        );

    }

    /*
     * Description-only match.
     */
    const frontend =
        service.search(
            index,
            "frontend"
        );

    if (
        frontend.length !==
            1 ||
        frontend[0]
            ?.template
            .templateId !==
            "react"
    ) {

        throw new Error(
            "The description search did not return React."
        );

    }

    if (
        frontend[0]
            ?.rank !==
        5
    ) {

        throw new Error(
            "The description-only search had the wrong rank."
        );

    }

    if (
        !frontend[0]
            ?.matchedBy
            .includes(
                "description"
            )
    ) {

        throw new Error(
            "The description search did not report its match reason."
        );

    }

    /*
     * Empty query returns no results.
     */
    const empty =
        service.search(
            index,
            "   "
        );

    if (
        empty.length !==
        0
    ) {

        throw new Error(
            "An empty package search returned results."
        );

    }

    /*
     * Unknown query returns no results.
     */
    const missing =
        service.search(
            index,
            "nonexistent-template"
        );

    if (
        missing.length !==
        0
    ) {

        throw new Error(
            "An unknown package search returned results."
        );

    }

    console.log(
        "Template package search service test completed successfully."
    );

}

main();