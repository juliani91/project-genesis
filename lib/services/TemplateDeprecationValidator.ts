import {
    TemplateCompositionPlan,
    VersionIssue,
    VersionReport
} from "../models";

export class TemplateDeprecationValidator {

    public validate(
        plan:
            TemplateCompositionPlan
    ): VersionReport {

        const issues:
            VersionIssue[] = [];

        for (
            const template
            of plan.orderedTemplates
        ) {

            const manifest =
                template.manifest;

            if (
                manifest.deprecated !==
                true
            ) {
                continue;
            }

            const replacementMessage =
                manifest.replacementTemplate
                    ? [
                        "Use",
                        `"${manifest.replacementTemplate}"`,
                        "instead."
                    ].join(" ")
                    : "No replacement template is specified.";

            issues.push({
                type:
                    "deprecated",

                templateId:
                    manifest.id,

                warning:
                    true,

                message:
                    [
                        `Template "${manifest.id}" is deprecated.`,
                        replacementMessage
                    ].join(" ")
            });

        }

        return {
            compatible:
                true,

            issues
        };

    }

}