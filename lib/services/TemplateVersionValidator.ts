import {
    TemplateCompositionPlan,
    VersionIssue,
    VersionReport
} from "../models";

import {
    SemanticVersionService
} from "./SemanticVersionService";

export class TemplateVersionValidator {

    public validate(
        plan:
            TemplateCompositionPlan
    ): VersionReport {

        const issues:
            VersionIssue[] = [];

        const templatesById =
            new Map(
                plan.orderedTemplates.map(
                    (template) => [
                        template.manifest.id,
                        template
                    ]
                )
            );

        const versionService =
            new SemanticVersionService();

        for (
            const template
            of plan.orderedTemplates
        ) {

            const constraints =
                template.manifest
                    .requiresTemplateVersions ??
                {};

            for (
                const [
                    requiredTemplateId,
                    constraint
                ]
                of Object.entries(
                    constraints
                )
            ) {

                const requiredTemplate =
                    templatesById.get(
                        requiredTemplateId
                    );

                if (!requiredTemplate) {

                    issues.push({
                        type:
                            "template-version",

                        templateId:
                            template.manifest.id,

                        warning:
                            false,

                        message:
                            [
                                `Template "${template.manifest.id}"`,
                                "requires template",
                                `"${requiredTemplateId}"`,
                                `with version constraint "${constraint}",`,
                                "but that template is not present in the composition."
                            ].join(" ")
                    });

                    continue;

                }

                const actualVersion =
                    requiredTemplate
                        .manifest
                        .version;

                const satisfies =
                    versionService.satisfies(
                        actualVersion,
                        constraint
                    );

                if (satisfies) {
                    continue;
                }

                issues.push({
                    type:
                        "template-version",

                    templateId:
                        template.manifest.id,

                    warning:
                        false,

                    message:
                        [
                            `Template "${template.manifest.id}"`,
                            "requires",
                            `"${requiredTemplateId}"`,
                            `version "${constraint}",`,
                            `but version "${actualVersion}" is selected.`
                        ].join(" ")
                });

            }

        }

        return {
            compatible:
                !issues.some(
                    (issue) =>
                        !issue.warning
                ),

            issues
        };

    }

}