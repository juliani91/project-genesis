import {
    TemplateRegistryManifest
} from "./TemplateRegistryManifest";

/**
 * JSON-safe representation of RegistryCacheEntry.
 */
export interface SerializedRegistryCacheEntry {

    registryId: string;

    sourceUrl: string;

    cachePath: string;

    /**
     * ISO-8601 timestamp.
     */
    cachedAt: string;

    manifest:
        TemplateRegistryManifest;

}