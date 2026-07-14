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
    RegistryIndexTemplate,
    TemplateRegistryManifest
} from "../lib/models";

import {
    InstalledTemplatePackageStore,
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
                    "lifecycle-test",

                name:
                    "Lifecycle Test",

                version:
                    "1.0.0",

                description:
                    "Template installation lifecycle pipeline test.",

                author:
                    "Project Genesis",

                category:
                    "Test",

                genesisVersion:
                    "0.19.0",

                tags: [
                    "install",
                    "remove",
                    "lifecycle"
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
                    "Lifecycle Test",

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
            "# Lifecycle Test",
            "",
            "Installed and removed through the Sprint 24 lifecycle pipeline."
        ].join("\n"),
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-installation-lifecycle-pipeline-test"
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
            "lifecycle-test-1.0.0.zip"
        );

    await createTemplate(
        sourceTemplatePath
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
                        "/packages/lifecycle-test-1.0.0.zip"
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
                "The temporary lifecycle package server did not start."
            );

        }

        const baseUrl =
            `http://127.0.0.1:${address.port}`;

        const packageUrl =
            `${baseUrl}/packages/lifecycle-test-1.0.0.zip`;

        const installedStore =
            new InstalledTemplatePackageStore(
                path.join(
                    root,
                    "installed-store",
                    "packages.json"
                )
            );

        const manager =
            new TemplateRegistryManager(
                new TemplateRegistryIndexService(),
                new TemplatePackageSearchService(),
                installedStore
            );

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

        const packageCacheService =
            new TemplatePackageCacheService(
                packageCacheDirectory,
                templateCacheDirectory
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
                            "lifecycle-test",

                        version:
                            "1.0.0",

                        name:
                            "Lifecycle Test",

                        description:
                            "Template installation lifecycle pipeline test.",

                        downloadUrl:
                            packageUrl,

                        archiveFormat:
                            "zip",

                        sha256
                    }
                ]
            }
        ];

        /*
         * Build the registry index and search for the package.
         */
        const index =
            manager.buildIndex(
                manifests
            );

        if (
            index.templates.length !==
            1
        ) {

            throw new Error(
                [
                    "The lifecycle registry index contained the wrong number of templates.",
                    "Expected: 1",
                    `Actual: ${index.templates.length}`
                ].join(" ")
            );

        }

        const searchResults =
            manager.search(
                index,
                "lifecycle"
            );

        if (
            searchResults.length !==
            1
        ) {

            throw new Error(
                [
                    "The lifecycle registry search returned the wrong number of results.",
                    "Expected: 1",
                    `Actual: ${searchResults.length}`
                ].join(" ")
            );

        }

        const searchResult =
            searchResults[0];

        if (!searchResult) {

            throw new Error(
                "The lifecycle registry search result was missing."
            );

        }

        if (
            searchResult.template.templateId !==
            "lifecycle-test"
        ) {

            throw new Error(
                "The lifecycle registry search returned the wrong template."
            );

        }

        console.log(
            "Registry search verified."
        );

        /*
         * Install the searched package.
         */
        const indexedTemplate:
            RegistryIndexTemplate =
            searchResult.template;

        const installed =
            await installationService.install(
                indexedTemplate
            );

        if (
            installed.templateId !==
            "lifecycle-test"
        ) {

            throw new Error(
                "The installed lifecycle template ID was incorrect."
            );

        }

        if (
            installed.version !==
            "1.0.0"
        ) {

            throw new Error(
                "The installed lifecycle template version was incorrect."
            );

        }

        if (
            installed.sha256 !==
            sha256
        ) {

            throw new Error(
                "The installed lifecycle template SHA-256 was incorrect."
            );

        }

        if (
            Number(
                packageRequestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The lifecycle installation made the wrong number of package requests.",
                    "Expected: 1",
                    `Actual: ${packageRequestCount}`
                ].join(" ")
            );

        }

        const installedManifestPath =
            path.join(
                installed.installPath,
                "genesis.json"
            );

        const installedReadmePath =
            path.join(
                installed.installPath,
                "files",
                "README.md"
            );

        if (
            !await pathExists(
                installedManifestPath
            )
        ) {

            throw new Error(
                "The installed lifecycle template manifest was missing."
            );

        }

        if (
            !await pathExists(
                installedReadmePath
            )
        ) {

            throw new Error(
                "The installed lifecycle template README was missing."
            );

        }

        const installedReadme =
            await fs.readFile(
                installedReadmePath,
                "utf-8"
            );

        if (
            !installedReadme.includes(
                "Installed and removed through the Sprint 24 lifecycle pipeline."
            )
        ) {

            throw new Error(
                "The installed lifecycle README contents were incorrect."
            );

        }

        console.log(
            "Package installation verified."
        );

        /*
         * Confirm installed-package persistence through the manager.
         */
        const installedPackages =
            await manager.listInstalled();

        if (
            installedPackages.length !==
            1
        ) {

            throw new Error(
                [
                    "The lifecycle installed-package list contained the wrong number of records.",
                    "Expected: 1",
                    `Actual: ${installedPackages.length}`
                ].join(" ")
            );

        }

        if (
            installedPackages[0]
                ?.installPath !==
            installed.installPath
        ) {

            throw new Error(
                "The lifecycle installed-package record path was incorrect."
            );

        }

        const installedVersions =
            await manager.findInstalled(
                "lifecycle-test"
            );

        if (
            installedVersions.length !==
                1 ||
            installedVersions[0]
                ?.version !==
                "1.0.0"
        ) {

            throw new Error(
                "The lifecycle installed-package lookup was incorrect."
            );

        }

        console.log(
            "Installed package persistence verified."
        );

        /*
         * Record the reusable cache paths before removal.
         */
        const cachedArchivePath =
            path.join(
                packageCacheDirectory,
                "lifecycle-test",
                "1.0.0",
                "package.zip"
            );

        const cachedTemplatePath =
            packageCacheService.getTemplatePath(
                "lifecycle-test",
                "1.0.0"
            );

        const cachedManifestPath =
            path.join(
                cachedTemplatePath,
                "genesis.json"
            );

        if (
            !await pathExists(
                cachedArchivePath
            )
        ) {

            throw new Error(
                "The lifecycle package archive cache was not created."
            );

        }

        if (
            !await pathExists(
                cachedManifestPath
            )
        ) {

            throw new Error(
                "The lifecycle extracted template cache was not created."
            );

        }

        /*
         * Remove the installed package.
         */
        const removed =
            await removalService.remove(
                "lifecycle-test",
                "1.0.0"
            );

        if (!removed) {

            throw new Error(
                "The lifecycle installed package was not removed."
            );

        }

        if (
            removed.installPath !==
            installed.installPath
        ) {

            throw new Error(
                "The removed lifecycle package path was incorrect."
            );

        }

        if (
            await pathExists(
                installed.installPath
            )
        ) {

            throw new Error(
                "The lifecycle installation directory still exists after removal."
            );

        }

        const afterRemoval =
            await manager.listInstalled();

        if (
            afterRemoval.length !==
            0
        ) {

            throw new Error(
                "The lifecycle installed-package store was not empty after removal."
            );

        }

        const missingInstalledVersions =
            await manager.findInstalled(
                "lifecycle-test"
            );

        if (
            missingInstalledVersions.length !==
            0
        ) {

            throw new Error(
                "The removed lifecycle package remained in installed-package lookup."
            );

        }

        console.log(
            "Package removal verified."
        );

        /*
         * Uninstalling must preserve reusable cache data.
         */
        if (
            !await pathExists(
                cachedArchivePath
            )
        ) {

            throw new Error(
                "Package removal deleted the reusable archive cache."
            );

        }

        if (
            !await pathExists(
                cachedManifestPath
            )
        ) {

            throw new Error(
                "Package removal deleted the reusable extracted-template cache."
            );

        }

        /*
         * Prove the preserved cache is usable without another
         * network request by reinstalling the same package.
         */
        const reinstalled =
            await installationService.install(
                indexedTemplate
            );

        if (
            Number(
                packageRequestCount
            ) !==
            1
        ) {

            throw new Error(
                "Reinstallation did not reuse the preserved package cache."
            );

        }

        if (
            !await pathExists(
                reinstalled.installPath
            )
        ) {

            throw new Error(
                "The lifecycle package was not reinstalled from cache."
            );

        }

        /*
         * Remove the reinstalled package so the test ends
         * with a clean installed-package state.
         */
        const finalRemoval =
            await removalService.remove(
                "lifecycle-test",
                "1.0.0"
            );

        if (!finalRemoval) {

            throw new Error(
                "The reinstalled lifecycle package was not removed."
            );

        }

        const finalInstalled =
            await manager.listInstalled();

        if (
            finalInstalled.length !==
            0
        ) {

            throw new Error(
                "The lifecycle test did not finish with an empty installed-package store."
            );

        }

        console.log(
            "Package cache preservation verified."
        );

        console.log(
            "Template installation lifecycle pipeline test completed successfully."
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
            "Template installation lifecycle pipeline test failed.",
            error
        );

        process.exitCode =
            1;

    }
);