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
    TemplateRegistryIndex
} from "../lib/models";

import {
    PackageInstallCommand
} from "../lib/commands";

import {
    InstalledTemplatePackageStore,
    PackageCommandFormatter,
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackageInstallationService,
    TemplatePackagePreparationService,
    TemplatePackageSearchService,
    TemplateRegistryIndexService,
    TemplateRegistryManager
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
                    "install-command-test",

                name:
                    "Install Command Test",

                version,

                description:
                    "Package install command test.",

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
                    "Install Command Test",

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
        `# Install Command Test ${version}`,
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-install-command-test"
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

    const archivePath =
        path.join(
            root,
            "install-command-test-1.0.0.zip"
        );

    await createTemplate(
        sourceTemplatePath,
        "1.0.0"
    );

    await createZip(
        sourceTemplatePath,
        archivePath
    );

    const archiveBytes =
        await fs.readFile(
            archivePath
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
                request,
                response
            ) => {

                if (
                    request.method !==
                        "GET" ||
                    request.url !==
                        "/install-command-test-1.0.0.zip"
                ) {

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

                    return;

                }

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
                "The temporary install-command package server did not start."
            );

        }

        const baseUrl =
            `http://127.0.0.1:${address.port}`;

        const packageUrl =
            `${baseUrl}/install-command-test-1.0.0.zip`;

        const store =
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

        const installationService =
            new TemplatePackageInstallationService(
                path.join(
                    root,
                    "installed-templates"
                ),
                preparationService,
                store
            );

        const manager =
            new TemplateRegistryManager(
                new TemplateRegistryIndexService(),
                new TemplatePackageSearchService(),
                store,
                installationService
            );

        const command =
            new PackageInstallCommand(
                manager
            );

        const formatter =
            new PackageCommandFormatter();

        const index:
            TemplateRegistryIndex = {

            generatedAt:
                new Date(
                    "2026-07-15T23:00:00.000Z"
                ),

            templates: [
                {
                    templateId:
                        "install-command-test",

                    name:
                        "Install Command Test",

                    description:
                        "Official install command package.",

                    registryId:
                        "official",

                    source:
                        baseUrl,

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
                },

                /*
                 * A second registry advertises the same ID
                 * so ambiguity behavior can be tested.
                 */
                {
                    templateId:
                        "install-command-test",

                    name:
                        "Internal Install Command Test",

                    description:
                        "Internal install command package.",

                    registryId:
                        "internal",

                    source:
                        "https://internal.example.com",

                    latestVersion:
                        "2.0.0",

                    versions: [
                        {
                            version:
                                "2.0.0",

                            downloadUrl:
                                "https://internal.example.com/install-command-test-2.0.0.zip",

                            archiveFormat:
                                "zip",

                            sha256:
                                "b".repeat(
                                    64
                                )
                        }
                    ]
                }
            ]
        };

        /*
         * Ambiguous package lookup.
         */
        let ambiguousThrown =
            false;

        try {

            await command.execute(
                index,
                "install-command-test"
            );

        } catch (error) {

            ambiguousThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "exists in multiple registries"
                ) ||
                !message.includes(
                    "internal"
                ) ||
                !message.includes(
                    "official"
                )
            ) {

                throw new Error(
                    `Unexpected ambiguity error: ${message}`
                );

            }

        }

        if (!ambiguousThrown) {

            throw new Error(
                "An ambiguous package installation was accepted."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            0
        ) {

            throw new Error(
                "The ambiguous installation performed a network request."
            );

        }

        /*
         * Install from the selected registry.
         */
        const installed =
            await command.execute(
                index,
                " INSTALL-COMMAND-TEST ",
                undefined,
                " OFFICIAL "
            );

        if (
            !installed.success
        ) {

            throw new Error(
                "The package install command reported failure."
            );

        }

        if (
            installed.package.templateId !==
            "install-command-test"
        ) {

            throw new Error(
                "The install command returned the wrong template ID."
            );

        }

        if (
            installed.package.version !==
            "1.0.0"
        ) {

            throw new Error(
                "The install command returned the wrong version."
            );

        }

        if (
            installed.message !==
            'Package "install-command-test" version "1.0.0" installed successfully.'
        ) {

            throw new Error(
                [
                    "The package install command message was incorrect.",
                    `Actual: ${installed.message}`
                ].join(" ")
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
                    "The install command made the wrong number of package requests.",
                    "Expected: 1",
                    `Actual: ${requestCount}`
                ].join(" ")
            );

        }

        if (
            !await pathExists(
                path.join(
                    installed.package.installPath,
                    "genesis.json"
                )
            )
        ) {

            throw new Error(
                "The install command did not create the permanent installation."
            );

        }

        const formatted =
            formatter.formatInstallation(
                installed
            );

        const expectedOutputValues = [
            'Package "install-command-test" version "1.0.0" installed successfully.',
            "Installed Package",
            "Template : install-command-test",
            "Version  : 1.0.0",
            `Path     : ${installed.package.installPath}`,
            `Source   : ${baseUrl}`,
            `SHA-256  : ${sha256}`
        ];

        for (
            const expected
            of expectedOutputValues
        ) {

            if (
                !formatted.includes(
                    expected
                )
            ) {

                throw new Error(
                    `The install-command output was missing: ${expected}`
                );

            }

        }

        /*
         * Reinstalling the same version uses the package cache.
         */
        const reinstalled =
            await command.execute(
                index,
                "install-command-test",
                "1.0.0",
                "official"
            );

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                "Reinstalling through the command downloaded the package again."
            );

        }

        if (
            reinstalled.package.installPath !==
            installed.package.installPath
        ) {

            throw new Error(
                "The command reinstall path changed unexpectedly."
            );

        }

        const persisted =
            await store.findById(
                "install-command-test"
            );

        if (
            persisted.length !==
            1
        ) {

            throw new Error(
                "The install command created duplicate installed-package records."
            );

        }

        /*
         * Unadvertised version.
         */
        let versionThrown =
            false;

        try {

            await command.execute(
                index,
                "install-command-test",
                "9.9.9",
                "official"
            );

        } catch (error) {

            versionThrown =
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
                    `Unexpected version-selection error: ${message}`
                );

            }

        }

        if (!versionThrown) {

            throw new Error(
                "An unadvertised version was installed by the command."
            );

        }

        /*
         * Missing package.
         */
        let missingThrown =
            false;

        try {

            await command.execute(
                index,
                "missing-package"
            );

        } catch (error) {

            missingThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                message !==
                'Package "missing-package" was not found.'
            ) {

                throw new Error(
                    `Unexpected missing-package error: ${message}`
                );

            }

        }

        if (!missingThrown) {

            throw new Error(
                "A missing package was accepted for installation."
            );

        }

        /*
         * Package missing from a selected registry.
         */
        let missingRegistryThrown =
            false;

        try {

            await command.execute(
                index,
                "install-command-test",
                undefined,
                "community"
            );

        } catch (error) {

            missingRegistryThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                message !==
                'Package "install-command-test" was not found in registry "community".'
            ) {

                throw new Error(
                    `Unexpected missing-registry error: ${message}`
                );

            }

        }

        if (!missingRegistryThrown) {

            throw new Error(
                "A package missing from the selected registry was accepted."
            );

        }

        /*
         * Empty package ID.
         */
        let emptyIdThrown =
            false;

        try {

            await command.execute(
                index,
                "   "
            );

        } catch (error) {

            emptyIdThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "Package template ID is required"
                )
            ) {

                throw new Error(
                    `Unexpected empty-ID error: ${message}`
                );

            }

        }

        if (!emptyIdThrown) {

            throw new Error(
                "An empty package installation ID was accepted."
            );

        }

        console.log(
            "Package install command selection verified."
        );

        console.log(
            "Package install command installation verified."
        );

        console.log(
            "Package install command formatting verified."
        );

        console.log(
            "Package install command cache reuse verified."
        );

        console.log(
            "Package install command validation verified."
        );

        console.log(
            "Package install command test completed successfully."
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
            "Package install command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);