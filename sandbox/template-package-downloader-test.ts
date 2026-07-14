import { promises as fs } from "fs";
import http from "http";
import path from "path";

import {
    TemplatePackageDownloader
} from "../lib/services";

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
            "template-package-downloader-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const archiveContents =
        Buffer.from(
            "temporary zip archive contents",
            "utf-8"
        );

    let responseMode:
        "success" |
        "empty" |
        "failure" =
        "success";

    const server =
        http.createServer(
            (_request, response) => {

                if (
                    responseMode ===
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
                        "Unavailable"
                    );

                    return;

                }

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip"
                    }
                );

                response.end(
                    responseMode ===
                        "empty"
                        ? Buffer.alloc(0)
                        : archiveContents
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
                "The temporary package server did not start."
            );

        }

        const packageUrl =
            `http://127.0.0.1:${address.port}/nextjs.zip`;

        const downloader =
            new TemplatePackageDownloader(
                path.join(
                    root,
                    "downloads"
                )
            );

        /*
         * Successful download.
         */
        const result =
            await downloader.download({
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                downloadUrl:
                    packageUrl,

                archiveFormat:
                    "zip",

                sha256:
                    " ABCDEF0123456789 "
            });

        if (
            result.templateId !==
            "nextjs"
        ) {

            throw new Error(
                "The downloaded template ID was incorrect."
            );

        }

        if (
            result.version !==
            "3.2.0"
        ) {

            throw new Error(
                "The downloaded template version was incorrect."
            );

        }

        if (
            result.sizeBytes !==
            archiveContents.byteLength
        ) {

            throw new Error(
                [
                    "The downloaded archive byte count was incorrect.",
                    `Expected: ${archiveContents.byteLength}`,
                    `Actual: ${result.sizeBytes}`
                ].join(" ")
            );

        }

        if (
            !(result.downloadedAt instanceof Date)
        ) {

            throw new Error(
                "The download timestamp was not a Date."
            );

        }

        if (
            result.expectedSha256 !==
            "abcdef0123456789"
        ) {

            throw new Error(
                "The expected SHA-256 value was not normalized."
            );

        }

        await fs.access(
            result.archivePath
        );

        const savedContents =
            await fs.readFile(
                result.archivePath
            );

        if (
            !savedContents.equals(
                archiveContents
            )
        ) {

            throw new Error(
                "The saved archive contents were incorrect."
            );

        }

        const expectedArchivePath =
            downloader.getArchivePath(
                " NEXTJS ",
                "3.2.0"
            );

        if (
            expectedArchivePath !==
            result.archivePath
        ) {

            throw new Error(
                "The calculated package archive path was incorrect."
            );

        }

        const directoryEntries =
            await fs.readdir(
                path.dirname(
                    result.archivePath
                )
            );

        if (
            directoryEntries.some(
                (entry) =>
                    entry.endsWith(
                        ".tmp"
                    )
            )
        ) {

            throw new Error(
                "A temporary package download file remained after success."
            );

        }

        /*
         * A later successful download replaces the
         * version-specific archive.
         */
        const replacementContents =
            Buffer.from(
                "replacement archive contents",
                "utf-8"
            );

        const replacementServerHandler =
            (
                _request:
                    http.IncomingMessage,

                response:
                    http.ServerResponse
            ): void => {

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip"
                    }
                );

                response.end(
                    replacementContents
                );

            };

        server.removeAllListeners(
            "request"
        );

        server.on(
            "request",
            replacementServerHandler
        );

        const replacementResult =
            await downloader.download({
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                downloadUrl:
                    packageUrl,

                archiveFormat:
                    "zip"
            });

        const replacementSavedContents =
            await fs.readFile(
                replacementResult.archivePath
            );

        if (
            !replacementSavedContents.equals(
                replacementContents
            )
        ) {

            throw new Error(
                "The existing package archive was not replaced."
            );

        }

        /*
         * Restore the original handler behavior for
         * error scenarios.
         */
        server.removeAllListeners(
            "request"
        );

        server.on(
            "request",
            (_request, response) => {

                if (
                    responseMode ===
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
                        "Unavailable"
                    );

                    return;

                }

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip"
                    }
                );

                response.end(
                    responseMode ===
                        "empty"
                        ? Buffer.alloc(0)
                        : archiveContents
                );

            }
        );

        /*
         * Empty archive is rejected.
         */
        responseMode =
            "empty";

        let emptyThrown =
            false;

        try {

            await downloader.download({
                templateId:
                    "empty-template",

                version:
                    "1.0.0",

                downloadUrl:
                    packageUrl,

                archiveFormat:
                    "zip"
            });

        } catch (error) {

            emptyThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "was empty"
                )
            ) {

                throw new Error(
                    `Unexpected empty-download error: ${message}`
                );

            }

        }

        if (!emptyThrown) {

            throw new Error(
                "An empty package archive was accepted."
            );

        }

        /*
         * HTTP failure is reported.
         */
        responseMode =
            "failure";

        let httpFailureThrown =
            false;

        try {

            await downloader.download({
                templateId:
                    "failed-template",

                version:
                    "1.0.0",

                downloadUrl:
                    packageUrl,

                archiveFormat:
                    "zip"
            });

        } catch (error) {

            httpFailureThrown =
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
                    `Unexpected HTTP failure: ${message}`
                );

            }

        }

        if (!httpFailureThrown) {

            throw new Error(
                "An HTTP package download failure was accepted."
            );

        }

        /*
         * Unsafe path values are rejected.
         */
        let unsafeIdThrown =
            false;

        try {

            downloader.getArchivePath(
                "../outside",
                "1.0.0"
            );

        } catch {

            unsafeIdThrown =
                true;

        }

        if (!unsafeIdThrown) {

            throw new Error(
                "An unsafe package template ID was accepted."
            );

        }

        /*
         * Invalid protocol is rejected before download.
         */
        let protocolThrown =
            false;

        try {

            await downloader.download({
                templateId:
                    "ftp-template",

                version:
                    "1.0.0",

                downloadUrl:
                    "ftp://example.com/template.zip",

                archiveFormat:
                    "zip"
            });

        } catch (error) {

            protocolThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "must use HTTP or HTTPS"
                )
            ) {

                throw new Error(
                    `Unexpected protocol error: ${message}`
                );

            }

        }

        if (!protocolThrown) {

            throw new Error(
                "An unsupported package download protocol was accepted."
            );

        }

        console.log(
            "Template package downloader test completed successfully."
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
            "Template package downloader test failed.",
            error
        );

        process.exitCode = 1;

    }
);