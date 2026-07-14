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
    TemplateRegistryManifest
} from "../lib/models";

import {
    PackageCommandDispatcher,
    PackageInfoCommand,
    PackageInstallCommand,
    PackageListCommand,
    PackageSearchCommand,
    PackageUninstallCommand
} from "../lib/commands";

import {
    InstalledTemplatePackageStore,
    PackageCommandFormatter,
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackageInstallationService,
    TemplatePackagePreparationService,
    TemplatePackageRemovalService,
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
                    "cli-pipeline-test",

                name:
                    "CLI Pipeline Test",

                version:
                    "1.0.0",

                description:
                    "Sprint 25 CLI package pipeline test.",

                author:
                    "Project Genesis",

                category:
                    "Test",

                genesisVersion:
                    "0.19.0",

                tags: [
                    "cli",
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
                    "CLI Pipeline Test",

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
            [],
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
            "# CLI Pipeline Test",
            "",
            "Installed through PackageCommandDispatcher."
        ].join("\n"),
        "utf-8"
    );

}

function requireLastOutput(
    output:
        readonly string[]
): string {

    const value =
        output[
            output.length -
            1
        ];

    if (!value) {

        throw new Error(
            "The CLI dispatcher did not produce output."
        );

    }

    return value;

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-cli-pipeline-test"
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
            "cli-pipeline-test-1.0.0.zip"
        );

    await createTemplate(
        sourceTemplatePath
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

    let packageRequestCount =
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
                        "/packages/cli-pipeline-test-1.0.0.zip"
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

                packageRequestCount++;

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
                "The temporary CLI pipeline package server did not start."
            );

        }

        const baseUrl =
            `http://127.0.0.1:${address.port}`;

        const packageUrl =
            `${baseUrl}/packages/cli-pipeline-test-1.0.0.zip`;

        const manifests:
            TemplateRegistryManifest[] = [
            {
                registry: {
                    id:
                        "official",

                    name:
                        "Official Registry",

                    type:
                        "remote",

                    location:
                        baseUrl
                },

                templates: [
                    {
                        templateId:
                            "cli-pipeline-test",

                        version:
                            "1.0.0",

                        name:
                            "CLI Pipeline Test",

                        description:
                            "Sprint 25 CLI package pipeline test.",

                        downloadUrl:
                            packageUrl,

                        archiveFormat:
                            "zip",

                        sha256
                    },

                    {
                        templateId:
                            "react",

                        version:
                            "3.0.0",

                        name:
                            "React",

                        description:
                            "React application template.",

                        downloadUrl:
                            `${baseUrl}/packages/react-3.0.0.zip`,

                        archiveFormat:
                            "zip",

                        sha256:
                            "b".repeat(
                                64
                            )
                    }
                ]
            }
        ];

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

        const removalService =
            new TemplatePackageRemovalService(
                installationDirectory,
                installedStore
            );

        const manager =
            new TemplateRegistryManager(
                new TemplateRegistryIndexService(),
                new TemplatePackageSearchService(),
                installedStore,
                installationService,
                removalService
            );

        const formatter =
            new PackageCommandFormatter();

        const output:
            string[] = [];

        const dispatcher =
            new PackageCommandDispatcher(
                {
                    async discover() {

                        return manifests;

                    }
                },
                manager,
                formatter,
                new PackageSearchCommand(
                    manager
                ),
                new PackageListCommand(
                    manager
                ),
                new PackageInfoCommand(
                    manager
                ),
                new PackageInstallCommand(
                    manager
                ),
                new PackageUninstallCommand(
                    manager
                ),
                (value) => {

                    output.push(
                        value
                    );

                }
            );

        /*
         * Unknown commands must fall through to the
         * original interactive generation workflow.
         */
        const unknownHandled =
            await dispatcher.execute([
                "generate"
            ]);

        if (unknownHandled) {

            throw new Error(
                "The dispatcher handled an unknown package command."
            );

        }

        if (
            output.length !==
            0
        ) {

            throw new Error(
                "An unknown package command produced CLI output."
            );

        }

        console.log(
            "CLI fallback behavior verified."
        );

        /*
         * Search.
         */
        const searchHandled =
            await dispatcher.execute([
                "search",
                "cli",
                "pipeline"
            ]);

        if (!searchHandled) {

            throw new Error(
                "The CLI search command was not handled."
            );

        }

        const searchOutput =
            requireLastOutput(
                output
            );

        if (
            !searchOutput.includes(
                'Found 1 package matching "cli pipeline".'
            )
        ) {

            throw new Error(
                "The CLI search result message was incorrect."
            );

        }

        if (
            !searchOutput.includes(
                "cli-pipeline-test v1.0.0 (official)"
            )
        ) {

            throw new Error(
                "The CLI search output was missing the package."
            );

        }

        console.log(
            "CLI search pipeline verified."
        );

        /*
         * List before installation.
         */
        const emptyListHandled =
            await dispatcher.execute([
                "list"
            ]);

        if (!emptyListHandled) {

            throw new Error(
                "The CLI list command was not handled."
            );

        }

        if (
            requireLastOutput(
                output
            ) !==
            "No packages are installed."
        ) {

            throw new Error(
                "The empty CLI package list output was incorrect."
            );

        }

        console.log(
            "CLI empty-list pipeline verified."
        );

        /*
         * Package information before installation.
         */
        const infoHandled =
            await dispatcher.execute([
                "info",
                "cli-pipeline-test",
                "--registry",
                "official"
            ]);

        if (!infoHandled) {

            throw new Error(
                "The CLI info command was not handled."
            );

        }

        const infoOutput =
            requireLastOutput(
                output
            );

        const expectedInfoValues = [
            "Package Information",
            "Template    : cli-pipeline-test",
            "Registry    : official",
            "Latest      : 1.0.0",
            "Installed Versions",
            "None"
        ];

        for (
            const expected
            of expectedInfoValues
        ) {

            if (
                !infoOutput.includes(
                    expected
                )
            ) {

                throw new Error(
                    `The CLI info output was missing: ${expected}`
                );

            }

        }

        console.log(
            "CLI info pipeline verified."
        );

        /*
         * Install.
         */
        const installHandled =
            await dispatcher.execute([
                "install",
                "cli-pipeline-test",
                "--version",
                "1.0.0",
                "--registry",
                "official"
            ]);

        if (!installHandled) {

            throw new Error(
                "The CLI install command was not handled."
            );

        }

        const installOutput =
            requireLastOutput(
                output
            );

        const expectedInstallValues = [
            'Package "cli-pipeline-test" version "1.0.0" installed successfully.',
            "Installed Package",
            "Template : cli-pipeline-test",
            "Version  : 1.0.0",
            `Source   : ${baseUrl}`,
            `SHA-256  : ${sha256}`
        ];

        for (
            const expected
            of expectedInstallValues
        ) {

            if (
                !installOutput.includes(
                    expected
                )
            ) {

                throw new Error(
                    `The CLI install output was missing: ${expected}`
                );

            }

        }

        if (
            Number(
                packageRequestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The CLI install pipeline made the wrong number of requests.",
                    "Expected: 1",
                    `Actual: ${packageRequestCount}`
                ].join(" ")
            );

        }

        const installedPath =
            installationService.getInstallPath(
                "cli-pipeline-test",
                "1.0.0"
            );

        if (
            !await pathExists(
                path.join(
                    installedPath,
                    "genesis.json"
                )
            )
        ) {

            throw new Error(
                "The CLI install pipeline did not create the installation."
            );

        }

        console.log(
            "CLI install pipeline verified."
        );

        /*
         * List after installation.
         */
        await dispatcher.execute([
            "list"
        ]);

        const installedListOutput =
            requireLastOutput(
                output
            );

        if (
            !installedListOutput.includes(
                "Found 1 installed package."
            ) ||
            !installedListOutput.includes(
                "cli-pipeline-test v1.0.0"
            )
        ) {

            throw new Error(
                "The installed CLI package list output was incorrect."
            );

        }

        /*
         * Filtered list.
         */
        await dispatcher.execute([
            "list",
            "cli-pipeline-test"
        ]);

        const filteredListOutput =
            requireLastOutput(
                output
            );

        if (
            !filteredListOutput.includes(
                'Found 1 installed version of "cli-pipeline-test".'
            )
        ) {

            throw new Error(
                "The filtered CLI package list output was incorrect."
            );

        }

        console.log(
            "CLI installed-list pipeline verified."
        );

        /*
         * Info after installation.
         */
        await dispatcher.execute([
            "info",
            "cli-pipeline-test",
            "--registry",
            "official"
        ]);

        const installedInfoOutput =
            requireLastOutput(
                output
            );

        if (
            !installedInfoOutput.includes(
                "Installed Versions"
            ) ||
            !installedInfoOutput.includes(
                `- 1.0.0 (${installedPath})`
            )
        ) {

            throw new Error(
                "The CLI info output did not include the installed version."
            );

        }

        /*
         * Reinstall must use the package cache.
         */
        await dispatcher.execute([
            "install",
            "cli-pipeline-test",
            "--registry",
            "official"
        ]);

        if (
            Number(
                packageRequestCount
            ) !==
            1
        ) {

            throw new Error(
                "The CLI reinstall pipeline downloaded the package again."
            );

        }

        console.log(
            "CLI package-cache reuse verified."
        );

        /*
         * Uninstall.
         */
        const uninstallHandled =
            await dispatcher.execute([
                "uninstall",
                "cli-pipeline-test",
                "1.0.0"
            ]);

        if (!uninstallHandled) {

            throw new Error(
                "The CLI uninstall command was not handled."
            );

        }

        const uninstallOutput =
            requireLastOutput(
                output
            );

        const expectedUninstallValues = [
            'Package "cli-pipeline-test" version "1.0.0" was removed successfully.',
            "Removed Package",
            "Template : cli-pipeline-test",
            "Version  : 1.0.0",
            `Path     : ${installedPath}`
        ];

        for (
            const expected
            of expectedUninstallValues
        ) {

            if (
                !uninstallOutput.includes(
                    expected
                )
            ) {

                throw new Error(
                    `The CLI uninstall output was missing: ${expected}`
                );

            }

        }

        if (
            await pathExists(
                installedPath
            )
        ) {

            throw new Error(
                "The CLI uninstall pipeline did not remove the installation."
            );

        }

        const installedAfterRemoval =
            await manager.listInstalled();

        if (
            installedAfterRemoval.length !==
            0
        ) {

            throw new Error(
                "The CLI uninstall pipeline did not clear the installed store."
            );

        }

        console.log(
            "CLI uninstall pipeline verified."
        );

        /*
         * Missing uninstall returns a formatted failure.
         */
        process.exitCode =
            0;

        await dispatcher.execute([
            "remove",
            "cli-pipeline-test",
            "1.0.0"
        ]);

        const missingRemovalOutput =
            requireLastOutput(
                output
            );

        if (
            missingRemovalOutput !==
            'Package "cli-pipeline-test" version "1.0.0" is not installed.'
        ) {

            throw new Error(
                "The missing CLI uninstall output was incorrect."
            );

        }

        if (
            process.exitCode !==
            1
        ) {

            throw new Error(
                "The failed CLI uninstall did not set the process exit code."
            );

        }

        /*
         * Reset the exit code so the successful test process
         * does not finish with an error.
         */
        process.exitCode =
            0;

        console.log(
            "CLI missing-package behavior verified."
        );

        /*
         * Argument validation.
         */
        let missingFlagThrown =
            false;

        try {

            await dispatcher.execute([
                "install",
                "cli-pipeline-test",
                "--version"
            ]);

        } catch (error) {

            missingFlagThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                message !==
                "--version requires a value."
            ) {

                throw new Error(
                    `Unexpected missing-version-flag error: ${message}`
                );

            }

        }

        if (!missingFlagThrown) {

            throw new Error(
                "A CLI version flag without a value was accepted."
            );

        }

        let unknownArgumentThrown =
            false;

        try {

            await dispatcher.execute([
                "info",
                "cli-pipeline-test",
                "--unknown",
                "value"
            ]);

        } catch (error) {

            unknownArgumentThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "Unknown package command argument"
                )
            ) {

                throw new Error(
                    `Unexpected unknown-argument error: ${message}`
                );

            }

        }

        if (!unknownArgumentThrown) {

            throw new Error(
                "An unknown CLI package argument was accepted."
            );

        }

        console.log(
            "CLI argument validation verified."
        );

        console.log(
            "Package CLI pipeline test completed successfully."
        );

    } finally {

        process.exitCode =
            0;

        await closeServer(
            server
        );

    }

}

main().catch(
    (error: unknown) => {

        console.error(
            "Package CLI pipeline test failed.",
            error
        );

        process.exitCode =
            1;

    }
);