import {
    createHash
} from "crypto";

import {
    execFile
} from "child_process";

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
    TemplatePackagePreparationService
} from "../lib/services";

async function createZip(
    sourceDirectory: string,
    archivePath: string
): Promise<void> {

    await new Promise<void>(
        (
            resolve,
            reject
        ) => {

            execFile(
                "powershell.exe",
                [
                    "-NoProfile",
                    "-Command",
                    [
                        "Compress-Archive",
                        "-Path",
                        `"${sourceDirectory}\\*"`,
                        "-DestinationPath",
                        `"${archivePath}"`,
                        "-Force"
                    ].join(" ")
                ],
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

async function closeServer(
    server: http.Server
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

async function pathExists(
    targetPath: string
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

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-remote-package-integration-test"
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

    /*
     * Build a real template directory that will be
     * compressed and served by the temporary HTTP server.
     */
    const sourceDirectory =
        path.join(
            root,
            "source-template"
        );

    const servedArchivePath =
        path.join(
            root,
            "remote-template.zip"
        );

    await fs.mkdir(
        path.join(
            sourceDirectory,
            "files"
        ),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        path.join(
            sourceDirectory,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id:
                    "remote-template",

                name:
                    "Remote Template",

                version:
                    "1.0.0",

                description:
                    "Remote package integration test template.",

                author:
                    "Project Genesis",

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
            sourceDirectory,
            "files",
            "README.md"
        ),
        [
            "# Remote Template",
            "",
            "Downloaded through the remote package pipeline."
        ].join("\n"),
        "utf-8"
    );

    await createZip(
        sourceDirectory,
        servedArchivePath
    );

    const archiveBytes =
        await fs.readFile(
            servedArchivePath
        );

    const archiveSha256 =
        createHash(
            "sha256"
        )
            .update(
                archiveBytes
            )
            .digest(
                "hex"
            );

    let requestCount =
        0;

    let serverMode:
        "success" |
        "failure" =
        "success";

    const server =
        http.createServer(
            (
                _request,
                response
            ) => {

                requestCount++;

                if (
                    serverMode ===
                    "failure"
                ) {

                    response.writeHead(
                        503,
                        {
                            "Content-Type":
                                "text/plain"
                        }
                    );

                    response.end(
                        "Template package unavailable."
                    );

                    return;

                }

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip",

                        "Content-Length":
                            archiveBytes.byteLength
                    }
                );

                response.end(
                    archiveBytes
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
                "The temporary remote package server did not start."
            );

        }

        const packageUrl =
            [
                "http://127.0.0.1:",
                address.port,
                "/remote-template.zip"
            ].join("");

        const packageCacheDirectory =
            path.join(
                root,
                "package-cache"
            );

        const templateCacheDirectory =
            path.join(
                root,
                "template-cache"
            );

        const cacheService =
            new TemplatePackageCacheService(
                packageCacheDirectory,
                templateCacheDirectory
            );

        const preparationService =
            new TemplatePackagePreparationService(
                cacheService,
                new TemplateDiscoveryService()
            );

        const registryTemplate:
            RegistryTemplate = {

            templateId:
                "remote-template",

            version:
                "1.0.0",

            name:
                "Remote Template",

            description:
                "Remote package integration test template.",

            downloadUrl:
                packageUrl,

            archiveFormat:
                "zip",

            sha256:
                archiveSha256
        };

        /*
         * Scenario 1:
         * Initial preparation downloads, verifies,
         * extracts, and discovers the template.
         */
        const firstPreparedTemplate =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            firstPreparedTemplate
                .manifest
                .id !==
            "remote-template"
        ) {

            throw new Error(
                "The initially prepared template ID was incorrect."
            );

        }

        if (
            firstPreparedTemplate
                .manifest
                .version !==
            "1.0.0"
        ) {

            throw new Error(
                "The initially prepared template version was incorrect."
            );

        }

        if (
            firstPreparedTemplate
                .manifest
                .name !==
            "Remote Template"
        ) {

            throw new Error(
                "The initially prepared template name was incorrect."
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
                    "The initial preparation made an unexpected number of requests.",
                    `Expected: 1`,
                    `Actual: ${requestCount}`
                ].join(" ")
            );

        }

        const extractedTemplatePath =
            cacheService.getTemplatePath(
                "remote-template",
                "1.0.0"
            );

        const extractedManifestPath =
            path.join(
                extractedTemplatePath,
                "genesis.json"
            );

        const extractedReadmePath =
            path.join(
                extractedTemplatePath,
                "files",
                "README.md"
            );

        if (
            !await pathExists(
                extractedManifestPath
            )
        ) {

            throw new Error(
                "The extracted template manifest was not created."
            );

        }

        if (
            !await pathExists(
                extractedReadmePath
            )
        ) {

            throw new Error(
                "The extracted template README was not created."
            );

        }

        const extractedReadme =
            await fs.readFile(
                extractedReadmePath,
                "utf-8"
            );

        if (
            !extractedReadme.includes(
                "Downloaded through the remote package pipeline."
            )
        ) {

            throw new Error(
                "The extracted README contents were incorrect."
            );

        }

        /*
         * Scenario 2:
         * The second preparation reuses the archive
         * and extracted template without another request.
         */
        const secondPreparedTemplate =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            secondPreparedTemplate
                .manifest
                .id !==
            "remote-template"
        ) {

            throw new Error(
                "The cached prepared template ID was incorrect."
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
                    "The cached template package was downloaded again.",
                    `Request count: ${requestCount}`
                ].join(" ")
            );

        }

        /*
         * Scenario 3:
         * Removing genesis.json invalidates the extraction
         * cache and forces a new download and extraction.
         */
        await fs.rm(
            extractedManifestPath,
            {
                force: true
            }
        );

        if (
            await pathExists(
                extractedManifestPath
            )
        ) {

            throw new Error(
                "The extracted manifest was not removed for cache invalidation."
            );

        }

        const rebuiltTemplate =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            rebuiltTemplate
                .manifest
                .id !==
            "remote-template"
        ) {

            throw new Error(
                "The rebuilt template ID was incorrect."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            2
        ) {

            throw new Error(
                [
                    "The invalidated template cache did not trigger a new download.",
                    `Expected request count: 2`,
                    `Actual request count: ${requestCount}`
                ].join(" ")
            );

        }

        if (
            !await pathExists(
                extractedManifestPath
            )
        ) {

            throw new Error(
                "The invalidated template manifest was not restored."
            );

        }

        /*
         * Scenario 4:
         * A bad checksum must stop before extraction.
         *
         * Use another template ID and cache location so an
         * existing valid cached extraction cannot be reused.
         */
        const badChecksumTemplate:
            RegistryTemplate = {

            templateId:
                "bad-checksum-template",

            version:
                "1.0.0",

            name:
                "Bad Checksum Template",

            downloadUrl:
                packageUrl,

            archiveFormat:
                "zip",

            sha256:
                "0".repeat(
                    64
                )
        };

        let checksumMismatchThrown =
            false;

        try {

            await preparationService.prepare(
                badChecksumTemplate
            );

        } catch (error) {

            checksumMismatchThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "checksum mismatch"
                )
            ) {

                throw new Error(
                    `Unexpected checksum error: ${message}`
                );

            }

            if (
                !message.includes(
                    archiveSha256
                )
            ) {

                throw new Error(
                    "The checksum mismatch error did not include the actual checksum."
                );

            }

        }

        if (
            !checksumMismatchThrown
        ) {

            throw new Error(
                "A remote template package with an invalid checksum was accepted."
            );

        }

        const badChecksumExtractionPath =
            cacheService.getTemplatePath(
                "bad-checksum-template",
                "1.0.0"
            );

        if (
            await pathExists(
                badChecksumExtractionPath
            )
        ) {

            throw new Error(
                "A checksum-invalid package was extracted unexpectedly."
            );

        }

        /*
         * The checksum attempt performed one additional
         * successful HTTP request.
         */
        if (
            Number(
                requestCount
            ) !==
            3
        ) {

            throw new Error(
                [
                    "The checksum scenario made an unexpected number of requests.",
                    `Expected request count: 3`,
                    `Actual request count: ${requestCount}`
                ].join(" ")
            );

        }

        /*
         * Scenario 5:
         * An HTTP failure must be reported and must not
         * produce extracted template output.
         */
        serverMode =
            "failure";

        const unavailableTemplate:
            RegistryTemplate = {

            templateId:
                "unavailable-template",

            version:
                "1.0.0",

            name:
                "Unavailable Template",

            downloadUrl:
                packageUrl,

            archiveFormat:
                "zip"
        };

        let networkFailureThrown =
            false;

        try {

            await preparationService.prepare(
                unavailableTemplate
            );

        } catch (error) {

            networkFailureThrown =
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
                    `Unexpected network failure: ${message}`
                );

            }

        }

        if (
            !networkFailureThrown
        ) {

            throw new Error(
                "An unavailable remote template package was accepted."
            );

        }

        const unavailableExtractionPath =
            cacheService.getTemplatePath(
                "unavailable-template",
                "1.0.0"
            );

        if (
            await pathExists(
                unavailableExtractionPath
            )
        ) {

            throw new Error(
                "A failed network download created extracted template output."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            4
        ) {

            throw new Error(
                [
                    "The network failure scenario made an unexpected number of requests.",
                    `Expected request count: 4`,
                    `Actual request count: ${requestCount}`
                ].join(" ")
            );

        }

        console.log(
            "Initial download verified."
        );

        console.log(
            "Package cache reuse verified."
        );

        console.log(
            "Extraction cache invalidation verified."
        );

        console.log(
            "Checksum rejection verified."
        );

        console.log(
            "Network failure handling verified."
        );

        console.log(
            "Template remote package integration test completed successfully."
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
            "Template remote package integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);