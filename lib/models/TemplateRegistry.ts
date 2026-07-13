import {
    RegistryType
} from "./RegistryType";

export interface TemplateRegistry {

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
     * Local filesystem path or remote URL.
     */
    location: string;

    /**
     * Optional registry description.
     */
    description?: string;

}