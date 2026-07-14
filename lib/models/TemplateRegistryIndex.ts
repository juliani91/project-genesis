import {
    RegistryIndexTemplate
} from "./RegistryIndexTemplate";

/**
 * Searchable index assembled from one or more registries.
 */
export interface TemplateRegistryIndex {

    generatedAt:
        Date;

    templates:
        readonly RegistryIndexTemplate[];

}