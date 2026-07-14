import {
    RegistryIndexTemplate,
    RegistryIndexTemplateVersion,
    RegistrySearchResult,
    SerializedTemplateRegistryIndex,
    TemplateRegistryIndex
} from "../lib/models";

function main(): void {

    const version:
        RegistryIndexTemplateVersion = {

        version:
            "4.0.0",

        downloadUrl:
            "https://registry.example.com/packages/nextjs-4.0.0.zip",

        archiveFormat:
            "zip",

        sha256:
            "a".repeat(
                64
            )
    };

    if (
        version.archiveFormat !==
        "zip"
    ) {

        throw new Error(
            "The indexed archive format was incorrect."
        );

    }

    const template:
        RegistryIndexTemplate = {

        templateId:
            "nextjs",

        name:
            "Next.js",

        description:
            "Next.js application template.",

        registryId:
            "official",

        source:
            "https://registry.example.com",

        latestVersion:
            "4.0.0",

        versions: [
            {
                version:
                    "3.2.0",

                downloadUrl:
                    "https://registry.example.com/packages/nextjs-3.2.0.zip",

                archiveFormat:
                    "zip"
            },
            version
        ]
    };

    if (
        template.versions.length !==
        2
    ) {

        throw new Error(
            "The indexed template version count was incorrect."
        );

    }

    if (
        template.latestVersion !==
        "4.0.0"
    ) {

        throw new Error(
            "The indexed latest version was incorrect."
        );

    }

    const generatedAt =
        new Date(
            "2026-07-15T10:00:00.000Z"
        );

    const index:
        TemplateRegistryIndex = {

        generatedAt,

        templates: [
            template
        ]
    };

    if (
        !(index.generatedAt instanceof Date)
    ) {

        throw new Error(
            "The registry index timestamp was not a Date."
        );

    }

    const serialized:
        SerializedTemplateRegistryIndex = {

        generatedAt:
            generatedAt.toISOString(),

        templates:
            index.templates
    };

    if (
        serialized.generatedAt !==
        "2026-07-15T10:00:00.000Z"
    ) {

        throw new Error(
            "The serialized registry index timestamp was incorrect."
        );

    }

    const searchResult:
        RegistrySearchResult = {

        template,

        rank:
            0,

        matchedBy: [
            "id",
            "name"
        ]
    };

    if (
        searchResult.rank !==
        0
    ) {

        throw new Error(
            "The search-result rank was incorrect."
        );

    }

    if (
        !searchResult.matchedBy.includes(
            "id"
        )
    ) {

        throw new Error(
            "The search-result match fields were incorrect."
        );

    }

    console.log(
        "Template registry index models test completed successfully."
    );

}

main();