import {
    CompatibilityReport,
    ResolvedTemplateProfile,
    TemplateCompositionPlan,
    TemplatePackage,
    TemplateProfile
} from "../models";

import {
    TemplateCompatibilityValidator
} from "./TemplateCompatibilityValidator";

import {
    TemplateCompositionPlanner
} from "./TemplateCompositionPlanner";

import {
    TemplateProfileResolver
} from "./TemplateProfileResolver";

import {
    TemplateProfileValidator
} from "./TemplateProfileValidator";

export interface TemplateProfileCompositionResult {

    resolvedProfile:
        ResolvedTemplateProfile;

    plan:
        TemplateCompositionPlan;

    compatibility:
        CompatibilityReport;

}

export class TemplateProfileCompositionService {

    public build(
        profile: TemplateProfile,
        templates:
            readonly TemplatePackage[]
    ): TemplateProfileCompositionResult {

        const profileValidator =
            new TemplateProfileValidator();

        const definitionResult =
            profileValidator
                .validateDefinition(
                    profile
                );

        if (!definitionResult.valid) {

            throw new Error(
                [
                    `Profile "${profile.id}" is invalid:`,
                    ...definitionResult.errors
                ].join(" ")
            );

        }

        const profileResolver =
            new TemplateProfileResolver();

        const resolvedProfile =
            profileResolver.resolve(
                profile,
                templates
            );

        const resolvedResult =
            profileValidator
                .validateResolved(
                    resolvedProfile
                );

        if (!resolvedResult.valid) {

            throw new Error(
                [
                    `Resolved profile "${profile.id}" is invalid:`,
                    ...resolvedResult.errors
                ].join(" ")
            );

        }

        const planner =
            new TemplateCompositionPlanner();

        const plan =
            planner.createPlan(
                {
                    baseTemplate:
                        resolvedProfile
                            .baseTemplate,

                    featureTemplates:
                        resolvedProfile
                            .featureTemplates
                },
                templates
            );

        const compatibilityValidator =
            new TemplateCompatibilityValidator();

        const compatibility =
            compatibilityValidator.validate(
                plan
            );

        return {
            resolvedProfile,
            plan,
            compatibility
        };

    }

}