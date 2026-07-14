import {
    promises as fs
} from "fs";

import http from "http";
import path from "path";

import {
    TemplateRegistryUploadService
} from "../lib/services";

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

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-registry-upload-service-test"
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

    const packagePath =
        path.join(
            root,
            "upload-test-1.0.0.zip"
        );

    const packageContents =
        Buffer.from(
            "test ZIP package contents",
            "utf-8"
        );

    await fs.writeFile(
        packagePath,
        packageContents
    );

    const sha256 =
        "a".repeat(
            64
        );

    let responseMode:
        "created" |
        "existing" |
        "wrong-id" |
        "wrong-version" |
        "invalid-json" |
        "failure" =
        "created";

    let receivedMethod =
        "";

    let receivedContentType =
        "";

    let receivedAuthorization =
        "";

    let receivedBody =
        Buffer.alloc(
            0
        );

    const server =
        http.createServer(
            (
                request,
                response
            ) => {

                receivedMethod =
                    request.method ??
                    "";

                receivedContentType =
                    String(
                        request.headers[
                            "content-type"
                        ] ??
                        ""
                    );

                receivedAuthorization =
                    String(
                        request.headers
                            .authorization ??
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

                        receivedBody =
                            Buffer.concat(
                                chunks
                            );

                        if (
                            responseMode ===
                            "invalid-json"
                        ) {

                            response.writeHead(
                                201,
                                {
                                    "Content-Type":
                                        "application/json"
                                }
                            );

                            response.end(
                                "{ invalid json"
                            );

                            return;

                        }

                        if (
                            responseMode ===
                            "failure"
                        ) {

                            response.writeHead(
                                500,
                                {
                                    "Content-Type":
                                        "text/plain"
                                }
                            );

                            response.end(
                                "Registry failure"
                            );

                            return;

                        }

                        const statusCode =
                            responseMode ===
                                "existing"
                                ? 409
                                : 201;

                        const templateId =
                            responseMode ===
                                "wrong-id"
                                ? "different-template"
                                : "upload-test";

                        const version =
                            responseMode ===
                                "wrong-version"
                                ? "2.0.0"
                                : "1.0.0";

                        response.writeHead(
                            statusCode,
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        );

                        response.end(
                            JSON.stringify({
                                templateId,

                                version,

                                packageUrl:
                                    "https://registry.example.com/packages/upload-test-1.0.0.zip"
                            })
                        );

                    }
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
                "The temporary registry upload server did not start."
            );

        }

        const uploadUrl =
            `http://127.0.0.1:${address.port}/packages`;

        const service =
            new TemplateRegistryUploadService();

        /*
         * New upload.
         */
        const uploaded =
            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256,

                accessToken:
                    "test-access-token"
            });

        if (
            uploaded.status !==
            "uploaded"
        ) {

            throw new Error(
                "A newly created registry package was not marked as uploaded."
            );

        }

        if (
            uploaded.result.statusCode !==
            201
        ) {

            throw new Error(
                "The upload result status code was incorrect."
            );

        }

        if (
            uploaded.result.packageUrl !==
            "https://registry.example.com/packages/upload-test-1.0.0.zip"
        ) {

            throw new Error(
                "The uploaded package URL was incorrect."
            );

        }

        if (
            !(uploaded.result.uploadedAt instanceof Date)
        ) {

            throw new Error(
                "The upload timestamp was not a Date."
            );

        }

        if (
            receivedMethod !==
            "POST"
        ) {

            throw new Error(
                "The registry upload did not use POST."
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

        if (
            receivedAuthorization !==
            "Bearer test-access-token"
        ) {

            throw new Error(
                "The registry upload bearer token was incorrect."
            );

        }

        const bodyText =
            receivedBody.toString(
                "utf-8"
            );

        const expectedBodyValues = [
            'name="templateId"',
            "upload-test",
            'name="version"',
            "1.0.0",
            'name="sha256"',
            sha256,
            'name="package"',
            "upload-test-1.0.0.zip"
        ];

        for (
            const expectedValue
            of expectedBodyValues
        ) {

            if (
                !bodyText.includes(
                    expectedValue
                )
            ) {

                throw new Error(
                    `The multipart upload body was missing: ${expectedValue}`
                );

            }

        }

        /*
         * Existing package.
         */
        responseMode =
            "existing";

        const existing =
            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256
            });

        if (
            existing.status !==
            "existing"
        ) {

            throw new Error(
                "A registry conflict was not represented as an existing package."
            );

        }

        if (
            existing.result.statusCode !==
            409
        ) {

            throw new Error(
                "The existing-package status code was incorrect."
            );

        }

        /*
         * Response ID mismatch.
         */
        responseMode =
            "wrong-id";

        let wrongIdThrown =
            false;

        try {

            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256
            });

        } catch (error) {

            wrongIdThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "response ID mismatch"
                )
            ) {

                throw new Error(
                    `Unexpected response-ID error: ${message}`
                );

            }

        }

        if (!wrongIdThrown) {

            throw new Error(
                "A registry response with the wrong template ID was accepted."
            );

        }

        /*
         * Response version mismatch.
         */
        responseMode =
            "wrong-version";

        let wrongVersionThrown =
            false;

        try {

            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256
            });

        } catch (error) {

            wrongVersionThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "response version mismatch"
                )
            ) {

                throw new Error(
                    `Unexpected response-version error: ${message}`
                );

            }

        }

        if (!wrongVersionThrown) {

            throw new Error(
                "A registry response with the wrong version was accepted."
            );

        }

        /*
         * Invalid JSON response.
         */
        responseMode =
            "invalid-json";

        let invalidJsonThrown =
            false;

        try {

            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256
            });

        } catch (error) {

            invalidJsonThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "returned invalid JSON"
                )
            ) {

                throw new Error(
                    `Unexpected invalid-JSON error: ${message}`
                );

            }

        }

        if (!invalidJsonThrown) {

            throw new Error(
                "An invalid registry JSON response was accepted."
            );

        }

        /*
         * HTTP failure.
         */
        responseMode =
            "failure";

        let failureThrown =
            false;

        try {

            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256
            });

        } catch (error) {

            failureThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "HTTP 500"
                ) ||
                !message.includes(
                    "Registry failure"
                )
            ) {

                throw new Error(
                    `Unexpected registry failure: ${message}`
                );

            }

        }

        if (!failureThrown) {

            throw new Error(
                "A failed registry upload was accepted."
            );

        }

        /*
         * Invalid SHA-256.
         */
        let invalidChecksumThrown =
            false;

        try {

            await service.upload({
                uploadUrl,

                packagePath,

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256:
                    "invalid"
            });

        } catch (error) {

            invalidChecksumThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "Invalid template package SHA-256"
                )
            ) {

                throw new Error(
                    `Unexpected checksum error: ${message}`
                );

            }

        }

        if (!invalidChecksumThrown) {

            throw new Error(
                "An invalid upload checksum was accepted."
            );

        }

        /*
         * Missing package.
         */
        let missingPackageThrown =
            false;

        try {

            await service.upload({
                uploadUrl,

                packagePath:
                    path.join(
                        root,
                        "missing.zip"
                    ),

                templateId:
                    "upload-test",

                version:
                    "1.0.0",

                sha256
            });

        } catch (error) {

            missingPackageThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "does not exist"
                )
            ) {

                throw new Error(
                    `Unexpected missing-package error: ${message}`
                );

            }

        }

        if (!missingPackageThrown) {

            throw new Error(
                "A missing package was accepted for upload."
            );

        }

        console.log(
            "Template registry upload service test completed successfully."
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
            "Template registry upload service test failed.",
            error
        );

        process.exitCode = 1;

    }
);