import {
    RemoteRegistryLoadResult,
    ResolvedTemplateRegistry,
    TemplateRegistryManifest
} from "../models";

import {
    TemplateRegistryCacheService
} from "./TemplateRegistryCacheService";

import {
    TemplateRegistryHttpClient
} from "./TemplateRegistryHttpClient";

export class TemplateRegistryLoadService {

    public constructor(
        private readonly cacheService:
            TemplateRegistryCacheService =
            new TemplateRegistryCacheService(),

        private readonly httpClient:
            TemplateRegistryHttpClient =
            new TemplateRegistryHttpClient()
    ) {}

    public async load(
        registry:
            ResolvedTemplateRegistry,

        localManifest?:
            TemplateRegistryManifest
    ): Promise<RemoteRegistryLoadResult> {

        if (
            registry.type ===
            "local"
        ) {

            if (!localManifest) {

                throw new Error(
                    [
                        `Local registry "${registry.id}"`,
                        "requires its discovered registry manifest."
                    ].join(" ")
                );

            }

            if (
                localManifest.registry.id !==
                registry.id
            ) {

                throw new Error(
                    [
                        `Local registry ID mismatch.`,
                        `Expected "${registry.id}",`,
                        `but received "${localManifest.registry.id}".`
                    ].join(" ")
                );

            }

            return {
                source:
                    "local",

                manifest:
                    localManifest
            };

        }

        try {

            const response =
                await this.httpClient
                    .fetchManifest(
                        registry
                            .resolvedLocation
                    );

            const manifest =
                response.manifest;

            this.validateRemoteManifest(
                registry,
                manifest
            );

            const cacheEntry =
                await this.cacheService.write(
                    response
                );

            return {
                source:
                    "network",

                manifest,

                cacheEntry
            };

        } catch (networkError) {

            const cached =
                await this.cacheService.read(
                    registry.id
                );

            if (
                cached.status !==
                    "missing" &&
                cached.entry
            ) {

                this.validateRemoteManifest(
                    registry,
                    cached.entry.manifest
                );

                return {
                    source:
                        "cache",

                    manifest:
                        cached.entry.manifest,

                    cacheEntry:
                        cached.entry
                };

            }

            throw networkError;

        }

    }

    private validateRemoteManifest(
        registry:
            ResolvedTemplateRegistry,

        manifest:
            TemplateRegistryManifest
    ): void {

        if (
            manifest.registry.id !==
            registry.id
        ) {

            throw new Error(
                [
                    "Remote registry ID mismatch.",
                    `Expected "${registry.id}",`,
                    `but received "${manifest.registry.id}".`
                ].join(" ")
            );

        }

        if (
            manifest.registry.type !==
            "remote"
        ) {

            throw new Error(
                [
                    `Remote registry "${registry.id}"`,
                    "returned a manifest that is not marked as remote."
                ].join(" ")
            );

        }

    }

}