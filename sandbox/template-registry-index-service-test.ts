import {
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryIndexService
} from "../lib/services";

function main(): void {

    const service =
        new TemplateRegistryIndexService();

    const manifests:
        TemplateRegistryManifest[] = [

        {
            registry: {
                id:
                    "official",

                name:
                    "Official Registry",

                type:
                    "remote",

                location:
                    "https://official.example.com"
            },

            templates: [

                {
                    templateId:
                        "nextjs",

                    version:
                        "4.0.0",

                    name:
                        "Next.js",

                    description:
                        "Next.js template",

                    downloadUrl:
                        "https://official.example.com/nextjs-4.0.0.zip",

                    archiveFormat:
                        "zip"
                },

                {
                    templateId:
                        "nextjs",

                    version:
                        "3.5.0",

                    name:
                        "Next.js",

                    description:
                        "Next.js template",

                    downloadUrl:
                        "https://official.example.com/nextjs-3.5.0.zip",

                    archiveFormat:
                        "zip"
                },

                /*
                 * Duplicate versions should not be indexed twice.
                 */
                {
                    templateId:
                        "nextjs",

                    version:
                        "4.0.0",

                    name:
                        "Next.js",

                    description:
                        "Duplicate Next.js entry",

                    downloadUrl:
                        "https://official.example.com/nextjs-4.0.0.zip",

                    archiveFormat:
                        "zip"
                }

            ]
        },

        {
            registry: {
                id:
                    "internal",

                name:
                    "Internal Registry",

                type:
                    "remote",

                location:
                    "https://internal.example.com"
            },

            templates: [

                {
                    templateId:
                        "nextjs",

                    version:
                        "4.1.0",

                    name:
                        "Next.js",

                    description:
                        "Internal template",

                    downloadUrl:
                        "https://internal.example.com/nextjs-4.1.0.zip",

                    archiveFormat:
                        "zip"
                },

                {
                    templateId:
                        "react",

                    version:
                        "2.0.0",

                    name:
                        "React",

                    description:
                        "React template",

                    downloadUrl:
                        "https://internal.example.com/react-2.0.0.zip",

                    archiveFormat:
                        "zip"
                }

            ]
        },

        /*
         * Local entries without package download metadata
         * should not be added to the installable index.
         */
        {
            registry: {
                id:
                    "local",

                name:
                    "Local Registry",

                type:
                    "local",

                location:
                    "templates"
            },

            templates: [
                {
                    templateId:
                        "local-only",

                    version:
                        "1.0.0",

                    name:
                        "Local Only"
                }
            ]
        }

    ];

    const index =
        service.build(
            manifests
        );

    if (
        !(index.generatedAt instanceof Date)
    ) {

        throw new Error(
            "The registry index timestamp was not a Date."
        );

    }

    if (
        index.templates.length !==
        3
    ) {

        throw new Error(
            [
                "Registry templates were not grouped correctly.",
                "Expected: 3",
                `Actual: ${index.templates.length}`
            ].join(" ")
        );

    }

    const official =
        index.templates.find(
            (entry) =>
                entry.registryId ===
                    "official" &&
                entry.templateId ===
                    "nextjs"
        );

    if (!official) {

        throw new Error(
            "The official Next.js registry entry was missing."
        );

    }

    if (
        official.source !==
        "https://official.example.com"
    ) {

        throw new Error(
            "The official registry source was incorrect."
        );

    }

    if (
        official.versions.length !==
        2
    ) {

        throw new Error(
            [
                "Official template versions were not grouped correctly.",
                "Expected: 2",
                `Actual: ${official.versions.length}`
            ].join(" ")
        );

    }

    if (
        official.latestVersion !==
        "4.0.0"
    ) {

        throw new Error(
            "The official latest version was incorrect."
        );

    }

    if (
        official.versions[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The official versions were not sorted newest first."
        );

    }

    if (
        official.versions[1]
            ?.version !==
        "3.5.0"
    ) {

        throw new Error(
            "The older official version was sorted incorrectly."
        );

    }

    const internal =
        index.templates.find(
            (entry) =>
                entry.registryId ===
                    "internal" &&
                entry.templateId ===
                    "nextjs"
        );

    if (!internal) {

        throw new Error(
            "The internal Next.js registry entry was missing."
        );

    }

    if (
        internal.latestVersion !==
        "4.1.0"
    ) {

        throw new Error(
            "The internal latest version was incorrect."
        );

    }

    const react =
        index.templates.find(
            (entry) =>
                entry.registryId ===
                    "internal" &&
                entry.templateId ===
                    "react"
        );

    if (!react) {

        throw new Error(
            "The internal React registry entry was missing."
        );

    }

    if (
        react.versions[0]
            ?.downloadUrl !==
        "https://internal.example.com/react-2.0.0.zip"
    ) {

        throw new Error(
            "The indexed React download URL was incorrect."
        );

    }

    const localOnly =
        index.templates.find(
            (entry) =>
                entry.templateId ===
                "local-only"
        );

    if (localOnly) {

        throw new Error(
            "A local template without download metadata was indexed unexpectedly."
        );

    }

    console.log(
        "Template registry index service test completed successfully."
    );

}

main();