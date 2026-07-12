import {
    TemplateCompositionPlan,
    TemplateCompositionRequest,
    TemplatePackage
} from "../models";

import {
    TemplateDependencyResolver
} from "./TemplateDependencyResolver";

export class TemplateCompositionPlanner {

    public createPlan(
        request:
            TemplateCompositionRequest,

        availableTemplates:
            readonly TemplatePackage[] = [
                request.baseTemplate,
                ...request.featureTemplates
            ]
    ): TemplateCompositionPlan {

        this.validateBaseTemplate(
            request.baseTemplate
        );

        this.validateFeatureTemplates(
            request.featureTemplates
        );

        const dependencyResolver =
            new TemplateDependencyResolver();

        const resolvedFeatures =
            dependencyResolver.resolve(
                request.featureTemplates,
                availableTemplates
            );

        return {
            baseTemplate:
                request.baseTemplate,

            featureTemplates:
                resolvedFeatures,

            orderedTemplates: [
                request.baseTemplate,
                ...resolvedFeatures
            ]
        };

    }

    private validateBaseTemplate(
        template: TemplatePackage
    ): void {

        const role =
            template.manifest.role ??
            "base";

        if (role !== "base") {

            throw new Error(
                [
                    "The selected base template is not a base template:",
                    template.manifest.id
                ].join(" ")
            );

        }

    }

    private validateFeatureTemplates(
        templates:
            readonly TemplatePackage[]
    ): void {

        for (
            const template
            of templates
        ) {

            const role =
                template.manifest.role ??
                "base";

            if (role !== "feature") {

                throw new Error(
                    [
                        "The selected feature template is not a feature template:",
                        template.manifest.id
                    ].join(" ")
                );

            }

        }

    }

}