import {
    RegistryCacheEntry
} from "./RegistryCacheEntry";

import {
    TemplateRegistryManifest
} from "./TemplateRegistryManifest";

export type RemoteRegistryLoadSource =
    | "local"
    | "network"
    | "cache";

export interface RemoteRegistryLoadResult {

    /**
     * Indicates whether the manifest came from the
     * network or the local cache.
     */
    source:
        RemoteRegistryLoadSource;

    /**
     * Loaded registry manifest.
     */
    manifest:
        TemplateRegistryManifest;

    /**
     * Present when a cache entry was used or created.
     */
    cacheEntry?:
        RegistryCacheEntry;

}