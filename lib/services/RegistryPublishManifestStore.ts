import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryPublishEntry,
    RegistryPublishManifest,
    SerializedRegistryPublishEntry,
    SerializedRegistryPublishManifest
} from "../models";

import {
    RegistryPublishManifestBuilder
} from "./RegistryPublishManifestBuilder";

export class RegistryPublishManifestStore {

    private readonly registryId:
        string;

    private readonly manifestPath:
        string;

    public constructor(
        registryId:
            string,

        manifestPath?:
            string,

        private readonly manifestBuilder:
            RegistryPublishManifestBuilder =
            new RegistryPublishManifestBuilder()
    ) {

        this.registryId =
            this.normalizeIdentifier(
                registryId,
                "Registry ID"
            );

        this.manifestPath =
            path.resolve(
                manifestPath ??
                path.join(
                    process.cwd(),
                    ".genesis",
                    "publish",
                    this.registryId,
                    "publish-manifest.json"
                )
            );

    }

    public async read():
        Promise<RegistryPublishManifest> {

        let contents:
            string;

        try {

            contents =
                await fs.readFile(
                    this.manifestPath,
                    "utf-8"
                );

        } catch (error) {

            if (
                this.isNodeErrorCode(
                    error,
                    "ENOENT"
                )
            ) {

                return this.manifestBuilder.create(
                    this.registryId
                );

            }

            throw new Error(
                [
                    "Unable to read registry publish manifest:",
                    this.manifestPath,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        let serialized:
            unknown;

        try {

            serialized =
                JSON.parse(
                    contents
                );

        } catch {

            throw new Error(
                [
                    "Registry publish manifest contains invalid JSON:",
                    this.manifestPath
                ].join(" ")
            );

        }

        return this.deserialize(
            serialized
        );

    }

    public async write(
        manifest:
            RegistryPublishManifest
    ): Promise<void> {

        const normalizedManifest =
            this.normalizeManifest(
                manifest
            );

        const serialized =
            this.serialize(
                normalizedManifest
            );

        const directory =
            path.dirname(
                this.manifestPath
            );

        const temporaryPath =
            `${this.manifestPath}.${process.pid}.${Date.now()}.tmp`;

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
                this.manifestPath,
                {
                    force:
                        true
                }
            );

            await fs.rename(
                temporaryPath,
                this.manifestPath
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
                    "Unable to write registry publish manifest:",
                    this.manifestPath,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

    }

    public async update(
        entry:
            RegistryPublishEntry
    ): Promise<RegistryPublishManifest> {

        const current =
            await this.read();

        const updated =
            this.manifestBuilder.add(
                current,
                entry
            );

        await this.write(
            updated
        );

        return updated;

    }

    public getManifestPath():
        string {

        return this.manifestPath;

    }

    private serialize(
        manifest:
            RegistryPublishManifest
    ): SerializedRegistryPublishManifest {

        return {
            registryId:
                manifest.registryId,

            generatedAt:
                manifest.generatedAt
                    .toISOString(),

            packages:
                manifest.packages.map(
                    (entry) =>
                        this.serializeEntry(
                            entry
                        )
                )
        };

    }

    private serializeEntry(
        entry:
            RegistryPublishEntry
    ): SerializedRegistryPublishEntry {

        return {
            templateId:
                entry.templateId,

            version:
                entry.version,

            packagePath:
                entry.packagePath,

            sha256:
                entry.sha256,

            publishedAt:
                entry.publishedAt
                    .toISOString()
        };

    }

    private deserialize(
        value:
            unknown
    ): RegistryPublishManifest {

        if (
            !value ||
            typeof value !==
                "object"
        ) {

            throw new Error(
                "Registry publish manifest has an invalid structure."
            );

        }

        const candidate =
            value as Partial<
                SerializedRegistryPublishManifest
            >;

        if (
            typeof candidate.registryId !==
                "string" ||
            !candidate.registryId.trim()
        ) {

            throw new Error(
                "Registry publish manifest is missing registryId."
            );

        }

        const registryId =
            this.normalizeIdentifier(
                candidate.registryId,
                "Registry ID"
            );

        if (
            registryId !==
            this.registryId
        ) {

            throw new Error(
                [
                    "Registry publish manifest belongs to a different registry.",
                    `Expected: ${this.registryId}`,
                    `Actual: ${registryId}`
                ].join(" ")
            );

        }

        const generatedAt =
            this.parseDate(
                candidate.generatedAt,
                "Registry publish manifest generatedAt"
            );

        if (
            !Array.isArray(
                candidate.packages
            )
        ) {

            throw new Error(
                "Registry publish manifest packages must be an array."
            );

        }

        const packages =
            candidate.packages.map(
                (
                    entry,
                    index
                ) =>
                    this.deserializeEntry(
                        entry,
                        index
                    )
            );

        return this.normalizeManifest({
            registryId,

            generatedAt,

            packages
        });

    }

    private deserializeEntry(
        value:
            unknown,

        index:
            number
    ): RegistryPublishEntry {

        if (
            !value ||
            typeof value !==
                "object"
        ) {

            throw new Error(
                `Registry publish manifest package entry ${index} is invalid.`
            );

        }

        const candidate =
            value as Partial<
                SerializedRegistryPublishEntry
            >;

        if (
            typeof candidate.templateId !==
            "string"
        ) {

            throw new Error(
                `Registry publish manifest package entry ${index} is missing templateId.`
            );

        }

        if (
            typeof candidate.version !==
            "string"
        ) {

            throw new Error(
                `Registry publish manifest package entry ${index} is missing version.`
            );

        }

        if (
            typeof candidate.packagePath !==
            "string"
        ) {

            throw new Error(
                `Registry publish manifest package entry ${index} is missing packagePath.`
            );

        }

        if (
            typeof candidate.sha256 !==
            "string"
        ) {

            throw new Error(
                `Registry publish manifest package entry ${index} is missing sha256.`
            );

        }

        return {
            templateId:
                candidate.templateId,

            version:
                candidate.version,

            packagePath:
                candidate.packagePath,

            sha256:
                candidate.sha256,

            publishedAt:
                this.parseDate(
                    candidate.publishedAt,
                    `Registry publish package entry ${index} publishedAt`
                )
        };

    }

    private normalizeManifest(
        manifest:
            RegistryPublishManifest
    ): RegistryPublishManifest {

        const registryId =
            this.normalizeIdentifier(
                manifest.registryId,
                "Registry ID"
            );

        if (
            registryId !==
            this.registryId
        ) {

            throw new Error(
                [
                    "Cannot store a publish manifest for another registry.",
                    `Expected: ${this.registryId}`,
                    `Actual: ${registryId}`
                ].join(" ")
            );

        }

        if (
            !(
                manifest.generatedAt
                instanceof Date
            ) ||
            Number.isNaN(
                manifest.generatedAt.getTime()
            )
        ) {

            throw new Error(
                "Registry publish manifest requires a valid generatedAt date."
            );

        }

        return this.manifestBuilder.addMany(
            {
                registryId,

                generatedAt:
                    new Date(
                        manifest.generatedAt
                    ),

                packages:
                    []
            },
            manifest.packages
        );

    }

    private parseDate(
        value:
            unknown,

        label:
            string
    ): Date {

        if (
            typeof value !==
            "string"
        ) {

            throw new Error(
                `${label} is required.`
            );

        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            throw new Error(
                `${label} is invalid.`
            );

        }

        return date;

    }

    private normalizeIdentifier(
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

    private isNodeErrorCode(
        error:
            unknown,

        expectedCode:
            string
    ): boolean {

        return (
            error instanceof Error &&
            "code" in error &&
            error.code ===
                expectedCode
        );

    }

}