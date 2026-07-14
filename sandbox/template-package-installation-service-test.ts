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
    RegistryIndexTemplate
} from "../lib/models";

import {
    InstalledTemplatePackageStore,
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackageInstallationService,
    TemplatePackagePreparationService
} from "../lib/services";

async function createZip(
    sourceDirectory:
        string,

    archivePath:
        string
): Promise<void> {

    const escapedSource =
        sourceDirectory.replace(
            /'/g,
            "''"
        );

    const escapedArchive =
        archivePath.replace(
            /'/g,
            "''"
        );

    const command = [
        `$items = Get-ChildItem -LiteralPath '${escapedSource}' -Force`,
        `Compress-Archive -Path $items.FullName -DestinationPath '${escapedArchive}' -Force`
    ].join("; ");

    await new Promise<void>(
        (
            resolve,
            reject
        ) => {

            execFile(
                "powershell.exe",
                [
                    "-NoProfile",
                    "-NonInteractive",
                    "-Command",
                    command
                ],
                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (error) {

                        reject(
                            new Error(
                                stderr.trim() ||
                                stdout.trim() ||
                                error.message
                            )
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
        string,

    version:
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
                    "install-test",

                name:
                    "Install Test",

                version,

                description:
                    "Template installation service test.",

                author:
                    "Project Genesis"
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
                    "Install Test",

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
        "[]",
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files",
            "README.md"
        ),
        `# Install Test ${version}`,
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-installation-service-test"
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

    await fs.mkdir(
        root,
        {
            recursive:
                true
        }
    );

    const sourceTemplatePath =
        path.join(
            root,
            "source-template"
        );

    const servedArchivePath =
        path.join(
            root,
            "install-test-1.0.0.zip"
        );

    await createTemplate(
        sourceTemplatePath,
        "1.0.0"
    );

    await createZip(
        sourceTemplatePath,
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
                "The temporary installation package server did not start."
            );

        }

        const packageUrl =
            `http://127.0.0.1:${address.port}/install-test-1.0.0.zip`;

        const installedStore =
            new InstalledTemplatePackageStore(
                path.join(
                    root,
                    "installed-store",
                    "packages.json"
                )
            );

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

        const installationDirectory =
            path.join(
                root,
                "installed-templates"
            );

        const installationService =
            new TemplatePackageInstallationService(
                installationDirectory,
                preparationService,
                installedStore
            );

        const indexedTemplate:
            RegistryIndexTemplate = {

            templateId:
                "install-test",

            name:
                "Install Test",

            description:
                "Template installation service test.",

            registryId:
                "official",

            source:
                `http://127.0.0.1:${address.port}`,

            latestVersion:
                "1.0.0",

            versions: [
                {
                    version:
                        "1.0.0",

                    downloadUrl:
                        packageUrl,

                    archiveFormat:
                        "zip",

                    sha256
                }
            ]
        };

        /*
         * Install the latest version.
         */
        const installed =
            await installationService.install(
                indexedTemplate
            );

        if (
            installed.templateId !==
            "install-test"
        ) {

            throw new Error(
                "The installed template ID was incorrect."
            );

        }

        if (
            installed.version !==
            "1.0.0"
        ) {

            throw new Error(
                "The installed template version was incorrect."
            );

        }

        if (
            installed.sha256 !==
            sha256
        ) {

            throw new Error(
                "The installed template SHA-256 was incorrect."
            );

        }

        if (
            installed.source !==
            indexedTemplate.source
        ) {

            throw new Error(
                "The installed template source was incorrect."
            );

        }

        if (
            !(installed.installedAt instanceof Date)
        ) {

            throw new Error(
                "The installed template timestamp was not a Date."
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
                    "The installation request count was incorrect.",
                    "Expected: 1",
                    `Actual: ${requestCount}`
                ].join(" ")
            );

        }

        const expectedInstallPath =
            installationService.getInstallPath(
                "install-test",
                "1.0.0"
            );

        if (
            installed.installPath !==
            expectedInstallPath
        ) {

            throw new Error(
                "The installed template path was incorrect."
            );

        }

        if (
            !await pathExists(
                path.join(
                    installed.installPath,
                    "genesis.json"
                )
            )
        ) {

            throw new Error(
                "The installed template manifest was missing."
            );

        }

        const readmePath =
            path.join(
                installed.installPath,
                "files",
                "README.md"
            );

        if (
            !await pathExists(
                readmePath
            )
        ) {

            throw new Error(
                "The installed template README was missing."
            );

        }

        const readme =
            await fs.readFile(
                readmePath,
                "utf-8"
            );

        if (
            readme !==
            "# Install Test 1.0.0"
        ) {

            throw new Error(
                "The installed template README contents were incorrect."
            );

        }

        /*
         * The installed metadata was persisted.
         */
        const persisted =
            await installedStore.findById(
                "install-test"
            );

        if (
            persisted.length !==
            1
        ) {

            throw new Error(
                "The installed package record was not persisted."
            );

        }

        if (
            persisted[0]
                ?.installPath !==
            installed.installPath
        ) {

            throw new Error(
                "The persisted installation path was incorrect."
            );

        }

        /*
         * Reinstalling the same package reuses the package
         * cache and replaces the permanent installation.
         */
        const markerPath =
            path.join(
                installed.installPath,
                "stale-marker.txt"
            );

        await fs.writeFile(
            markerPath,
            "stale",
            "utf-8"
        );

        const reinstalled =
            await installationService.install(
                indexedTemplate,
                "1.0.0"
            );

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                "Reinstallation downloaded the cached package again."
            );

        }

        if (
            await pathExists(
                markerPath
            )
        ) {

            throw new Error(
                "Reinstallation did not replace the existing installation."
            );

        }

        if (
            reinstalled.installPath !==
            installed.installPath
        ) {

            throw new Error(
                "The reinstall path changed unexpectedly."
            );

        }

        const afterReinstall =
            await installedStore.findById(
                "install-test"
            );

        if (
            afterReinstall.length !==
            1
        ) {

            throw new Error(
                "Reinstallation created a duplicate installed-package record."
            );

        }

        /*
         * Unknown version is rejected.
         */
        let missingVersionThrown =
            false;

        try {

            await installationService.install(
                indexedTemplate,
                "9.9.9"
            );

        } catch (error) {

            missingVersionThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    'does not advertise version "9.9.9"'
                )
            ) {

                throw new Error(
                    `Unexpected missing-version error: ${message}`
                );

            }

        }

        if (!missingVersionThrown) {

            throw new Error(
                "An unadvertised package version was installed."
            );

        }

        /*
         * Missing checksum is rejected before download.
         */
        let missingChecksumThrown =
            false;

        try {

            await installationService.install({
                ...indexedTemplate,

                templateId:
                    "missing-checksum",

                versions: [
                    {
                        version:
                            "1.0.0",

                        downloadUrl:
                            packageUrl,

                        archiveFormat:
                            "zip"
                    }
                ]
            });

        } catch (error) {

            missingChecksumThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "does not provide a SHA-256 checksum"
                )
            ) {

                throw new Error(
                    `Unexpected missing-checksum error: ${message}`
                );

            }

        }

        if (!missingChecksumThrown) {

            throw new Error(
                "A package without a SHA-256 checksum was installed."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                "The missing-checksum scenario performed a network request."
            );

        }

        const temporaryEntries =
            await fs.readdir(
                path.dirname(
                    installed.installPath
                )
            );

        if (
            temporaryEntries.some(
                (entry) =>
                    entry.includes(
                        ".tmp-"
                    )
            )
        ) {

            throw new Error(
                "A temporary installation directory remained."
            );

        }

        console.log(
            "Package preparation verified."
        );

        console.log(
            "Permanent installation verified."
        );

        console.log(
            "Installed-package persistence verified."
        );

        console.log(
            "Package-cache reuse during reinstall verified."
        );

        console.log(
            "Installation validation verified."
        );

        console.log(
            "Template package installation service test completed successfully."
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
            "Template package installation service test failed.",
            error
        );

        process.exitCode =
            1;

    }
);