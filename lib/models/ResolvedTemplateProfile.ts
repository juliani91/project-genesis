import {
    TemplatePackage
} from "./TemplatePackage";

/**
 * A profile after template IDs have been resolved
 * into actual template packages.
 */
export interface ResolvedTemplateProfile {

    /**
     * Original profile definition.
     */
    profileId: string;

    /**
     * Selected base template.
     */
    baseTemplate: TemplatePackage;

    /**
     * Selected feature templates.
     */
    featureTemplates:
        readonly TemplatePackage[];

}