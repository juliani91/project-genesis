import { promises as fs } from "fs";
import http from "http";
import path from "path";

import {
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryCacheService,
    TemplateRegistryLoadService,
    TemplateRegistryPresenter,
    TemplateRegistryResolver
} from "../lib/services";

function createRemoteManifest(
    location:
        string
): TemplateRegistryManifest {

    return {
        registry: {
            id:
                "official-remote",

            name:
                "Official Remote Registry",

            type:
                "remote",

            location,

            description:
                "Remote registry used by the integration test."
        },

        templates: [
            {
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                name:
                    "Next.js",

                description:
                    "Next.js application template.",

                downloadUrl:
                    `${location}/packages/nextjs-3.2.0.zip`,

                archiveFormat:
                    "zip",

                sha256:
                    "0123456789abcdef"
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

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-remote-registry-integration-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    await fs.mkdir(
        root,
        {
            recursive: true
        }
    );

    let networkAvailable =
        true;

    let registryUrl =
        "";

    const server =
        http.createServer(
            (_request, response) => {

                if (!networkAvailable) {

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
                        createRemoteManifest(
                            registryUrl
                        )
                    )
                );

            }
        );

    await new Promise<void>(
        (resolve) =>
            server.listen(
                0,
                "127.0.0.1",
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
                "The temporary remote registry server did not start."
            );

        }

        registryUrl =
            `http://127.0.0.1:${address.port}`;

        /*
         * Create a repository-style registry definition
         * that points to the temporary remote endpoint.
         */
        const registryManifestPath =
            path.join(
                root,
                "remote-registry.json"
            );

        await fs.writeFile(
            registryManifestPath,
            JSON.stringify(
                {
                    registry: {
                        id:
                            "official-remote",

                        name:
                            "Official Remote Registry",

                        type:
                            "remote",

                        location:
                            registryUrl,

                        description:
                            "Remote registry used by the integration test."
                    },

                    templates: []
                },
                null,
                2
            ),
            "utf-8"
        );

        /*
         * Read the registry definition in the same
         * shape produced by registry discovery.
         */
        const configuredManifest:
            TemplateRegistryManifest =
            JSON.parse(
                await fs.readFile(
                    registryManifestPath,
                    "utf-8"
                )
            );

        const resolver =
            new TemplateRegistryResolver();

        const resolvedRegistry =
            resolver.resolve(
                configuredManifest,
                root
            );

        if (
            resolvedRegistry.type !==
            "remote"
        ) {

            throw new Error(
                "The configured remote registry was not resolved as remote."
            );

        }

        const cacheService =
            new TemplateRegistryCacheService(
                path.join(
                    root,
                    "cache"
                )
            );

        const loadService =
            new TemplateRegistryLoadService(
                cacheService
            );

        /*
         * First load comes from the network.
         */
        const networkResult =
            await loadService.load(
                resolvedRegistry
            );

        if (
            networkResult.source !==
            "network"
        ) {

            throw new Error(
                "The initial remote registry load did not use the network."
            );

        }

        if (
            networkResult.manifest
                .templates
                .length !==
            1
        ) {

            throw new Error(
                "The remote registry template index was not loaded."
            );

        }

        if (
            networkResult.manifest
                .templates[0]
                ?.downloadUrl !==
            `${registryUrl}/packages/nextjs-3.2.0.zip`
        ) {

            throw new Error(
                "The remote template download URL was incorrect."
            );

        }

        if (
            !networkResult.cacheEntry
        ) {

            throw new Error(
                "The network-loaded registry did not create a cache entry."
            );

        }

        await fs.access(
            networkResult
                .cacheEntry
                .cachePath
        );

        /*
         * Show the network-backed preview.
         */
        const presenter =
            new TemplateRegistryPresenter();

        const networkPreview =
            presenter.format(
                {
                    ...resolvedRegistry,

                    templates:
                        networkResult
                            .manifest
                            .templates
                },
                networkResult.source
            );

        console.log(
            networkPreview
        );

        if (
            !networkPreview.includes(
                "Source      : Network"
            )
        ) {

            throw new Error(
                "The remote registry network source was not displayed."
            );

        }

        if (
            !networkPreview.includes(
                "Next.js"
            )
        ) {

            throw new Error(
                "The remote registry preview did not display its template."
            );

        }

        /*
         * Disable the endpoint and verify cache fallback.
         */
        networkAvailable =
            false;

        const cacheResult =
            await loadService.load(
                resolvedRegistry
            );

        if (
            cacheResult.source !==
            "cache"
        ) {

            throw new Error(
                "The unavailable remote registry did not fall back to cache."
            );

        }

        if (
            cacheResult.manifest
                .registry
                .id !==
            "official-remote"
        ) {

            throw new Error(
                "The cached registry manifest ID was incorrect."
            );

        }

        const cachePreview =
            presenter.format(
                {
                    ...resolvedRegistry,

                    templates:
                        cacheResult
                            .manifest
                            .templates
                },
                cacheResult.source
            );

        console.log("");
        console.log(
            cachePreview
        );

        if (
            !cachePreview.includes(
                "Source      : Cache"
            )
        ) {

            throw new Error(
                "The remote registry cache source was not displayed."
            );

        }

        if (
            cachePreview.includes(
                "Source      : Network"
            )
        ) {

            throw new Error(
                "The cached registry preview displayed the wrong source."
            );

        }

        console.log(
            "Template remote registry integration test completed successfully."
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
            "Template remote registry integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);