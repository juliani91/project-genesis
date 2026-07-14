import {
    RegistryIndexTemplateVersion
} from "./RegistryIndexTemplateVersion";

/**
 * Searchable registry entry containing all advertised
 * versions of one template.
 */
export interface RegistryIndexTemplate {

    templateId: string;

    name: string;

    description?: string;

    /**
     * Registry identifier that supplied this entry.
     */
    registryId: string;

    /**
     * Registry location or source URL.
     */
    source: string;

    /**
     * Latest available version according to the index.
     */
    latestVersion: string;

    /**
     * Available versions.
     */
    versions:
        readonly RegistryIndexTemplateVersion[];

}