import path from "path";

import {
    RegistryPublishEntry,
    RegistryPublishManifest
} from "../models";

export class RegistryPublishManifestBuilder {

    public create(
        registryId:
            string
    ): RegistryPublishManifest {

        return {
            registryId:
                this.normalizeIdentifier(
                    registryId,
                    "Registry ID"
                ),

            generatedAt:
                new Date(),

            packages: []
        };

    }

    public add(
        manifest:
            RegistryPublishManifest,

        entry:
            RegistryPublishEntry
    ): RegistryPublishManifest {

        const registryId =
            this.normalizeIdentifier(
                manifest.registryId,
                "Registry ID"
            );

        const normalizedEntry =
            this.normalizeEntry(
                entry
            );

        const packages =
            manifest.packages.filter(
                (existing) =>
                    !(
                        existing.templateId ===
                            normalizedEntry.templateId &&
                        existing.version ===
                            normalizedEntry.version
                    )
            );

        packages.push(
            normalizedEntry
        );

        packages.sort(
            (
                left,
                right
            ) => {

                const templateComparison =
                    left.templateId.localeCompare(
                        right.templateId
                    );

                if (
                    templateComparison !==
                    0
                ) {

                    return templateComparison;

                }

                return right.version.localeCompare(
                    left.version,
                    undefined,
                    {
                        numeric:
                            true
                    }
                );

            }
        );

        return {
            registryId,

            generatedAt:
                new Date(),

            packages
        };

    }

    public addMany(
        manifest:
            RegistryPublishManifest,

        entries:
            readonly RegistryPublishEntry[]
    ): RegistryPublishManifest {

        let current =
            manifest;

        for (
            const entry
            of entries
        ) {

            current =
                this.add(
                    current,
                    entry
                );

        }

        return current;

    }

    private normalizeEntry(
        entry:
            RegistryPublishEntry
    ): RegistryPublishEntry {

        const templateId =
            this.normalizeIdentifier(
                entry.templateId,
                "Template ID"
            );

        const version =
            this.normalizeIdentifier(
                entry.version,
                "Template version"
            );

        const packagePath =
            path.resolve(
                this.requireValue(
                    entry.packagePath,
                    "Package path"
                )
            );

        if (
            path.extname(
                packagePath
            ).toLowerCase() !==
            ".zip"
        ) {

            throw new Error(
                [
                    "Registry publish package must use the .zip extension:",
                    packagePath
                ].join(" ")
            );

        }

        const sha256 =
            this.normalizeSha256(
                entry.sha256
            );

        if (
            !(
                entry.publishedAt
                instanceof Date
            ) ||
            Number.isNaN(
                entry.publishedAt.getTime()
            )
        ) {

            throw new Error(
                "Registry publish entry requires a valid publishedAt date."
            );

        }

        return {
            templateId,

            version,

            packagePath,

            sha256,

            publishedAt:
                new Date(
                    entry.publishedAt
                )
        };

    }

    private normalizeIdentifier(
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
                    "Registry publish entry contains an invalid SHA-256:",
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