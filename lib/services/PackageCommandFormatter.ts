import {
    InstalledPackageCommandResult,
    PackageInfoCommandResult,
    PackageInstallationCommandResult,
    PackageRemovalCommandResult,
    PackageSearchCommandResult,
    TemplatePublishingOutcome,
    TemplateRegistrySyncResult
} from "../models";

export class PackageCommandFormatter {

    public formatSearch(
        result:
            PackageSearchCommandResult
    ): string {

        const lines:
            string[] = [
                result.message
            ];

        if (
            result.results.length ===
            0
        ) {

            return lines.join(
                "\n"
            );

        }

        lines.push(
            "",
            "Available Packages",
            "------------------"
        );

        for (
            const searchResult
            of result.results
        ) {

            const template =
                searchResult.template;

            lines.push(
                [
                    template.templateId,
                    `v${template.latestVersion}`,
                    `(${template.registryId})`
                ].join(" ")
            );

            lines.push(
                `  Name        : ${template.name}`
            );

            lines.push(
                [
                    "  Description :",
                    template.description ??
                        "No description provided."
                ].join(" ")
            );

            lines.push(
                `  Source      : ${template.source}`
            );

            lines.push(
                `  Matched By  : ${searchResult.matchedBy.join(", ")}`
            );

        }

        return lines.join(
            "\n"
        );

    }

    public formatInstalled(
        result:
            InstalledPackageCommandResult
    ): string {

        const lines:
            string[] = [
                result.message
            ];

        if (
            result.packages.length ===
            0
        ) {

            return lines.join(
                "\n"
            );

        }

        lines.push(
            "",
            "Installed Packages",
            "------------------"
        );

        for (
            const installedPackage
            of result.packages
        ) {

            lines.push(
                [
                    installedPackage.templateId,
                    `v${installedPackage.version}`
                ].join(" ")
            );

            lines.push(
                `  Path      : ${installedPackage.installPath}`
            );

            lines.push(
                `  Source    : ${installedPackage.source}`
            );

            lines.push(
                `  Installed : ${installedPackage.installedAt.toISOString()}`
            );

        }

        return lines.join(
            "\n"
        );

    }

    public formatInstallation(
        result:
            PackageInstallationCommandResult
    ): string {

        const installedPackage =
            result.package;

        return [
            result.message,
            "",
            "Installed Package",
            "-----------------",
            `Template : ${installedPackage.templateId}`,
            `Version  : ${installedPackage.version}`,
            `Path     : ${installedPackage.installPath}`,
            `Source   : ${installedPackage.source}`,
            `SHA-256  : ${installedPackage.sha256}`
        ].join(
            "\n"
        );

    }

    public formatRemoval(
        result:
            PackageRemovalCommandResult
    ): string {

        if (
            !result.removed
        ) {

            return result.message;

        }

        return [
            result.message,
            "",
            "Removed Package",
            "---------------",
            `Template : ${result.removed.templateId}`,
            `Version  : ${result.removed.version}`,
            `Path     : ${result.removed.installPath}`
        ].join(
            "\n"
        );

    }

    public formatInfo(
        result:
            PackageInfoCommandResult
    ): string {

        if (
            result.localTemplate
        ) {

            return this.formatLocalTemplateInfo(
                result
            );

        }

        if (
            result.localProfile
        ) {

            return this.formatLocalProfileInfo(
                result
            );

        }

        if (
            !result.template
        ) {

            return result.message;

        }

        const template =
            result.template;

        const lines:
            string[] = [
                result.message,
                "",
                "Package Information",
                "-------------------",
                `Template    : ${template.templateId}`,
                `Name        : ${template.name}`,
                [
                    "Description :",
                    template.description ??
                        "No description provided."
                ].join(" "),
                `Registry    : ${template.registryId}`,
                `Source      : ${template.source}`,
                `Latest      : ${template.latestVersion}`,
                "",
                "Available Versions",
                "------------------"
            ];

        for (
            const version
            of template.versions
        ) {

            lines.push(
                `- ${version.version}`
            );

        }

        lines.push(
            "",
            "Installed Versions",
            "------------------"
        );

        if (
            result.installedVersions.length ===
            0
        ) {

            lines.push(
                "None"
            );

        } else {

            for (
                const installed
                of result.installedVersions
            ) {

                lines.push(
                    [
                        `- ${installed.version}`,
                        `(${installed.installPath})`
                    ].join(" ")
                );

            }

        }

        return lines.join(
            "\n"
        );

    }

    private formatLocalTemplateInfo(
        result:
            PackageInfoCommandResult
    ): string {

        const localTemplate =
            result.localTemplate;

        if (!localTemplate) {

            return result.message;

        }

        const manifest =
            localTemplate.manifest;

        const lines:
            string[] = [
                result.message,
                "",
                "Local Template Information",
                "--------------------------",
                `Template    : ${manifest.id}`,
                `Name        : ${manifest.name}`,
                `Description : ${manifest.description}`,
                `Version     : ${manifest.version}`,
                `Role        : ${manifest.role ?? "base"}`,
                `Category    : ${manifest.category ?? "Uncategorized"}`,
                `Author      : ${manifest.author}`,
                `Registry    : ${localTemplate.registryId}`,
                `Source      : ${localTemplate.source}`,
                `Path        : ${localTemplate.path}`,
                "",
                "Capabilities Provided",
                "---------------------"
            ];

        this.appendList(
            lines,
            manifest.provides
        );

        lines.push(
            "",
            "Capabilities Required",
            "---------------------"
        );

        this.appendList(
            lines,
            manifest.requiresCapabilities
        );

        lines.push(
            "",
            "Conflicts",
            "---------"
        );

        this.appendList(
            lines,
            manifest.conflictsWith
        );

        lines.push(
            "",
            "Tags",
            "----"
        );

        this.appendList(
            lines,
            manifest.tags
        );

        return lines.join(
            "\n"
        );

    }

    private formatLocalProfileInfo(
        result:
            PackageInfoCommandResult
    ): string {

        const localProfile =
            result.localProfile;

        if (!localProfile) {

            return result.message;

        }

        const profile =
            localProfile.profile;

        const lines:
            string[] = [
                result.message,
                "",
                "Local Profile Information",
                "-------------------------",
                `Profile     : ${profile.id}`,
                `Name        : ${profile.name}`,
                `Description : ${profile.description}`,
                `Category    : ${profile.category}`,
                `Source      : ${localProfile.source}`,
                `Base        : ${profile.baseTemplate}`,
                "",
                "Feature Templates",
                "-----------------"
            ];

        this.appendList(
            lines,
            profile.featureTemplates
        );

        return lines.join(
            "\n"
        );

    }

    private appendList(
        lines:
            string[],

        values:
            readonly string[] | undefined
    ): void {

        if (
            !values ||
            values.length ===
                0
        ) {

            lines.push(
                "None"
            );

            return;

        }

        for (
            const value
            of values
        ) {

            lines.push(
                `- ${value}`
            );

        }

    }

    public formatPublish(
        outcome:
            TemplatePublishingOutcome
    ): string {

        if (
            !outcome.result.success
        ) {

            return [
                "Package publishing failed.",
                "",
                `Template : ${outcome.result.templateId}`,
                `Version  : ${outcome.result.version}`,
                `Registry : ${outcome.result.registryId}`
            ].join(
                "\n"
            );

        }

        return [
            "Package published successfully.",
            "",
            "Published Package",
            "-----------------",
            `Template : ${outcome.entry.templateId}`,
            `Version  : ${outcome.entry.version}`,
            `Registry : ${outcome.manifest.registryId}`,
            `Package  : ${outcome.entry.packagePath}`,
            `SHA-256  : ${outcome.entry.sha256}`,
            `Published: ${outcome.entry.publishedAt.toISOString()}`,
            "",
            `Registry package entries: ${outcome.manifest.packages.length}`
        ].join(
            "\n"
        );

    }

    public formatSync(
        result:
            TemplateRegistrySyncResult
    ): string {

        const lines:
            string[] = [
                result.message
            ];

        if (
            result.synced.length ===
            0
        ) {

            return lines.join(
                "\n"
            );

        }

        lines.push(
            "",
            "Synchronized Registries",
            "-----------------------"
        );

        for (
            const entry
            of result.synced
        ) {

            lines.push(
                [
                    entry.registryName,
                    `(${entry.registryId})`
                ].join(" ")
            );

            lines.push(
                `  Source    : ${entry.source}`
            );

            lines.push(
                `  Templates : ${entry.templateCount}`
            );

            if (
                entry.cachePath
            ) {

                lines.push(
                    `  Cache     : ${entry.cachePath}`
                );

            }

            if (
                entry.cachedAt
            ) {

                lines.push(
                    `  Cached At : ${entry.cachedAt.toISOString()}`
                );

            }

        }

        return lines.join(
            "\n"
        );

    }

}
