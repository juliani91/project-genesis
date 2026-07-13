import {
    TemplateRegistryManifest
} from "./TemplateRegistryManifest";

/**
 * Represents a successfully retrieved remote registry
 * response before it is written to the local cache.
 */
export interface RemoteRegistryResponse {

    /**
     * Final response URL after redirects.
     */
    sourceUrl: string;

    /**
     * HTTP status code.
     */
    statusCode: number;

    /**
     * Time at which the response was received.
     */
    retrievedAt: Date;

    /**
     * Parsed registry manifest.
     */
    manifest:
        TemplateRegistryManifest;

}