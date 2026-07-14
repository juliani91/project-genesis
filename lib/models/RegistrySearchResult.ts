import {
    RegistryIndexTemplate
} from "./RegistryIndexTemplate";

/**
 * One registry-search match.
 */
export interface RegistrySearchResult {

    template:
        RegistryIndexTemplate;

    /**
     * Lower values represent stronger matches.
     */
    rank:
        number;

    /**
     * Explains why the result matched.
     */
    matchedBy:
        readonly (
            | "id"
            | "name"
            | "description"
        )[];

}