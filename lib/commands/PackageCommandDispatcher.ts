import {
    TemplateRegistryIndex,
    TemplateRegistryManifest
} from "../models";

import {
    PackageCommandFormatter,
    TemplateRegistryDiscoveryService,
    TemplateRegistryManager
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

        this.write(
            this.formatter.formatInfo(
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
            await this.installCommand.execute(
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
