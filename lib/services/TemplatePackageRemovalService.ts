import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage
} from "../models";

import {
    InstalledTemplatePackageStore
} from "./InstalledTemplatePackageStore";

export class TemplatePackageRemovalService {

    public constructor(
        private readonly installationDirectory:
            string = path.join(
                process.cwd(),
                ".genesis",
                "templates"
            ),

        private readonly installedStore:
            InstalledTemplatePackageStore =
            new InstalledTemplatePackageStore()
    ) {}

    public async remove(
        templateId:
            string,

        version:
            string
    ): Promise<
        InstalledTemplatePackage |
        undefined
    > {

        const normalizedTemplateId =
            this.normalizePathSegment(
                templateId,
                "Template ID"
            );

        const normalizedVersion =
            this.normalizePathSegment(
                version,
                "Template version"
            );

        const installed =
            await this.installedStore.findById(
                normalizedTemplateId
            );

        const installedPackage =
            installed.find(
                (entry) =>
                    entry.version ===
                    normalizedVersion
            );

        if (!installedPackage) {

            return undefined;

        }

        const expectedInstallPath =
            this.getInstallPath(
                normalizedTemplateId,
                normalizedVersion
            );

        const recordedInstallPath =
            path.resolve(
                installedPackage.installPath
            );

        if (
            recordedInstallPath !==
            expectedInstallPath
        ) {

            throw new Error(
                [
                    "Installed template path does not match the configured installation directory.",
                    `Expected: ${expectedInstallPath}`,
                    `Recorded: ${recordedInstallPath}`
                ].join(" ")
            );

        }

        this.assertInsideInstallationDirectory(
            recordedInstallPath
        );

        try {

            await fs.rm(
                recordedInstallPath,
                {
                    recursive:
                        true,

                    force:
                        true
                }
            );

        } catch (error) {

            throw new Error(
                [
                    `Unable to remove installed template "${normalizedTemplateId}"`,
                    `version "${normalizedVersion}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        const removed =
            await this.installedStore.remove(
                normalizedTemplateId,
                normalizedVersion
            );

        if (!removed) {

            throw new Error(
                [
                    `Installed template "${normalizedTemplateId}"`,
                    `version "${normalizedVersion}"`,
                    "was removed from disk but its store record could not be removed."
                ].join(" ")
            );

        }

        await this.removeEmptyParentDirectory(
            path.dirname(
                recordedInstallPath
            )
        );

        return installedPackage;

    }

    public getInstallPath(
        templateId:
            string,

        version:
            string
    ): string {

        const normalizedTemplateId =
            this.normalizePathSegment(
                templateId,
                "Template ID"
            );

        const normalizedVersion =
            this.normalizePathSegment(
                version,
                "Template version"
            );

        return path.resolve(
            this.installationDirectory,
            normalizedTemplateId,
            normalizedVersion
        );

    }

    private assertInsideInstallationDirectory(
        installPath:
            string
    ): void {

        const installationRoot =
            path.resolve(
                this.installationDirectory
            );

        const relative =
            path.relative(
                installationRoot,
                installPath
            );

        if (
            !relative ||
            relative.startsWith(
                ".."
            ) ||
            path.isAbsolute(
                relative
            )
        ) {

            throw new Error(
                [
                    "Refusing to remove a template outside the installation directory:",
                    installPath
                ].join(" ")
            );

        }

    }

    private async removeEmptyParentDirectory(
        templateDirectory:
            string
    ): Promise<void> {

        const installationRoot =
            path.resolve(
                this.installationDirectory
            );

        const resolvedTemplateDirectory =
            path.resolve(
                templateDirectory
            );

        const relative =
            path.relative(
                installationRoot,
                resolvedTemplateDirectory
            );

        if (
            !relative ||
            relative.startsWith(
                ".."
            ) ||
            path.isAbsolute(
                relative
            )
        ) {

            return;

        }

        let entries:
            string[];

        try {

            entries =
                await fs.readdir(
                    resolvedTemplateDirectory
                );

        } catch (error) {

            if (
                error instanceof Error &&
                "code" in error &&
                error.code ===
                    "ENOENT"
            ) {

                return;

            }

            throw error;

        }

        if (
            entries.length ===
            0
        ) {

            await fs.rmdir(
                resolvedTemplateDirectory
            );

        }

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

}