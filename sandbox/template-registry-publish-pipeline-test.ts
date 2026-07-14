import {
    promises as fs
} from "fs";

import http from "http";
import path from "path";

import {
    RegistryTemplate
} from "../lib/models";

import {
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackagePreparationService,
    TemplatePackagePublisher,
    TemplateRegistryUploadService
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

async function closeServer(
    server:
        http.Server
): Promise<void> {

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
                    "registry-publish-test",

                name:
                    "Registry Publish Test",

                version:
                    "1.0.0",

                description:
                    "End-to-end registry publishing test.",

                author:
                    "Project Genesis",

                category:
                    "Test",

                genesisVersion:
                    "0.17.0",

                tags: [
                    "registry",
                    "publish",
                    "pipeline"
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
                    "Registry Publish Test",

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
            "# Registry Publish Test",
            "",
            "Published through the remote registry pipeline."
        ].join("\n"),
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-registry-publish-pipeline-test"
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
            "packages"
        );

    await createTemplate(
        templatePath
    );

    const publisher =
        new TemplatePackagePublisher();

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
            "The template package was not published locally."
        );

    }

    const publishedBytes =
        await fs.readFile(
            published.result.packagePath
        );

    let uploadRequestCount =
        0;

    let downloadRequestCount =
        0;

    let receivedAuthorization =
        "";

    let receivedContentType =
        "";

    let receivedUploadBody =
        Buffer.alloc(
            0
        );

    let packageUrl =
        "";

    const server =
        http.createServer(
            (
                request,
                response
            ) => {

                const requestUrl =
                    request.url ??
                    "";

                if (
                    request.method ===
                        "POST" &&
                    requestUrl ===
                        "/packages"
                ) {

                    uploadRequestCount++;

                    receivedAuthorization =
                        String(
                            request.headers
                                .authorization ??
                            ""
                        );

                    receivedContentType =
                        String(
                            request.headers[
                                "content-type"
                            ] ??
                            ""
                        );

                    const chunks:
                        Buffer[] = [];

                    request.on(
                        "data",
                        (chunk) => {

                            chunks.push(
                                Buffer.isBuffer(
                                    chunk
                                )
                                    ? chunk
                                    : Buffer.from(
                                        chunk
                                    )
                            );

                        }
                    );

                    request.on(
                        "end",
                        () => {

                            receivedUploadBody =
                                Buffer.concat(
                                    chunks
                                );

                            response.writeHead(
                                201,
                                {
                                    "Content-Type":
                                        "application/json"
                                }
                            );

                            response.end(
                                JSON.stringify({
                                    templateId:
                                        "registry-publish-test",

                                    version:
                                        "1.0.0",

                                    packageUrl
                                })
                            );

                        }
                    );

                    return;

                }

                if (
                    request.method ===
                        "GET" &&
                    requestUrl ===
                        "/packages/registry-publish-test-1.0.0.zip"
                ) {

                    downloadRequestCount++;

                    response.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/zip",

                            "Content-Length":
                                publishedBytes.byteLength
                        }
                    );

                    response.end(
                        publishedBytes
                    );

                    return;

                }

                response.writeHead(
                    404,
                    {
                        "Content-Type":
                            "text/plain"
                    }
                );

                response.end(
                    "Not Found"
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
                "The temporary registry publish server did not start."
            );

        }

        const baseUrl =
            `http://127.0.0.1:${address.port}`;

        const uploadUrl =
            `${baseUrl}/packages`;

        packageUrl =
            `${baseUrl}/packages/registry-publish-test-1.0.0.zip`;

        /*
         * Upload the locally built package.
         */
        const uploadService =
            new TemplateRegistryUploadService();

        const uploaded =
            await uploadService.upload({
                uploadUrl,

                packagePath:
                    published.result.packagePath,

                templateId:
                    published.result.templateId,

                version:
                    published.result.version,

                sha256:
                    published.result.sha256,

                accessToken:
                    "registry-publish-token"
            });

        if (
            uploaded.status !==
            "uploaded"
        ) {

            throw new Error(
                "The registry publish pipeline did not report an uploaded package."
            );

        }

        if (
            uploaded.result.statusCode !==
            201
        ) {

            throw new Error(
                "The registry upload status code was incorrect."
            );

        }

        if (
            uploaded.result.packageUrl !==
            packageUrl
        ) {

            throw new Error(
                "The registry returned package URL was incorrect."
            );

        }

        if (
            Number(
                uploadRequestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The registry upload request count was incorrect.",
                    `Expected: 1`,
                    `Actual: ${uploadRequestCount}`
                ].join(" ")
            );

        }

        if (
            receivedAuthorization !==
            "Bearer registry-publish-token"
        ) {

            throw new Error(
                "The registry upload authorization header was incorrect."
            );

        }

        if (
            !receivedContentType.includes(
                "multipart/form-data"
            )
        ) {

            throw new Error(
                "The registry upload did not use multipart/form-data."
            );

        }

        const uploadBodyText =
            receivedUploadBody.toString(
                "utf-8"
            );

        const expectedUploadValues = [
            'name="templateId"',
            "registry-publish-test",
            'name="version"',
            "1.0.0",
            'name="sha256"',
            published.result.sha256,
            'name="package"',
            "registry-publish-test-1.0.0.zip"
        ];

        for (
            const expectedValue
            of expectedUploadValues
        ) {

            if (
                !uploadBodyText.includes(
                    expectedValue
                )
            ) {

                throw new Error(
                    `The registry upload body was missing: ${expectedValue}`
                );

            }

        }

        /*
         * Consume the uploaded package through the Sprint 22
         * remote package preparation flow.
         */
        const registryTemplate:
            RegistryTemplate = {

            templateId:
                uploaded.result.templateId,

            version:
                uploaded.result.version,

            name:
                "Registry Publish Test",

            description:
                "Uploaded and downloaded through the registry publish pipeline.",

            downloadUrl:
                uploaded.result.packageUrl,

            archiveFormat:
                "zip",

            sha256:
                published.result.sha256
        };

        const packageCacheService =
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

        const preparationService =
            new TemplatePackagePreparationService(
                packageCacheService,
                new TemplateDiscoveryService()
            );

        const prepared =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            prepared.manifest.id !==
            "registry-publish-test"
        ) {

            throw new Error(
                "The downloaded registry package template ID was incorrect."
            );

        }

        if (
            prepared.manifest.version !==
            "1.0.0"
        ) {

            throw new Error(
                "The downloaded registry package version was incorrect."
            );

        }

        if (
            Number(
                downloadRequestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The published package download count was incorrect.",
                    `Expected: 1`,
                    `Actual: ${downloadRequestCount}`
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
                "The downloaded registry package was missing README.md."
            );

        }

        const readme =
            await fs.readFile(
                preparedReadmePath,
                "utf-8"
            );

        if (
            !readme.includes(
                "Published through the remote registry pipeline."
            )
        ) {

            throw new Error(
                "The downloaded registry package README was incorrect."
            );

        }

        /*
         * Reuse the package cache without another download.
         */
        const cachedPrepared =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            cachedPrepared.manifest.id !==
            "registry-publish-test"
        ) {

            throw new Error(
                "The cached registry package manifest was incorrect."
            );

        }

        if (
            Number(
                downloadRequestCount
            ) !==
            1
        ) {

            throw new Error(
                "The registry package was downloaded again instead of using cache."
            );

        }

        console.log(
            "Template package publishing verified."
        );

        console.log(
            "Registry multipart upload verified."
        );

        console.log(
            "Registry response identity verified."
        );

        console.log(
            "Published package download verified."
        );

        console.log(
            "Published package integrity verified."
        );

        console.log(
            "Published package rediscovery verified."
        );

        console.log(
            "Registry package cache reuse verified."
        );

        console.log(
            "Template registry publish pipeline test completed successfully."
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
            "Template registry publish pipeline test failed.",
            error
        );

        process.exitCode =
            1;

    }
);