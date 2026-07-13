import {
    RegistryTemplate
} from "./RegistryTemplate";

import {
    TemplateRegistry
} from "./TemplateRegistry";

/**
 * Describes a registry and the templates it advertises.
 *
 * This manifest contains lightweight metadata only.
 * It does not contain loaded TemplatePackage objects.
 */
export interface TemplateRegistryManifest {

    /**
     * Registry metadata.
     */
    registry:
        TemplateRegistry;

    /**
     * Templates advertised by the registry.
     */
    templates:
        readonly RegistryTemplate[];

}