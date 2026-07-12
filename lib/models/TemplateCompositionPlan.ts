import { TemplatePackage } from "./TemplatePackage";

export interface TemplateCompositionPlan {

    /**
     * Base template selected for the project.
     */
    baseTemplate: TemplatePackage;

    /**
     * Feature templates selected for the project.
     */
    featureTemplates:
        readonly TemplatePackage[];

    /**
     * Templates in deterministic merge order.
     *
     * Order:
     *
     * base
     * feature 1
     * feature 2
     * ...
     */
    orderedTemplates:
        readonly TemplatePackage[];

}