import {
    PreparationResult,
    TemplatePackage
} from "../models";

import { TemplateValidator } from "../validators";

import { TemplatePackageService } from "./TemplatePackageService";
import { VariableCollectionService } from "./VariableCollectionService";

export class PreparationService {

    public async prepare(
        template: TemplatePackage
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
                validator.validate(enrichedTemplate);

            if (validationErrors.length > 0) {

                return {
                    success: false,
                    errors: validationErrors
                };

            }

            const variableCollectionService =
                new VariableCollectionService();

            const variables =
                variableCollectionService.collect(
                    enrichedTemplate
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

}