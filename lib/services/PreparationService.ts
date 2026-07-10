import {
    TemplatePackage,
    PreparationResult
} from "../models";
import { TemplatePackageService } from "./TemplatePackageService";
import { TemplateValidator } from "../validators/TemplateValidator";
import { VariableCollectionService } from "./VariableCollectionService";

export class PreparationService {

async prepare(
    template: TemplatePackage
): Promise<PreparationResult> {

    try {

        // Step 1 - Enrich the template
        const templatePackageService =
            new TemplatePackageService();

        const enrichedTemplate =
            await templatePackageService.enrichWithWizard(template);

        // Step 2 - Validate the enriched template
        const validator = new TemplateValidator();

        const validationErrors =
            validator.validate(enrichedTemplate);

        if (validationErrors.length > 0) {

            return {
                success: false,
                errors: validationErrors
            };

        }

        // Step 3 - Collect variables
        const variableCollectionService =
            new VariableCollectionService();

        const variables =
            variableCollectionService.collect(enrichedTemplate);

        // Step 4 - Build the prepared template
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