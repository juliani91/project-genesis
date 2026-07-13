import { promises as fs } from "fs";
import http from "http";
import path from "path";

import {
    ResolvedTemplateRegistry,
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryCacheService,
    TemplateRegistryLoadService,
    TemplateRegistryPresenter,
    TemplateRegistryResolver
} from "../lib/services";

function createManifest(
    registryUrl: string,
    version:
        string = "3.2.0"
): TemplateRegistryManifest {

    return {
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
                "Cached remote registry pipeline test."
        },

        templates: [
            {
                templateId:
                    "nextjs",

                version,

                name:
                    "Next.js",

                description:
                    "Next.js application template.",

                downloadUrl:
                    `${registryUrl}/packages/nextjs-${version}.zip`,

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
            "template-remote-registry-cache-pipeline-test"
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

    let registryUrl =
        "";

    let networkAvailable =
        true;

    let advertisedVersion =
        "3.2.0";

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
                        "Remote registry unavailable."
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
                        createManifest(
                            registryUrl,
                            advertisedVersion
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
                "The temporary registry server did not start."
            );

        }

        registryUrl =
            `http://127.0.0.1:${address.port}`;

        const configuredManifest:
            TemplateRegistryManifest = {

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
                    "Configured remote registry."
            },

            templates: []
        };

        const resolver =
            new TemplateRegistryResolver();

        const registry:
            ResolvedTemplateRegistry =
            resolver.resolve(
                configuredManifest,
                root
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
                cacheService
            );

        const presenter =
            new TemplateRegistryPresenter();

        /*
         * First network load writes version 3.2.0
         * into the cache.
         */
        const firstResult =
            await loadService.load(
                registry
            );

        if (
            firstResult.source !==
            "network"
        ) {

            throw new Error(
                "The first remote registry load did not use the network."
            );

        }

        const firstTemplate =
            firstResult.manifest
                .templates[0];

        if (
            firstTemplate?.version !==
            "3.2.0"
        ) {

            throw new Error(
                "The first remote registry version was incorrect."
            );

        }

        if (
            !firstResult.cacheEntry
        ) {

            throw new Error(
                "The first network load did not create a cache entry."
            );

        }

        const cachePath =
            firstResult.cacheEntry
                .cachePath;

        await fs.access(
            cachePath
        );

        const networkPreview =
            presenter.format(
                {
                    ...registry,

                    templates:
                        firstResult
                            .manifest
                            .templates
                },
                firstResult.source
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
                "The first preview did not report the network source."
            );

        }

        if (
            !networkPreview.includes(
                "v3.2.0"
            )
        ) {

            throw new Error(
                "The first preview did not display version 3.2.0."
            );

        }

        /*
         * A second successful network load updates the
         * cached registry metadata to version 3.3.0.
         */
        advertisedVersion =
            "3.3.0";

        const updatedResult =
            await loadService.load(
                registry
            );

        if (
            updatedResult.source !==
            "network"
        ) {

            throw new Error(
                "The updated registry load did not use the network."
            );

        }

        if (
            updatedResult.manifest
                .templates[0]
                ?.version !==
            "3.3.0"
        ) {

            throw new Error(
                "The updated remote registry version was incorrect."
            );

        }

        /*
         * Disable the network. The next load must use
         * the most recently cached version, 3.3.0.
         */
        networkAvailable =
            false;

        const cachedResult =
            await loadService.load(
                registry
            );

        if (
            cachedResult.source !==
            "cache"
        ) {

            throw new Error(
                "The unavailable remote registry did not use the cache."
            );

        }

        const cachedTemplate =
            cachedResult.manifest
                .templates[0];

        if (
            cachedTemplate?.version !==
            "3.3.0"
        ) {

            throw new Error(
                [
                    "The cache did not preserve the latest registry version.",
                    `Actual: ${cachedTemplate?.version}`
                ].join(" ")
            );

        }

        if (
            cachedTemplate.downloadUrl !==
            `${registryUrl}/packages/nextjs-3.3.0.zip`
        ) {

            throw new Error(
                "The cached template download URL was incorrect."
            );

        }

        if (
            cachedTemplate.archiveFormat !==
            "zip"
        ) {

            throw new Error(
                "The cached template archive format was incorrect."
            );

        }

        if (
            cachedTemplate.sha256 !==
            "0123456789abcdef"
        ) {

            throw new Error(
                "The cached template checksum was incorrect."
            );

        }

        const cachePreview =
            presenter.format(
                {
                    ...registry,

                    templates:
                        cachedResult
                            .manifest
                            .templates
                },
                cachedResult.source
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
                "The offline preview did not report the cache source."
            );

        }

        if (
            !cachePreview.includes(
                "v3.3.0"
            )
        ) {

            throw new Error(
                "The offline preview did not display the cached version."
            );

        }

        /*
         * Confirm the persisted cache can be read by a
         * newly created cache service instance.
         */
        const freshCacheService =
            new TemplateRegistryCacheService(
                path.join(
                    root,
                    "cache"
                )
            );

        const persisted =
            await freshCacheService.read(
                "official-remote"
            );

        if (
            persisted.status !==
                "fresh" ||
            !persisted.entry
        ) {

            throw new Error(
                "The persisted registry cache could not be reopened."
            );

        }

        if (
            persisted.entry.manifest
                .templates[0]
                ?.version !==
            "3.3.0"
        ) {

            throw new Error(
                "The reopened cache contained the wrong registry version."
            );

        }

        if (
            !(
                persisted.entry.cachedAt
                instanceof Date
            )
        ) {

            throw new Error(
                "The reopened cache timestamp was not restored as a Date."
            );

        }

        console.log(
            "Template remote registry cache pipeline test completed successfully."
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
            "Template remote registry cache pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);