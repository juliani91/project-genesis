import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplateCollection,
    InstalledTemplatePackage,
    SerializedInstalledTemplateCollection,
    SerializedInstalledTemplatePackage
} from "../models";

export class InstalledTemplatePackageStore {

    public constructor(
        private readonly storePath:
            string = path.join(
                process.cwd(),
                ".genesis",
                "installed-templates.json"
            )
    ) {}

    public async read():
        Promise<InstalledTemplateCollection> {

        let contents:
            string;

        try {

            contents =
                await fs.readFile(
                    this.storePath,
                    "utf-8"
                );

        } catch (error) {

            if (
                error instanceof Error &&
                "code" in error &&
                error.code ===
                    "ENOENT"
            ) {

                return {
                    packages: []
                };

            }

            throw error;

        }

        let serialized:
            SerializedInstalledTemplateCollection;

        try {

            serialized =
                JSON.parse(
                    contents
                ) as SerializedInstalledTemplateCollection;

        } catch {

            throw new Error(
                [
                    "Installed template package store contains invalid JSON:",
                    this.storePath
                ].join(" ")
            );

        }

        if (
            !serialized ||
            !Array.isArray(
                serialized.packages
            )
        ) {

            throw new Error(
                [
                    "Installed template package store has an invalid structure:",
                    this.storePath
                ].join(" ")
            );

        }

        return {
            packages:
                serialized.packages.map(
                    (entry) =>
                        this.deserialize(
                            entry
                        )
                )
        };

    }

    public async write(
        collection:
            InstalledTemplateCollection
    ): Promise<void> {

        const directory =
            path.dirname(
                this.storePath
            );

        const temporaryPath =
            `${this.storePath}.tmp`;

        const normalizedPackages =
            collection.packages.map(
                (entry) =>
                    this.normalizePackage(
                        entry
                    )
            );

        const serialized:
            SerializedInstalledTemplateCollection = {

            packages:
                normalizedPackages.map(
                    (entry) =>
                        this.serialize(
                            entry
                        )
                )

        };

        await fs.mkdir(
            directory,
            {
                recursive:
                    true
            }
        );

        try {

            await fs.writeFile(
                temporaryPath,
                JSON.stringify(
                    serialized,
                    null,
                    2
                ),
                "utf-8"
            );

            await fs.rm(
                this.storePath,
                {
                    force:
                        true
                }
            );

            await fs.rename(
                temporaryPath,
                this.storePath
            );

        } catch (error) {

            await fs.rm(
                temporaryPath,
                {
                    force:
                        true
                }
            );

            throw new Error(
                [
                    "Unable to write installed template package store:",
                    this.storePath,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

    }

    public async install(
        installedPackage:
            InstalledTemplatePackage
    ): Promise<InstalledTemplatePackage> {

        const normalized =
            this.normalizePackage(
                installedPackage
            );

        const collection =
            await this.read();

        const packages =
            collection.packages.filter(
                (entry) =>
                    !(
                        entry.templateId ===
                            normalized.templateId &&
                        entry.version ===
                            normalized.version
                    )
            );

        packages.push(
            normalized
        );

        packages.sort(
            (
                left,
                right
            ) => {

                const idComparison =
                    left.templateId.localeCompare(
                        right.templateId
                    );

                if (
                    idComparison !==
                    0
                ) {

                    return idComparison;

                }

                return left.version.localeCompare(
                    right.version
                );

            }
        );

        await this.write({
            packages
        });

        return normalized;

    }

    public async remove(
        templateId:
            string,

        version:
            string
    ): Promise<boolean> {

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

        const collection =
            await this.read();

        const packages =
            collection.packages.filter(
                (entry) =>
                    !(
                        entry.templateId ===
                            normalizedTemplateId &&
                        entry.version ===
                            normalizedVersion
                    )
            );

        if (
            packages.length ===
            collection.packages.length
        ) {

            return false;

        }

        await this.write({
            packages
        });

        return true;

    }

    public async findById(
        templateId:
            string
    ): Promise<InstalledTemplatePackage[]> {

        const normalizedTemplateId =
            this.normalizePathSegment(
                templateId,
                "Template ID"
            );

        const collection =
            await this.read();

        return collection.packages.filter(
            (entry) =>
                entry.templateId ===
                normalizedTemplateId
        );

    }

    public getStorePath(): string {

        return this.storePath;

    }

    private serialize(
        installedPackage:
            InstalledTemplatePackage
    ): SerializedInstalledTemplatePackage {

        return {
            templateId:
                installedPackage.templateId,

            version:
                installedPackage.version,

            installPath:
                installedPackage.installPath,

            sha256:
                installedPackage.sha256,

            source:
                installedPackage.source,

            installedAt:
                installedPackage
                    .installedAt
                    .toISOString()
        };

    }

    private deserialize(
        serialized:
            SerializedInstalledTemplatePackage
    ): InstalledTemplatePackage {

        if (
            !serialized ||
            typeof serialized !==
                "object"
        ) {

            throw new Error(
                "Installed template package entry is invalid."
            );

        }

        const installedAt =
            new Date(
                serialized.installedAt
            );

        if (
            Number.isNaN(
                installedAt.getTime()
            )
        ) {

            throw new Error(
                [
                    "Installed template package contains an invalid installedAt timestamp:",
                    serialized.templateId
                ].join(" ")
            );

        }

        return this.normalizePackage({
            templateId:
                serialized.templateId,

            version:
                serialized.version,

            installPath:
                serialized.installPath,

            sha256:
                serialized.sha256,

            source:
                serialized.source,

            installedAt
        });

    }

    private normalizePackage(
        installedPackage:
            InstalledTemplatePackage
    ): InstalledTemplatePackage {

        const templateId =
            this.normalizePathSegment(
                installedPackage.templateId,
                "Template ID"
            );

        const version =
            this.normalizePathSegment(
                installedPackage.version,
                "Template version"
            );

        const installPath =
            path.resolve(
                this.requireValue(
                    installedPackage.installPath,
                    "Install path"
                )
            );

        const sha256 =
            this.normalizeSha256(
                installedPackage.sha256
            );

        const source =
            this.requireValue(
                installedPackage.source,
                "Package source"
            );

        if (
            !(
                installedPackage.installedAt
                instanceof Date
            ) ||
            Number.isNaN(
                installedPackage
                    .installedAt
                    .getTime()
            )
        ) {

            throw new Error(
                "Installed template package requires a valid installedAt date."
            );

        }

        return {
            templateId,

            version,

            installPath,

            sha256,

            source,

            installedAt:
                installedPackage.installedAt
        };

    }

    private normalizePathSegment(
        value:
            string,

        label:
            string
    ): string {

        const normalized =
            this.requireValue(
                value,
                label
            )
                .toLowerCase();

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

    private normalizeSha256(
        value:
            string
    ): string {

        const normalized =
            this.requireValue(
                value,
                "Package SHA-256"
            )
                .toLowerCase();

        if (
            !/^[a-f0-9]{64}$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    "Installed template package contains an invalid SHA-256:",
                    value
                ].join(" ")
            );

        }

        return normalized;

    }

    private requireValue(
        value:
            string,

        label:
            string
    ): string {

        if (
            typeof value !==
            "string"
        ) {

            throw new Error(
                `${label} is required.`
            );

        }

        const normalized =
            value.trim();

        if (!normalized) {

            throw new Error(
                `${label} is required.`
            );

        }

        return normalized;

    }

}