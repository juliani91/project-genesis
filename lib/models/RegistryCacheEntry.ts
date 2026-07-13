import {
    TemplateRegistryManifest
} from "./TemplateRegistryManifest";

/**
 * Represents one registry manifest stored in the
 * local Project Genesis cache.
 */
export interface RegistryCacheEntry {

    /**
     * Registry identifier.
     */
    registryId: string;

    /**
     * Remote URL from which the manifest was retrieved.
     */
    sourceUrl: string;

    /**
     * Absolute path of the cached manifest file.
     */
    cachePath: string;

    /**
     * Timestamp at which the manifest was cached.
     */
    cachedAt: Date;

    /**
     * Cached registry manifest.
     */
    manifest:
        TemplateRegistryManifest;

}