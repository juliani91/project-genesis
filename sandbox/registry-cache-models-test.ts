import {
    RegistryCacheEntry,
    RegistryCacheResult,
    RegistryCacheStatus,
    SerializedRegistryCacheEntry,
    TemplateRegistryManifest
} from "../lib/models";

function createManifest():
    TemplateRegistryManifest {

    return {
        registry: {
            id:
                "official",

            name:
                "Official Registry",

            type:
                "remote",

            location:
                "https://registry.example.com/registry.json"
        },

        templates: [
            {
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                name:
                    "Next.js"
            }
        ]
    };

}

function main(): void {

    const manifest =
        createManifest();

    const cachedAt =
        new Date(
            "2026-07-13T12:00:00.000Z"
        );

    const entry:
        RegistryCacheEntry = {

        registryId:
            "official",

        sourceUrl:
            "https://registry.example.com/registry.json",

        cachePath:
            "C:/ProjectGenesis/.cache/registries/official.json",

        cachedAt,

        manifest
    };

    if (
        !(entry.cachedAt instanceof Date)
    ) {

        throw new Error(
            "The in-memory cache timestamp was not a Date."
        );

    }

    if (
        entry.manifest.templates.length !==
        1
    ) {

        throw new Error(
            "The cached registry manifest was not preserved."
        );

    }

    const serialized:
        SerializedRegistryCacheEntry = {

        registryId:
            entry.registryId,

        sourceUrl:
            entry.sourceUrl,

        cachePath:
            entry.cachePath,

        cachedAt:
            entry.cachedAt.toISOString(),

        manifest:
            entry.manifest
    };

    if (
        serialized.cachedAt !==
        "2026-07-13T12:00:00.000Z"
    ) {

        throw new Error(
            "The serialized cache timestamp was incorrect."
        );

    }

    const freshStatus:
        RegistryCacheStatus =
            "fresh";

    const cachedResult:
        RegistryCacheResult = {

        status:
            freshStatus,

        entry
    };

    if (
        cachedResult.status !==
        "fresh"
    ) {

        throw new Error(
            "The cache result status was incorrect."
        );

    }

    if (
        cachedResult.entry?.registryId !==
        "official"
    ) {

        throw new Error(
            "The cache result entry was incorrect."
        );

    }

    const missingResult:
        RegistryCacheResult = {

        status:
            "missing"
    };

    if (
        missingResult.entry !==
        undefined
    ) {

        throw new Error(
            "A missing cache result unexpectedly contained an entry."
        );

    }

    console.log(
        "Registry cache models test completed successfully."
    );

}

main();