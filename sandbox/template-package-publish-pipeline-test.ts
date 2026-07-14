import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryTemplate
} from "../lib/models";

import {
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackagePreparationService,
    TemplatePackagePublisher
} from "../lib/services";

async function pathExists(
    targetPath:
        string
): Promise<boolean> {

    try {

        await fs.access(
            targetPath
        );

        return true;

    } catch {

        return false;

    }

}

async function createTemplate(
    templatePath:
        string
): Promise<void> {

    await fs.mkdir(
        path.join(
            templatePath,
            "files"
        ),
        {
            recursive:
                true
        }
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id:
                    "publish-pipeline-test",

                name:
                    "Publish Pipeline Test",

                version:
                    "1.0.0",

                description:
                    "Template package publish pipeline test.",

                author:
                    "Project Genesis",

                category:
                    "Test",

                genesisVersion:
                    "0.17.0",

                tags: [
                    "publish",
                    "pipeline",
                    "test"
                ],

                capabilities: [],

                role:
                    "base",

                provides: [
                    "typescript"
                ],

                requiresCapabilities: [],

                conflictsWith: [],

                deprecated:
                    false
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "wizard.json"
        ),
        JSON.stringify(
            {
                title:
                    "Publish Pipeline Test",

                description:
                    "",

                steps: []
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files.json"
        ),
        JSON.stringify(
            [
                {
                    source:
                        "README.md",

                    destination:
                        "README.md",

                    mode:
                        "copy"
                }
            ],
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files",
            "README.md"
        ),
        [
            "# Publish Pipeline Test",
            "",
            "This template was packaged and prepared again."
        ].join("\n"),
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-publish-pipeline-test"
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

    const templatePath =
        path.join(
            root,
            "template"
        );

    const publishDirectory =
        path.join(
            root,
            "published-packages"
        );

    await createTemplate(
        templatePath
    );

    const publisher =
        new TemplatePackagePublisher();

    /*
     * Publish the template package.
     */
    const published =
        await publisher.publish({
            templatePath,

            outputDirectory:
                publishDirectory,

            overwrite:
                false
        });

    if (
        published.status !==
        "published"
    ) {

        throw new Error(
            "The initial package publish did not return published."
        );

    }

    if (
        published.result.templateId !==
        "publish-pipeline-test"
    ) {

        throw new Error(
            "The published template ID was incorrect."
        );

    }

    if (
        published.result.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The published template version was incorrect."
        );

    }

    if (
        !/^[a-f0-9]{64}$/.test(
            published.result.sha256
        )
    ) {

        throw new Error(
            "The published package SHA-256 was invalid."
        );

    }

    if (
        published.result.packageSizeBytes <=
        0
    ) {

        throw new Error(
            "The published package size was not populated."
        );

    }

    if (
        !(published.result.publishedAt instanceof Date)
    ) {

        throw new Error(
            "The published package timestamp was not a Date."
        );

    }

    if (
        !await pathExists(
            published.result.packagePath
        )
    ) {

        throw new Error(
            "The published ZIP package was not created."
        );

    }

    /*
     * Publish again with overwrite enabled.
     */
    const republished =
        await publisher.publish({
            templatePath,

            outputDirectory:
                publishDirectory,

            overwrite:
                true
        });

    if (
        republished.status !==
        "existing"
    ) {

        throw new Error(
            "The second package publish did not report existing."
        );

    }

    if (
        republished.result.packagePath !==
        published.result.packagePath
    ) {

        throw new Error(
            "The republished package path changed unexpectedly."
        );

    }

    /*
     * Copy the package into a file-backed preparation URL.
     *
     * The package downloader only supports HTTP and HTTPS,
     * so Step 9 uses a small local HTTP server.
     */
    const http =
        await import(
            "http"
        );

    const packageBytes =
        await fs.readFile(
            published.result.packagePath
        );

    let requestCount =
        0;

    const server =
        http.createServer(
            (
                _request,
                response
            ) => {

                requestCount++;

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip",

                        "Content-Length":
                            packageBytes.byteLength
                    }
                );

                response.end(
                    packageBytes
                );

            }
        );

    await new Promise<void>(
        (resolve) => {

            server.listen(
                0,
                "127.0.0.1",
                resolve
            );

        }
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
                "The temporary publish pipeline server did not start."
            );

        }

        const registryTemplate:
            RegistryTemplate = {

            templateId:
                published.result.templateId,

            version:
                published.result.version,

            name:
                "Publish Pipeline Test",

            description:
                "Published package prepared through the remote package flow.",

            downloadUrl:
                `http://127.0.0.1:${address.port}/publish-pipeline-test-1.0.0.zip`,

            archiveFormat:
                "zip",

            sha256:
                published.result.sha256
        };

        const packageCache =
            new TemplatePackageCacheService(
                path.join(
                    root,
                    "package-cache"
                ),
                path.join(
                    root,
                    "template-cache"
                )
            );

        const preparation =
            new TemplatePackagePreparationService(
                packageCache,
                new TemplateDiscoveryService()
            );

        /*
         * Prepare the package using the Sprint 22 pipeline.
         */
        const prepared =
            await preparation.prepare(
                registryTemplate
            );

        if (
            prepared.manifest.id !==
            published.result.templateId
        ) {

            throw new Error(
                "The prepared package template ID did not match the published package."
            );

        }

        if (
            prepared.manifest.version !==
            published.result.version
        ) {

            throw new Error(
                "The prepared package version did not match the published package."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The prepared package request count was incorrect.",
                    `Expected: 1`,
                    `Actual: ${requestCount}`
                ].join(" ")
            );

        }

        const preparedReadmePath =
            path.join(
                prepared.path,
                "files",
                "README.md"
            );

        if (
            !await pathExists(
                preparedReadmePath
            )
        ) {

            throw new Error(
                "The prepared package was missing its README."
            );

        }

        const preparedReadme =
            await fs.readFile(
                preparedReadmePath,
                "utf-8"
            );

        if (
            !preparedReadme.includes(
                "This template was packaged and prepared again."
            )
        ) {

            throw new Error(
                "The prepared package README contents were incorrect."
            );

        }

        /*
         * A second preparation reuses the package cache.
         */
        const cachedPrepared =
            await preparation.prepare(
                registryTemplate
            );

        if (
            cachedPrepared.manifest.id !==
            "publish-pipeline-test"
        ) {

            throw new Error(
                "The cached prepared package manifest was incorrect."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                "The published package was downloaded again instead of using cache."
            );

        }

        console.log(
            "Template validation verified."
        );

        console.log(
            "ZIP package creation verified."
        );

        console.log(
            "SHA-256 package metadata verified."
        );

        console.log(
            "Publish outcome verified."
        );

        console.log(
            "Published package download verified."
        );

        console.log(
            "Published package extraction verified."
        );

        console.log(
            "Published package rediscovery verified."
        );

        console.log(
            "Template package publish pipeline test completed successfully."
        );

    } finally {

        await new Promise<void>(
            (
                resolve,
                reject
            ) => {

                server.close(
                    (error) => {

                        if (error) {

                            reject(
                                error
                            );

                            return;

                        }

                        resolve();

                    }
                );

            }
        );

    }

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package publish pipeline test failed.",
            error
        );

        process.exitCode =
            1;

    }
);