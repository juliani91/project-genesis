import {
    RegistryCacheEntry
} from "./RegistryCacheEntry";

import {
    RegistryCacheStatus
} from "./RegistryCacheStatus";

/**
 * Result of attempting to locate a registry cache entry.
 */
export interface RegistryCacheResult {

    status:
        RegistryCacheStatus;

    /**
     * Present when a cached registry was found.
     */
    entry?:
        RegistryCacheEntry;

}