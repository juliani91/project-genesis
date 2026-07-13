import http from "http";
import path from "path";

import {
    ResolvedTemplateRegistry,
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryCacheService,
    TemplateRegistryHttpClient,
    TemplateRegistryLoadService
} from "../lib/services";

function createManifest(
    name:
        string = "Official Registry"
): TemplateRegistryManifest {

    return {
        registry: {
            id:
                "official",

            name,

            type:
                "remote",

            location:
                "http://localhost"
        },

        templates: [
            {
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                name:
                    "Next.js",

                downloadUrl:
                    "https://example.com/nextjs.zip",

                archiveFormat:
                    "zip"
            }
        ]
    };

}

async function closeServer(
    server:
        http.Server
): Promise<void> {

    await new Promise<void>(
        (resolve, reject) =>
            server.close(
                (error) =>
                    error
                        ? reject(error)
                        : resolve()
            )
    );

}

async function main(): Promise<void> {

    let requestShouldFail =
        false;

    const server =
        http.createServer(
            (_request, response) => {

                if (
                    requestShouldFail
                ) {

                    response.writeHead(
                        503,
                        {
                            "Content-Type":
                                "text/plain"
                        }
                    );

                    response.end(
                        "Unavailable"
                    );

                    return;

                }

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );

                response.end(
                    JSON.stringify(
                        createManifest()
                    )
                );

            }
        );

    await new Promise<void>(
        (resolve) =>
            server.listen(
                0,
                resolve
            )
    );

    try {

        const address =
            server.address();

        if (
            !address ||
            typeof address ===
                "string"
        ) {

            throw new Error(
                "The temporary HTTP server did not start."
            );

        }

        const root =
            path.join(
                process.cwd(),
                "sandbox-output",
                "template-registry-load-service-test"
            );

        const cacheService =
            new TemplateRegistryCacheService(
                path.join(
                    root,
                    "cache"
                )
            );

        const service =
            new TemplateRegistryLoadService(
                cacheService,
                new TemplateRegistryHttpClient()
            );

        const registry:
            ResolvedTemplateRegistry = {

            id:
                "official",

            name:
                "Official Registry",

            type:
                "remote",

            resolvedLocation:
                `http://127.0.0.1:${address.port}`,

            templates: []
        };

        /*
         * Network load creates cache.
         */
        const networkResult =
            await service.load(
                registry
            );

        if (
            networkResult.source !==
            "network"
        ) {

            throw new Error(
                "The successful remote load did not report the network source."
            );

        }

        if (
            networkResult.cacheEntry
                ?.registryId !==
            "official"
        ) {

            throw new Error(
                "The successful remote load did not create a cache entry."
            );

        }

        /*
         * Failed network request falls back to cache.
         */
        requestShouldFail =
            true;

        const cachedResult =
            await service.load(
                registry
            );

        if (
            cachedResult.source !==
            "cache"
        ) {

            throw new Error(
                "The failed remote request did not fall back to cache."
            );

        }

        if (
            cachedResult.manifest
                .registry
                .name !==
            "Official Registry"
        ) {

            throw new Error(
                "The cached remote manifest was incorrect."
            );

        }

        /*
         * Network failure without cache rethrows.
         */
        const missingCacheService =
            new TemplateRegistryCacheService(
                path.join(
                    root,
                    "missing-cache"
                )
            );

        const missingCacheLoader =
            new TemplateRegistryLoadService(
                missingCacheService,
                new TemplateRegistryHttpClient()
            );

        let missingFailureThrown =
            false;

        try {

            await missingCacheLoader.load(
                registry
            );

        } catch (error) {

            missingFailureThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "HTTP 503"
                )
            ) {

                throw new Error(
                    `Unexpected no-cache network error: ${message}`
                );

            }

        }

        if (!missingFailureThrown) {

            throw new Error(
                "A failed remote request without cache was accepted."
            );

        }

        /*
         * Local registry pass-through.
         */
        const localManifest:
            TemplateRegistryManifest = {

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

            templates: []
        };

        const localRegistry:
            ResolvedTemplateRegistry = {

            id:
                "local",

            name:
                "Local Registry",

            type:
                "local",

            resolvedLocation:
                path.join(
                    process.cwd(),
                    "templates"
                ),

            templates: []
        };

        const localResult =
            await service.load(
                localRegistry,
                localManifest
            );

        if (
            localResult.source !==
            "local"
        ) {

            throw new Error(
                "The local registry did not report the local source."
            );

        }

        if (
            localResult.manifest
                .registry
                .id !==
            "local"
        ) {

            throw new Error(
                "The local registry manifest was not preserved."
            );

        }

        console.log(
            "Template registry load service test completed successfully."
        );

    } finally {

        await closeServer(
            server
        );

    }

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry load service test failed.",
            error
        );

        process.exitCode = 1;

    }
);