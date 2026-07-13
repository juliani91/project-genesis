import {
    RegistryCacheEntry,
    RegistryTemplate,
    RemoteRegistryLoadResult,
    RemoteRegistryResponse,
    TemplateArchiveFormat,
    TemplateRegistryManifest
} from "../lib/models";

function createManifest():
    TemplateRegistryManifest {

    const archiveFormat:
        TemplateArchiveFormat =
        "zip";

    const template:
        RegistryTemplate = {

        templateId:
            "nextjs",

        version:
            "3.2.0",

        name:
            "Next.js",

        description:
            "Next.js application template.",

        downloadUrl:
            "https://registry.example.com/packages/nextjs-3.2.0.zip",

        archiveFormat,

        sha256:
            "0123456789abcdef"
    };

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
            template
        ]
    };

}

function main(): void {

    const manifest =
        createManifest();

    const template =
        manifest.templates[0];

    if (!template) {

        throw new Error(
            "The remote registry template was missing."
        );

    }

    if (
        template.downloadUrl !==
        "https://registry.example.com/packages/nextjs-3.2.0.zip"
    ) {

        throw new Error(
            "The remote template download URL was incorrect."
        );

    }

    if (
        template.archiveFormat !==
        "zip"
    ) {

        throw new Error(
            "The remote template archive format was incorrect."
        );

    }

    if (
        template.sha256 !==
        "0123456789abcdef"
    ) {

        throw new Error(
            "The remote template checksum was incorrect."
        );

    }

    const retrievedAt =
        new Date(
            "2026-07-13T14:00:00.000Z"
        );

    const response:
        RemoteRegistryResponse = {

        sourceUrl:
            "https://registry.example.com/registry.json",

        statusCode:
            200,

        retrievedAt,

        manifest
    };

    if (
        response.statusCode !==
        200
    ) {

        throw new Error(
            "The remote registry response status was incorrect."
        );

    }

    if (
        !(response.retrievedAt instanceof Date)
    ) {

        throw new Error(
            "The remote registry retrieval timestamp was not a Date."
        );

    }

    const cacheEntry:
        RegistryCacheEntry = {

        registryId:
            "official",

        sourceUrl:
            response.sourceUrl,

        cachePath:
            "C:/ProjectGenesis/.cache/registries/official.json",

        cachedAt:
            response.retrievedAt,

        manifest:
            response.manifest
    };

    const networkResult:
        RemoteRegistryLoadResult = {

        source:
            "network",

        manifest:
            response.manifest,

        cacheEntry
    };

    if (
        networkResult.source !==
        "network"
    ) {

        throw new Error(
            "The remote registry network source was incorrect."
        );

    }

    if (
        networkResult.cacheEntry
            ?.registryId !==
        "official"
    ) {

        throw new Error(
            "The network result cache entry was incorrect."
        );

    }

    const cacheResult:
        RemoteRegistryLoadResult = {

        source:
            "cache",

        manifest,

        cacheEntry
    };

    if (
        cacheResult.source !==
        "cache"
    ) {

        throw new Error(
            "The remote registry cache source was incorrect."
        );

    }

    /*
     * Local registry entries remain backward compatible
     * and do not require download metadata.
     */
    const localTemplate:
        RegistryTemplate = {

        templateId:
            "project-genesis",

        version:
            "1.0.0",

        name:
            "Project Genesis"
    };

    if (
        localTemplate.downloadUrl !==
        undefined
    ) {

        throw new Error(
            "A local registry entry unexpectedly received a download URL."
        );

    }

    console.log(
        "Remote registry models test completed successfully."
    );

}

main();