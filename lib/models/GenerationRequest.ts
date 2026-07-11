import { TemplatePackage } from "./TemplatePackage";
import { WizardAnswer } from "./WizardAnswer";

export interface GenerationRequest {
    /**
     * Template package selected for generation.
     */
    template: TemplatePackage;

    /**
     * Answers collected by the interactive wizard.
     */
    answers: readonly WizardAnswer[];

    /**
     * Absolute output directory for the generated project.
     */
    outputPath: string;
}