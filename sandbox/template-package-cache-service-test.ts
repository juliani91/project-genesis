import {
    createHash
} from "crypto";

import { promises as fs } from "fs";
import http from "http";
import path from "path";

import {
    RegistryTemplate
} from "../lib/models";

import {
    TemplatePackageCacheService
} from "../lib/services";

async function createZip(
    sourceDirectory:
        string,

    archivePath:
        string
): Promise<void> {

    const {
        execFile
    } =
        await import(
            "child_process"
        );

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
                (error) =>
                    error
                        ? reject(error)
                        : resolve()
            );

        }
    );

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
            "template-package-cache-service-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const sourcePath =
        path.join(
            root,
            "source"
        );

    const servedArchivePath =
        path.join(
            root,
            "served-package.zip"
        );

    await fs.mkdir(
        path.join(
            sourcePath,
            "files"
        ),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        path.join(
            sourcePath,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id:
                    "remote-test",

                name:
                    "Remote Test",

                version:
                    "1.0.0",

                description:
                    "",

                author:
                    "Test"
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            sourcePath,
            "files",
            "README.md"
        ),
        "# Remote Test",
        "utf-8"
    );

    await createZip(
        sourcePath,
        servedArchivePath
    );

    const archiveBytes =
        await fs.readFile(
            servedArchivePath
        );

    const sha256 =
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

    const server =
        http.createServer(
            (_request, response) => {

                requestCount++;

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip"
                    }
                );

                response.end(
                    archiveBytes
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
                "The temporary template package server did not start."
            );

        }

        const template:
            RegistryTemplate = {

            templateId:
                "remote-test",

            version:
                "1.0.0",

            name:
                "Remote Test",

            downloadUrl:
                `http://127.0.0.1:${address.port}/package.zip`,

            archiveFormat:
                "zip",

            sha256
        };

        const service =
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

        /*
         * First preparation downloads and extracts.
         */
        const first =
            await service.prepare(
                template
            );

        if (
            first.download.status !==
            "downloaded"
        ) {

            throw new Error(
                "The first package preparation did not download the archive."
            );

        }

        if (
            first.extraction.status !==
            "extracted"
        ) {

            throw new Error(
                "The first package preparation did not extract the archive."
            );

        }

        if (
            requestCount !==
            1
        ) {

            throw new Error(
                `Expected 1 package request but received ${requestCount}.`
            );

        }

        await fs.access(
            path.join(
                first.extraction
                    .result
                    .templatePath,
                "genesis.json"
            )
        );

        await fs.access(
            path.join(
                first.extraction
                    .result
                    .templatePath,
                "files",
                "README.md"
            )
        );

        /*
         * Second preparation reuses archive and extraction.
         */
        const second =
            await service.prepare(
                template
            );

        if (
            second.download.status !==
            "cached"
        ) {

            throw new Error(
                "The second package preparation did not reuse the archive."
            );

        }

        if (
            second.extraction.status !==
            "cached"
        ) {

            throw new Error(
                "The second package preparation did not reuse the extraction."
            );

        }

        if (
            requestCount !==
            1
        ) {

            throw new Error(
                "The cached package preparation performed another network request."
            );

        }

        if (
            second.extraction
                .result
                .fileCount !==
            2
        ) {

            throw new Error(
                [
                    "The cached extraction file count was incorrect.",
                    `Actual: ${second.extraction.result.fileCount}`
                ].join(" ")
            );

        }

        /*
         * Removing the extracted manifest invalidates
         * the extraction cache and forces preparation.
         */
        await fs.rm(
            path.join(
                second.extraction
                    .result
                    .templatePath,
                "genesis.json"
            ),
            {
                force: true
            }
        );

        const third =
            await service.prepare(
                template
            );

        if (
            third.download.status !==
            "downloaded" ||
            third.extraction.status !==
            "extracted"
        ) {

            throw new Error(
                "An incomplete extraction cache was not rebuilt."
            );

        }

        if (
            Number(requestCount) !==2
        ) {

            throw new Error(
                "The invalidated cache did not trigger a new download."
            );

        }

        /*
         * Missing remote package metadata is rejected.
         */
        let missingUrlThrown =
            false;

        try {

            await service.prepare({
                templateId:
                    "missing-url",

                version:
                    "1.0.0",

                name:
                    "Missing URL"
            });

        } catch (error) {

            missingUrlThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "does not provide a download URL"
                )
            ) {

                throw new Error(
                    `Unexpected missing-URL error: ${message}`
                );

            }

        }

        if (!missingUrlThrown) {

            throw new Error(
                "A remote package without a download URL was accepted."
            );

        }

        console.log(
            "Template package cache service test completed successfully."
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
            "Template package cache service test failed.",
            error
        );

        process.exitCode = 1;

    }
);