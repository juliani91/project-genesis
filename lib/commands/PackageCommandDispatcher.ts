import {
    createHash
} from "crypto";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    LocalProfileInfo,
    LocalTemplateInfo,
    PackageInstallationCommandResult,
    TemplateRegistryIndex,
    TemplateRegistryManifest
} from "../models";

import {
    PackageCommandFormatter,
    InstalledTemplatePackageStore,
    TemplateDiscoveryService,
    TemplateProfileDiscoveryService,
    TemplateRegistryDiscoveryService,
    TemplateRegistryManager,
    TemplateRegistryResolver
} from "../services";

import {
    PackageInfoCommand
} from "./PackageInfoCommand";

import {
    PackageInstallCommand
} from "./PackageInstallCommand";

import {
    PackageListCommand
} from "./PackageListCommand";

import {
    PackagePublishCommand
} from "./PackagePublishCommand";

import {
    PackageSearchCommand
} from "./PackageSearchCommand";

import {
    PackageSyncCommand
} from "./PackageSyncCommand";

import {
    PackageUninstallCommand
} from "./PackageUninstallCommand";

/**
 * Minimal contract required for registry discovery.
 *
 * This allows tests to provide an isolated fake discovery
 * service without using the real registry configuration.
 */
interface TemplateRegistryManifestProvider {

    discover():
        Promise<
            readonly TemplateRegistryManifest[]
        >;

}

/**
 * Output function used by the dispatcher.
 *
 * The real CLI uses console.log. Tests can inject a function
 * that captures output without writing to the terminal.
 */
type PackageCommandOutputWriter =
    (
        output:
            string
    ) => void;

interface PackageSelectionArguments {

    templateId:
        string;

    version?:
        string;

    registryId?:
        string;

}

interface PackagePublishArguments {

    templateId:
        string;

    version:
        string;

    packagePath:
        string;

    registryId:
        string;

    manifestPath?:
        string;

}

export class PackageCommandDispatcher {

    private readonly registryDiscovery:
        TemplateRegistryManifestProvider;

    private readonly registryManager:
        TemplateRegistryManager;

    private readonly templateDiscovery:
        TemplateDiscoveryService;

    private readonly profileDiscovery:
        TemplateProfileDiscoveryService;

    private readonly registryResolver:
        TemplateRegistryResolver;

    private readonly installedStore:
        InstalledTemplatePackageStore;

    private readonly formatter:
        PackageCommandFormatter;

    private readonly searchCommand:
        PackageSearchCommand;

    private readonly listCommand:
        PackageListCommand;

    private readonly infoCommand:
        PackageInfoCommand;

    private readonly installCommand:
        PackageInstallCommand;

    private readonly uninstallCommand:
        PackageUninstallCommand;

    private readonly publishCommand:
        PackagePublishCommand;

    private readonly syncCommand:
        PackageSyncCommand;

    private readonly write:
        PackageCommandOutputWriter;

    public constructor(
        registryDiscovery?:
            TemplateRegistryManifestProvider,

        registryManager?:
            TemplateRegistryManager,

        formatter?:
            PackageCommandFormatter,

        searchCommand?:
            PackageSearchCommand,

        listCommand?:
            PackageListCommand,

        infoCommand?:
            PackageInfoCommand,

        installCommand?:
            PackageInstallCommand,

        uninstallCommand?:
            PackageUninstallCommand,

        write?:
            PackageCommandOutputWriter,

        /*
         * Added after the existing constructor parameters so
         * earlier tests using positional arguments remain valid.
         */
        publishCommand?:
            PackagePublishCommand,

        syncCommand?:
            PackageSyncCommand
    ) {

        this.registryDiscovery =
            registryDiscovery ??
            new TemplateRegistryDiscoveryService();

        this.registryManager =
            registryManager ??
            new TemplateRegistryManager();

        this.templateDiscovery =
            new TemplateDiscoveryService();

        this.profileDiscovery =
            new TemplateProfileDiscoveryService();

        this.registryResolver =
            new TemplateRegistryResolver();

        this.installedStore =
            new InstalledTemplatePackageStore();

        this.formatter =
            formatter ??
            new PackageCommandFormatter();

        this.searchCommand =
            searchCommand ??
            new PackageSearchCommand(
                this.registryManager
            );

        this.listCommand =
            listCommand ??
            new PackageListCommand(
                this.registryManager
            );

        this.infoCommand =
            infoCommand ??
            new PackageInfoCommand(
                this.registryManager
            );

        this.installCommand =
            installCommand ??
            new PackageInstallCommand(
                this.registryManager
            );

        this.uninstallCommand =
            uninstallCommand ??
            new PackageUninstallCommand(
                this.registryManager
            );

        this.write =
            write ??
            console.log;

        this.publishCommand =
            publishCommand ??
            new PackagePublishCommand();

        this.syncCommand =
            syncCommand ??
            new PackageSyncCommand();

    }

    /**
     * Executes a package-related command.
     *
     * Returns false when the arguments do not represent a
     * package command. genesis.ts can then continue into its
     * existing interactive generation workflow.
     */
    public async execute(
        args:
            readonly string[]
    ): Promise<boolean> {

        const command =
            args[0]
                ?.trim()
                .toLowerCase();

        if (
            !command ||
            !this.isPackageCommand(
                command
            )
        ) {

            return false;

        }

        const commandArguments =
            args.slice(
                1
            );

        switch (command) {

            case "search":

                await this.executeSearch(
                    commandArguments
                );

                return true;

            case "list":

                await this.executeList(
                    commandArguments
                );

                return true;

            case "info":

                await this.executeInfo(
                    commandArguments
                );

                return true;

            case "install":

                await this.executeInstall(
                    commandArguments
                );

                return true;

            case "uninstall":
            case "remove":

                await this.executeUninstall(
                    commandArguments
                );

                return true;

            case "publish":

                await this.executePublish(
                    commandArguments
                );

                return true;

            case "sync":

                await this.executeSync(
                    commandArguments
                );

                return true;

            default:

                return false;

        }

    }

    private async executeSearch(
        args:
            readonly string[]
    ): Promise<void> {

        const query =
            args
                .join(
                    " "
                )
                .trim();

        if (!query) {

            throw new Error(
                "Usage: genesis search <query>"
            );

        }

        const index =
            await this.loadIndex();

        const result =
            this.searchCommand.execute(
                index,
                query
            );

        this.write(
            this.formatter.formatSearch(
                result
            )
        );

    }

    private async executeList(
        args:
            readonly string[]
    ): Promise<void> {

        if (
            args.length >
            1
        ) {

            throw new Error(
                "Usage: genesis list [template-id]"
            );

        }

        const result =
            await this.listCommand.execute(
                args[0]
            );

        this.write(
            this.formatter.formatInstalled(
                result
            )
        );

    }

    private async executeInfo(
        args:
            readonly string[]
    ): Promise<void> {

        const parsed =
            this.parsePackageSelectionArguments(
                args,
                false
            );

        const index =
            await this.loadIndex();

        const result =
            await this.infoCommand.execute(
                index,
                parsed.templateId,
                parsed.registryId
            );

        const resolvedResult =
            result.success
                ? result
                : await this.resolveLocalTemplateInfo(
                    parsed.templateId,
                    parsed.registryId
                ) ??
                await this.resolveLocalProfileInfo(
                    parsed.templateId,
                    parsed.registryId
                ) ??
                result;

        this.write(
            this.formatter.formatInfo(
                resolvedResult
            )
        );

        if (
            !resolvedResult.success
        ) {

            process.exitCode =
                1;

        }

    }

    private async executeInstall(
        args:
            readonly string[]
    ): Promise<void> {

        const parsed =
            this.parsePackageSelectionArguments(
                args,
                true
            );

        const index =
            await this.loadIndex();

        const result =
            await this.executeInstallWithLocalFallback(
                index,
                parsed.templateId,
                parsed.version,
                parsed.registryId
            );

        this.write(
            this.formatter.formatInstallation(
                result
            )
        );

    }

    private async executeUninstall(
        args:
            readonly string[]
    ): Promise<void> {

        if (
            args.length !==
            2
        ) {

            throw new Error(
                "Usage: genesis uninstall <template-id> <version>"
            );

        }

        const templateId =
            args[0]
                ?.trim();

        const version =
            args[1]
                ?.trim();

        if (
            !templateId ||
            !version
        ) {

            throw new Error(
                "Usage: genesis uninstall <template-id> <version>"
            );

        }

        const result =
            await this.uninstallCommand.execute(
                templateId,
                version
            );

        this.write(
            this.formatter.formatRemoval(
                result
            )
        );

        if (
            !result.success
        ) {

            process.exitCode =
                1;

        }

    }

    private async executePublish(
        args:
            readonly string[]
    ): Promise<void> {

        const parsed =
            this.parsePublishArguments(
                args
            );

        const outcome =
            await this.publishCommand.execute({
                templateId:
                    parsed.templateId,

                version:
                    parsed.version,

                packagePath:
                    parsed.packagePath,

                registryId:
                    parsed.registryId,

                manifestPath:
                    parsed.manifestPath
            });

        this.write(
            this.formatter.formatPublish(
                outcome
            )
        );

        if (
            !outcome.result.success
        ) {

            process.exitCode =
                1;

        }

    }

    private async executeSync(
        args:
            readonly string[]
    ): Promise<void> {

        if (
            args.length >
            2
        ) {

            throw new Error(
                "Usage: genesis sync [--registry <registry-id>]"
            );

        }

        let registryId:
            string | undefined;

        if (
            args.length >
            0
        ) {

            if (
                args[0] !==
                "--registry"
            ) {

                throw new Error(
                    "Usage: genesis sync [--registry <registry-id>]"
                );

            }

            registryId =
                this.requireFlagValue(
                    args,
                    0,
                    "--registry"
                );

        }

        const manifests =
            await this.registryDiscovery
                .discover();

        const result =
            await this.syncCommand.execute(
                manifests,
                registryId
            );

        this.write(
            this.formatter.formatSync(
                result
            )
        );

    }

    private async loadIndex():
        Promise<TemplateRegistryIndex> {

        const manifests =
            await this.registryDiscovery
                .discover();

        if (
            manifests.length ===
            0
        ) {

            throw new Error(
                "No template registries were discovered."
            );

        }

        return this.registryManager.buildIndex(
            manifests
        );

    }

    private async executeInstallWithLocalFallback(
        index:
            TemplateRegistryIndex,

        templateId:
            string,

        version?:
            string,

        registryId?:
            string
    ): Promise<PackageInstallationCommandResult> {

        try {

            return await this.installCommand.execute(
                index,
                templateId,
                version,
                registryId
            );

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "was not found"
                )
            ) {

                throw error;

            }

            const localInfo =
                await this.resolveLocalTemplateInfo(
                    templateId,
                    registryId
                );

            if (
                !localInfo?.localTemplate
            ) {

                throw error;

            }

            return this.installLocalTemplate(
                localInfo.localTemplate,
                version
            );

        }

    }

    private async installLocalTemplate(
        template:
            LocalTemplateInfo,

        requestedVersion?:
            string
    ): Promise<PackageInstallationCommandResult> {

        const manifest =
            template.manifest;

        const version =
            requestedVersion
                ?.trim() ||
            manifest.version;

        if (
            version !==
            manifest.version
        ) {

            throw new Error(
                [
                    `Template "${manifest.id}"`,
                    `does not advertise version "${version}".`
                ].join(" ")
            );

        }

        const installPath =
            path.join(
                process.cwd(),
                ".genesis",
                "templates",
                this.normalizePathSegment(
                    manifest.id,
                    "Template ID"
                ),
                this.normalizePathSegment(
                    version,
                    "Template version"
                )
            );

        const temporaryPath =
            `${installPath}.tmp-${Date.now()}`;

        await fs.rm(
            temporaryPath,
            {
                recursive:
                    true,

                force:
                    true
            }
        );

        await fs.mkdir(
            path.dirname(
                installPath
            ),
            {
                recursive:
                    true
            }
        );

        try {

            await fs.cp(
                template.path,
                temporaryPath,
                {
                    recursive:
                        true,

                    force:
                        true,

                    errorOnExist:
                        false
                }
            );

            await fs.rm(
                installPath,
                {
                    recursive:
                        true,

                    force:
                        true
                }
            );

            await fs.rename(
                temporaryPath,
                installPath
            );

        } catch (error) {

            await fs.rm(
                temporaryPath,
                {
                    recursive:
                        true,

                    force:
                        true
                }
            );

            throw new Error(
                [
                    `Unable to install local template "${manifest.id}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        const installedPackage =
            await this.installedStore
                .install({
                    templateId:
                        manifest.id,

                    version,

                    installPath,

                    sha256:
                        this.hashLocalTemplateInfo(
                            template
                        ),

                    source:
                        template.source,

                    installedAt:
                        new Date()
                });

        return {
            success:
                true,

            message:
                [
                    `Package "${installedPackage.templateId}"`,
                    `version "${installedPackage.version}"`,
                    "installed successfully."
                ].join(" "),

            package:
                installedPackage
        };

    }

    private hashLocalTemplateInfo(
        template:
            LocalTemplateInfo
    ): string {

        return createHash(
            "sha256"
        )
            .update(
                JSON.stringify(
                    template.manifest
                )
            )
            .digest(
                "hex"
            );

    }

    private async resolveLocalTemplateInfo(
        templateId:
            string,

        registryId?:
            string
    ) {

        const normalizedTemplateId =
            templateId
                .trim()
                .toLowerCase();

        const normalizedRegistryId =
            registryId
                ?.trim()
                .toLowerCase();

        const manifests =
            await this.registryDiscovery
                .discover();

        const matches:
            LocalTemplateInfo[] = [];

        for (
            const manifest
            of manifests
        ) {

            const resolvedRegistry =
                this.registryResolver
                    .resolve(
                        manifest
                    );

            if (
                resolvedRegistry.type !==
                    "local"
            ) {

                continue;

            }

            if (
                normalizedRegistryId &&
                resolvedRegistry.id
                    .toLowerCase() !==
                    normalizedRegistryId
            ) {

                continue;

            }

            const advertised =
                resolvedRegistry.templates
                    .some(
                        (template) =>
                            template.templateId
                                .toLowerCase() ===
                            normalizedTemplateId
                    );

            if (!advertised) {

                continue;

            }

            const templates =
                await this.templateDiscovery
                    .discoverFromRegistry(
                        resolvedRegistry
                    );

            const template =
                templates.find(
                    (candidate) =>
                        candidate.manifest.id
                            .toLowerCase() ===
                        normalizedTemplateId
                );

            if (!template) {

                continue;

            }

            matches.push({
                manifest:
                    template.manifest,

                registryId:
                    resolvedRegistry.id,

                source:
                    resolvedRegistry.resolvedLocation,

                path:
                    template.path
            });

        }

        if (
            matches.length ===
            0
        ) {

            return undefined;

        }

        if (
            matches.length >
            1
        ) {

            const registries =
                matches
                    .map(
                        (match) =>
                            match.registryId
                    )
                    .sort()
                    .join(
                        ", "
                    );

            return {
                success:
                    false,

                message:
                    [
                        `Template "${templateId.trim()}"`,
                        "exists in multiple local registries.",
                        `Specify one of: ${registries}.`
                    ].join(" "),

                installedVersions:
                    []
            };

        }

        const localTemplate =
            matches[0];

        if (!localTemplate) {

            return undefined;

        }

        return {
            success:
                true,

            message:
                `Template information for "${localTemplate.manifest.id}".`,

            localTemplate,

            installedVersions:
                []
        };

    }

    private async resolveLocalProfileInfo(
        profileId:
            string,

        registryId?:
            string
    ) {

        if (
            registryId?.trim()
        ) {

            return undefined;

        }

        const normalizedProfileId =
            profileId
                .trim()
                .toLowerCase();

        const profiles =
            await this.profileDiscovery
                .discover();

        const matches:
            LocalProfileInfo[] =
            profiles
                .filter(
                    (profile) =>
                        profile.id
                            .toLowerCase() ===
                        normalizedProfileId
                )
                .map(
                    (profile) => ({
                        profile,
                        source:
                            "profiles"
                    })
                );

        if (
            matches.length ===
            0
        ) {

            return undefined;

        }

        const localProfile =
            matches[0];

        if (!localProfile) {

            return undefined;

        }

        return {
            success:
                true,

            message:
                `Profile information for "${localProfile.profile.id}".`,

            localProfile,

            installedVersions:
                []
        };

    }

    private parsePackageSelectionArguments(
        args:
            readonly string[],

        allowVersion:
            boolean
    ): PackageSelectionArguments {

        const templateId =
            args[0]
                ?.trim();

        if (!templateId) {

            throw new Error(
                allowVersion
                    ? [
                        "Usage:",
                        "genesis install <template-id>",
                        "[--version <version>]",
                        "[--registry <registry-id>]"
                    ].join(" ")
                    : [
                        "Usage:",
                        "genesis info <template-id>",
                        "[--registry <registry-id>]"
                    ].join(" ")
            );

        }

        let version:
            string | undefined;

        let registryId:
            string | undefined;

        let argumentIndex =
            1;

        while (
            argumentIndex <
            args.length
        ) {

            const argument =
                args[
                    argumentIndex
                ];

            if (
                argument ===
                "--registry"
            ) {

                registryId =
                    this.requireFlagValue(
                        args,
                        argumentIndex,
                        "--registry"
                    );

                argumentIndex +=
                    2;

                continue;

            }

            if (
                allowVersion &&
                argument ===
                    "--version"
            ) {

                version =
                    this.requireFlagValue(
                        args,
                        argumentIndex,
                        "--version"
                    );

                argumentIndex +=
                    2;

                continue;

            }

            throw new Error(
                [
                    "Unknown package command argument:",
                    String(
                        argument
                    )
                ].join(" ")
            );

        }

        return {
            templateId,
            version,
            registryId
        };

    }

    private parsePublishArguments(
        args:
            readonly string[]
    ): PackagePublishArguments {

        const usage =
            [
                "Usage:",
                "genesis publish <template-id>",
                "--version <version>",
                "--package <zip-path>",
                "--registry <registry-id>",
                "[--manifest <manifest-path>]"
            ].join(" ");

        const templateId =
            args[0]
                ?.trim();

        if (!templateId) {

            throw new Error(
                usage
            );

        }

        let version:
            string | undefined;

        let packagePath:
            string | undefined;

        let registryId:
            string | undefined;

        let manifestPath:
            string | undefined;

        let argumentIndex =
            1;

        while (
            argumentIndex <
            args.length
        ) {

            const argument =
                args[
                    argumentIndex
                ];

            switch (argument) {

                case "--version":

                    version =
                        this.requireFlagValue(
                            args,
                            argumentIndex,
                            "--version"
                        );

                    argumentIndex +=
                        2;

                    break;

                case "--package":

                    packagePath =
                        this.requireFlagValue(
                            args,
                            argumentIndex,
                            "--package"
                        );

                    argumentIndex +=
                        2;

                    break;

                case "--registry":

                    registryId =
                        this.requireFlagValue(
                            args,
                            argumentIndex,
                            "--registry"
                        );

                    argumentIndex +=
                        2;

                    break;

                case "--manifest":

                    manifestPath =
                        this.requireFlagValue(
                            args,
                            argumentIndex,
                            "--manifest"
                        );

                    argumentIndex +=
                        2;

                    break;

                default:

                    throw new Error(
                        [
                            "Unknown publish command argument:",
                            String(
                                argument
                            )
                        ].join(" ")
                    );

            }

        }

        if (
            !version ||
            !packagePath ||
            !registryId
        ) {

            throw new Error(
                usage
            );

        }

        return {
            templateId,
            version,
            packagePath,
            registryId,
            manifestPath
        };

    }

    private normalizePathSegment(
        value:
            string,

        label:
            string
    ): string {

        const normalized =
            value
                .trim()
                .toLowerCase();

        if (!normalized) {

            throw new Error(
                `${label} is required.`
            );

        }

        if (
            !/^[a-z0-9._-]+$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    `${label} contains unsupported characters:`,
                    value
                ].join(" ")
            );

        }

        return normalized;

    }

    private requireFlagValue(
        args:
            readonly string[],

        flagIndex:
            number,

        flag:
            string
    ): string {

        const value =
            args[
                flagIndex +
                1
            ]
                ?.trim();

        if (!value) {

            throw new Error(
                `${flag} requires a value.`
            );

        }

        return value;

    }

    private isPackageCommand(
        command:
            string
    ): boolean {

        return [
            "search",
            "list",
            "info",
            "install",
            "uninstall",
            "remove",
            "publish",
            "sync"
        ].includes(
            command
        );

    }

}
