import { promises as fs } from "fs";
import path from "path";

import {
    RemoteRegistryResponse,
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryCacheService,
    TemplateRegistryLoadService,
    TemplateRegistryResolver,
    TemplateRegistrySyncService
} from "../lib/services";

class FakeRegistryHttpClient {

    public shouldFail =
        false;

    public requests:
        string[] = [];

    public constructor(
        private readonly manifest:
            TemplateRegistryManifest
    ) {}

    public async fetchManifest(
        url:
            string
    ): Promise<RemoteRegistryResponse> {

        this.requests.push(
            url
        );

        if (
            this.shouldFail
        ) {

            throw new Error(
                "Network unavailable."
            );

        }

        return {
            sourceUrl:
                url,

            statusCode:
                200,

            retrievedAt:
                new Date(
                    "2026-07-20T12:00:00.000Z"
                ),

            manifest:
                this.manifest
        };

    }

}

function createManifest(
    id:
        string,

    type:
        "local" | "remote",

    location:
        string
): TemplateRegistryManifest {

    return {
        registry: {
            id,
            name:
                `${id} registry`,
            type,
            location
        },

        templates: [
            {
                templateId:
                    "project-genesis",

                version:
                    "1.0.0",

                name:
                    "Project Genesis"
            }
        ]
    };

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-registry-sync-service-test"
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

    const localManifest =
        createManifest(
            "local",
            "local",
            "./templates"
        );

    const remoteManifest =
        createManifest(
            "remote",
            "remote",
            "https://registry.example.com/registry.json"
        );

    const httpClient =
        new FakeRegistryHttpClient(
            remoteManifest
        );

    const cacheService =
        new TemplateRegistryCacheService(
            path.join(
                root,
                "cache"
            )
        );

    const loadService =
        new TemplateRegistryLoadService(
            cacheService,
            httpClient
        );

    const syncService =
        new TemplateRegistrySyncService(
            new TemplateRegistryResolver(),
            loadService
        );

    const result =
        await syncService.sync([
            localManifest,
            remoteManifest
        ]);

    if (
        result.synced.length !==
        2
    ) {

        throw new Error(
            "Registry sync did not include both registries."
        );

    }

    const localEntry =
        result.synced.find(
            (entry) =>
                entry.registryId ===
                "local"
        );

    if (
        localEntry?.source !==
        "local"
    ) {

        throw new Error(
            "Local registry was not reported as local."
        );

    }

    const remoteEntry =
        result.synced.find(
            (entry) =>
                entry.registryId ===
                "remote"
        );

    if (
        remoteEntry?.source !==
            "network" ||
        !remoteEntry.cachePath ||
        remoteEntry.cachedAt?.toISOString() !==
            "2026-07-20T12:00:00.000Z"
    ) {

        throw new Error(
            "Remote registry was not synchronized from the network cache path."
        );

    }

    const cached =
        await cacheService.read(
            "remote"
        );

    if (
        cached.status !==
            "fresh" ||
        cached.entry?.manifest.registry.id !==
            "remote"
    ) {

        throw new Error(
            "Remote registry was not written to the cache."
        );

    }

    httpClient.shouldFail =
        true;

    const fallback =
        await syncService.sync(
            [
                remoteManifest
            ],
            "remote"
        );

    if (
        fallback.synced[0]?.source !==
        "cache"
    ) {

        throw new Error(
            "Remote registry did not fall back to the cache."
        );

    }

    let missingThrown =
        false;

    try {

        await syncService.sync(
            [
                remoteManifest
            ],
            "missing"
        );

    } catch (error) {

        missingThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "No template registry was found"
            )
        ) {

            throw new Error(
                `Unexpected missing registry error: ${message}`
            );

        }

    }

    if (
        !missingThrown
    ) {

        throw new Error(
            "Missing registry sync did not fail."
        );

    }

    console.log(
        "Template registry sync service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry sync service test failed.",
            error
        );

        process.exitCode =
            1;

    }
);
