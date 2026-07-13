import {
    RegistryTemplate
} from "./RegistryTemplate";

import {
    RegistryType
} from "./RegistryType";

export interface ResolvedTemplateRegistry {

    /**
     * Unique registry identifier.
     */
    id: string;

    /**
     * Human-readable registry name.
     */
    name: string;

    /**
     * Registry implementation type.
     */
    type: RegistryType;

    /**
     * Absolute local path or validated remote URL.
     */
    resolvedLocation: string;

    /**
     * Optional registry description.
     */
    description?: string;

    /**
     * Templates advertised by the registry.
     */
    templates:
        readonly RegistryTemplate[];

}