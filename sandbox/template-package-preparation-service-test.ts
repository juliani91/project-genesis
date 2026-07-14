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
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackagePreparationService
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
            "template-package-preparation-service-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const source =
        path.join(
            root,
            "source"
        );

    const archive =
        path.join(
            root,
            "package.zip"
        );

    await fs.mkdir(
        path.join(
            source,
            "files"
        ),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        path.join(
            source,
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
                    "Integration test",

                author:
                    "Genesis"
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            source,
            "files",
            "README.md"
        ),
        "# Remote Template",
        "utf-8"
    );

    await createZip(
        source,
        archive
    );

    const bytes =
        await fs.readFile(
            archive
        );

    const sha256 =
        createHash(
            "sha256"
        )
            .update(
                bytes
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
                    bytes
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

        const template:
            RegistryTemplate = {

            templateId:
                "remote-template",

            version:
                "1.0.0",

            name:
                "Remote Template",

            downloadUrl:
                `http://127.0.0.1:${address.port}/package.zip`,

            archiveFormat:
                "zip",

            sha256
        };

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

const service =
    new TemplatePackagePreparationService(
        cacheService,
        new TemplateDiscoveryService()
    );

        const prepared =
            await service.prepare(
                template
            );

        if (
            prepared.manifest.id !==
            "remote-template"
        ) {

            throw new Error(
                "The prepared template manifest ID was incorrect."
            );

        }

        if (
            prepared.manifest.version !==
            "1.0.0"
        ) {

            throw new Error(
                "The prepared template version was incorrect."
            );

        }

        if (
            Number(requestCount) !==
            1
        ) {

            throw new Error(
                `Expected one package download but received ${requestCount}.`
            );

        }

        /*
         * Second preparation should reuse cache.
         */
        await service.prepare(
            template
        );

        if (
            Number(requestCount) !==
            1
        ) {

            throw new Error(
                "The cached package was downloaded again."
            );

        }

        console.log(
            "Template package preparation service test completed successfully."
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
            "Template package preparation service test failed.",
            error
        );

        process.exitCode = 1;

    }
);