import {
    TemplateRegistryManifest,
    TemplateRegistrySyncEntry,
    TemplateRegistrySyncResult
} from "../models";

import {
    TemplateRegistryLoadService
} from "./TemplateRegistryLoadService";

import {
    TemplateRegistryResolver
} from "./TemplateRegistryResolver";

export class TemplateRegistrySyncService {

    public constructor(
        private readonly resolver:
            TemplateRegistryResolver =
            new TemplateRegistryResolver(),

        private readonly loadService:
            TemplateRegistryLoadService =
            new TemplateRegistryLoadService()
    ) {}

    public async sync(
        manifests:
            readonly TemplateRegistryManifest[],

        registryId?:
            string
    ): Promise<TemplateRegistrySyncResult> {

        const selectedManifests =
            this.selectManifests(
                manifests,
                registryId
            );

        const synced:
            TemplateRegistrySyncEntry[] = [];

        for (
            const manifest
            of selectedManifests
        ) {

            const registry =
                this.resolver.resolve(
                    manifest
                );

            const result =
                await this.loadService.load(
                    registry,
                    manifest
                );

            synced.push({
                registryId:
                    registry.id,

                registryName:
                    registry.name,

                source:
                    result.source,

                templateCount:
                    result.manifest.templates.length,

                cachePath:
                    result.cacheEntry
                        ?.cachePath,

                cachedAt:
                    result.cacheEntry
                        ?.cachedAt
            });

        }

        return {
            success:
                true,

            message:
                this.createMessage(
                    synced.length,
                    registryId
                ),

            synced
        };

    }

    private selectManifests(
        manifests:
            readonly TemplateRegistryManifest[],

        registryId?:
            string
    ): readonly TemplateRegistryManifest[] {

        const normalizedRegistryId =
            registryId
                ?.trim();

        if (!normalizedRegistryId) {

            return manifests;

        }

        const selected =
            manifests.filter(
                (manifest) =>
                    manifest.registry.id ===
                    normalizedRegistryId
            );

        if (
            selected.length ===
            0
        ) {

            throw new Error(
                [
                    "No template registry was found with ID:",
                    normalizedRegistryId
                ].join(" ")
            );

        }

        return selected;

    }

    private createMessage(
        syncCount:
            number,

        registryId?:
            string
    ): string {

        if (
            registryId
        ) {

            return `Synchronized registry "${registryId}".`;

        }

        return syncCount ===
            1
            ? "Synchronized 1 registry."
            : `Synchronized ${syncCount} registries.`;

    }

}
