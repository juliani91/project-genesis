import {
    PreparationResult,
    TemplatePackage,
    VariableCollection,
    Wizard,
    WizardAnswer
} from "../models";

import { TemplateValidator } from "../validators";
import { ComputedVariableService } from "./ComputedVariableService";

import { TemplatePackageService } from "./TemplatePackageService";
import { VariableCollectionBuilder } from "./VariableCollectionBuilder";
import { VariableCollectionService } from "./VariableCollectionService";
import { WizardRuntime } from "./WizardRuntime";

export class PreparationService {

    public async prepare(
        template: TemplatePackage,
        answers?: readonly WizardAnswer[]
    ): Promise<PreparationResult> {

        try {

            const templatePackageService =
                new TemplatePackageService();

            let enrichedTemplate =
                await templatePackageService.enrichWithWizard(
                    template
                );

            enrichedTemplate =
                await templatePackageService.enrichWithFolders(
                    enrichedTemplate
                );

            enrichedTemplate =
                await templatePackageService.enrichWithFiles(
                    enrichedTemplate
                );

            const validator =
                new TemplateValidator();

            const validationErrors =
                validator.validate(
                    enrichedTemplate
                );

            if (validationErrors.length > 0) {

                return {
                    success: false,
                    errors: validationErrors
                };

            }

            const wizard =
                enrichedTemplate.descriptors.wizard;

            if (!wizard) {

                return {
                    success: false,
                    errors: [
                        "Wizard descriptor has not been loaded."
                    ]
                };

            }

            const variables =
                answers
                    ? this.buildVariablesFromAnswers(
                        wizard,
                        answers
                    )
                    : new VariableCollectionService()
                        .collect(enrichedTemplate);
            const computedVariableService =
                    new ComputedVariableService();

                computedVariableService.apply(
                    variables
                );

            return {
                success: true,

                template: {
                    template: enrichedTemplate,
                    variables,
                    preparedAt: new Date()
                },

                errors: []
            };

        } catch (error) {

            return {
                success: false,

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown preparation error."
                ]
            };

        }

    }
private buildVariablesFromAnswers(
    wizard: Wizard,
    answers: readonly WizardAnswer[]
): VariableCollection {

    const runtime =
        new WizardRuntime();

    const session =
        runtime.execute(
            wizard,
            answers
        );

    const builder =
        new VariableCollectionBuilder();

    return builder.build(session);

}

}