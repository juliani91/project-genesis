import { promises as fs } from "fs";
import path from "path";

import {
    RegistryCacheEntry,
    RegistryCacheResult,
    RemoteRegistryResponse,
    SerializedRegistryCacheEntry,
    TemplateRegistryManifest
} from "../models";

export class TemplateRegistryCacheService {

    public constructor(
        private readonly cacheDirectory:
            string = path.join(
                process.cwd(),
                ".cache",
                "registries"
            )
    ) {}

    public async write(
        response:
            RemoteRegistryResponse
    ): Promise<RegistryCacheEntry> {

        const registryId =
            this.normalizeRegistryId(
                response
                    .manifest
                    .registry
                    .id
            );

        const cachePath =
            this.getCachePath(
                registryId
            );

        const temporaryPath =
            `${cachePath}.tmp`;

        const entry:
            RegistryCacheEntry = {

            registryId,

            sourceUrl:
                response.sourceUrl,

            cachePath,

            cachedAt:
                response.retrievedAt,

            manifest:
                response.manifest
        };

        const serialized =
            this.serialize(
                entry
            );

        await fs.mkdir(
            this.cacheDirectory,
            {
                recursive: true
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

            /*
             * Rename only after the complete temporary file
             * has been written successfully.
             */
            await fs.rename(
                temporaryPath,
                cachePath
            );

        } catch (error) {

            /*
             * Clean up an incomplete temporary file without
             * touching a previously valid cache entry.
             */
            await fs.rm(
                temporaryPath,
                {
                    force: true
                }
            );

            throw error;

        }

        return entry;

    }

    public async read(
        registryId:
            string
    ): Promise<RegistryCacheResult> {

        const normalizedId =
            this.normalizeRegistryId(
                registryId
            );

        const cachePath =
            this.getCachePath(
                normalizedId
            );

        let contents:
            string;

        try {

            contents =
                await fs.readFile(
                    cachePath,
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
                    status:
                        "missing"
                };

            }

            throw error;

        }

        let serialized:
            SerializedRegistryCacheEntry;

        try {

            serialized =
                JSON.parse(
                    contents
                ) as SerializedRegistryCacheEntry;

        } catch {

            throw new Error(
                [
                    `Cached registry "${normalizedId}"`,
                    "contains invalid JSON."
                ].join(" ")
            );

        }

        const entry =
            this.deserialize(
                serialized,
                cachePath
            );

        return {
            status:
                "fresh",

            entry
        };

    }

    public getCachePath(
        registryId:
            string
    ): string {

        const normalizedId =
            this.normalizeRegistryId(
                registryId
            );

        return path.join(
            this.cacheDirectory,
            `${normalizedId}.json`
        );

    }

    private serialize(
        entry:
            RegistryCacheEntry
    ): SerializedRegistryCacheEntry {

        return {
            registryId:
                entry.registryId,

            sourceUrl:
                entry.sourceUrl,

            cachePath:
                entry.cachePath,

            cachedAt:
                entry.cachedAt
                    .toISOString(),

            manifest:
                entry.manifest
        };

    }

    private deserialize(
        serialized:
            SerializedRegistryCacheEntry,

        actualCachePath:
            string
    ): RegistryCacheEntry {

        const registryId =
            this.normalizeRegistryId(
                serialized.registryId
            );

        if (
            serialized.manifest
                .registry
                .id !==
            registryId
        ) {

            throw new Error(
                [
                    `Cached registry "${registryId}"`,
                    "contains a manifest with a different registry ID."
                ].join(" ")
            );

        }

        const cachedAt =
            new Date(
                serialized.cachedAt
            );

        if (
            Number.isNaN(
                cachedAt.getTime()
            )
        ) {

            throw new Error(
                [
                    `Cached registry "${registryId}"`,
                    "contains an invalid cachedAt timestamp."
                ].join(" ")
            );

        }

        return {
            registryId,

            sourceUrl:
                serialized.sourceUrl,

            /*
             * Trust the actual location that was read rather
             * than a potentially stale stored path.
             */
            cachePath:
                actualCachePath,

            cachedAt,

            manifest:
                serialized.manifest
        };

    }

    private normalizeRegistryId(
        registryId:
            string
    ): string {

        const normalized =
            registryId
                .trim()
                .toLowerCase();

        if (!normalized) {

            throw new Error(
                "Registry cache ID is required."
            );

        }

        if (
            !/^[a-z0-9._-]+$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    "Registry cache ID contains unsupported characters:",
                    registryId
                ].join(" ")
            );

        }

        return normalized;

    }

}