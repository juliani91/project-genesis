import {
    RegistryIndexTemplate
} from "./RegistryIndexTemplate";

/**
 * JSON-safe registry index.
 */
export interface SerializedTemplateRegistryIndex {

    generatedAt:
        string;

    templates:
        readonly RegistryIndexTemplate[];

}