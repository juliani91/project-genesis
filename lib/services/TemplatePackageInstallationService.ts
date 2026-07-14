import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage,
    RegistryIndexTemplate,
    RegistryIndexTemplateVersion,
    RegistryTemplate
} from "../models";

import {
    InstalledTemplatePackageStore
} from "./InstalledTemplatePackageStore";

import {
    TemplatePackagePreparationService
} from "./TemplatePackagePreparationService";

export class TemplatePackageInstallationService {

    public constructor(
        private readonly installationDirectory:
            string = path.join(
                process.cwd(),
                ".genesis",
                "templates"
            ),

        private readonly preparationService:
            TemplatePackagePreparationService =
            new TemplatePackagePreparationService(),

        private readonly installedStore:
            InstalledTemplatePackageStore =
            new InstalledTemplatePackageStore()
    ) {}

    public async install(
        template:
            RegistryIndexTemplate,

        requestedVersion?:
            string
    ): Promise<InstalledTemplatePackage> {

        const selectedVersion =
            this.selectVersion(
                template,
                requestedVersion
            );

        const sha256 =
            this.requireSha256(
                template.templateId,
                selectedVersion
            );

        const registryTemplate:
            RegistryTemplate = {

            templateId:
                template.templateId,

            version:
                selectedVersion.version,

            name:
                template.name,

            description:
                template.description,

            downloadUrl:
                selectedVersion.downloadUrl,

            archiveFormat:
                selectedVersion.archiveFormat,

            sha256
        };

        /*
         * This performs download, checksum verification,
         * extraction, cache reuse, and template discovery.
         */
        const preparedTemplate =
            await this.preparationService.prepare(
                registryTemplate
            );

        const installPath =
            this.getInstallPath(
                template.templateId,
                selectedVersion.version
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
                preparedTemplate.path,
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

            await this.validateCopiedTemplate(
                temporaryPath,
                template.templateId,
                selectedVersion.version
            );

            /*
             * Replace the final installation only after
             * the temporary copy is complete and valid.
             */
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
                    `Unable to install template "${template.templateId}"`,
                    `version "${selectedVersion.version}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        const installedPackage:
            InstalledTemplatePackage = {

            templateId:
                template.templateId,

            version:
                selectedVersion.version,

            installPath,

            sha256,

            source:
                template.source,

            installedAt:
                new Date()
        };

        try {

            return await this.installedStore.install(
                installedPackage
            );

        } catch (error) {

            /*
             * Do not leave an untracked installation if
             * the metadata store cannot be updated.
             */
            await fs.rm(
                installPath,
                {
                    recursive:
                        true,

                    force:
                        true
                }
            );

            throw new Error(
                [
                    `Unable to record installed template "${template.templateId}"`,
                    `version "${selectedVersion.version}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

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

        return path.join(
            this.installationDirectory,
            normalizedTemplateId,
            normalizedVersion
        );

    }

    private selectVersion(
        template:
            RegistryIndexTemplate,

        requestedVersion?:
            string
    ): RegistryIndexTemplateVersion {

        const version =
            requestedVersion
                ?.trim() ||
            template.latestVersion;

        if (!version) {

            throw new Error(
                [
                    `Template "${template.templateId}"`,
                    "does not advertise a version."
                ].join(" ")
            );

        }

        const selected =
            template.versions.find(
                (candidate) =>
                    candidate.version ===
                    version
            );

        if (!selected) {

            throw new Error(
                [
                    `Template "${template.templateId}"`,
                    `does not advertise version "${version}".`
                ].join(" ")
            );

        }

        return selected;

    }

    private requireSha256(
        templateId:
            string,

        version:
            RegistryIndexTemplateVersion
    ): string {

        const normalized =
            version.sha256
                ?.trim()
                .toLowerCase();

        if (!normalized) {

            throw new Error(
                [
                    `Template "${templateId}"`,
                    `version "${version.version}"`,
                    "does not provide a SHA-256 checksum."
                ].join(" ")
            );

        }

        if (
            !/^[a-f0-9]{64}$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    `Template "${templateId}"`,
                    `version "${version.version}"`,
                    "provides an invalid SHA-256 checksum."
                ].join(" ")
            );

        }

        return normalized;

    }

    private async validateCopiedTemplate(
        installPath:
            string,

        expectedTemplateId:
            string,

        expectedVersion:
            string
    ): Promise<void> {

        const manifestPath =
            path.join(
                installPath,
                "genesis.json"
            );

        let contents:
            string;

        try {

            contents =
                await fs.readFile(
                    manifestPath,
                    "utf-8"
                );

        } catch {

            throw new Error(
                [
                    "Installed template is missing genesis.json:",
                    manifestPath
                ].join(" ")
            );

        }

        let manifest:
            {
                id?:
                    unknown;

                version?:
                    unknown;
            };

        try {

            manifest =
                JSON.parse(
                    contents
                ) as {
                    id?:
                        unknown;

                    version?:
                        unknown;
                };

        } catch {

            throw new Error(
                [
                    "Installed template manifest contains invalid JSON:",
                    manifestPath
                ].join(" ")
            );

        }

        if (
            manifest.id !==
            expectedTemplateId
        ) {

            throw new Error(
                [
                    "Installed template ID mismatch.",
                    `Expected "${expectedTemplateId}",`,
                    `but received "${String(manifest.id)}".`
                ].join(" ")
            );

        }

        if (
            manifest.version !==
            expectedVersion
        ) {

            throw new Error(
                [
                    "Installed template version mismatch.",
                    `Expected "${expectedVersion}",`,
                    `but received "${String(manifest.version)}".`
                ].join(" ")
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