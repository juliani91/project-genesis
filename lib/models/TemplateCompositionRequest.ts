import { TemplatePackage } from "./TemplatePackage";

export interface TemplateCompositionRequest {

    /**
     * Primary template that defines the project foundation.
     */
    baseTemplate: TemplatePackage;

    /**
     * Optional feature templates added to the base project.
     */
    featureTemplates:
        readonly TemplatePackage[];

}