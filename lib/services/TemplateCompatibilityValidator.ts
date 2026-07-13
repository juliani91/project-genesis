import {
    CompatibilityIssue,
    CompatibilityReport,
    TemplateCompositionPlan,
    TemplatePackage
} from "../models";

import {
    TemplateCapabilityResolver
} from "./TemplateCapabilityResolver";

export class TemplateCompatibilityValidator {

    public validate(
        plan: TemplateCompositionPlan
    ): CompatibilityReport {

        const capabilityResolver =
            new TemplateCapabilityResolver();

        const providedCapabilities =
            new Set(
                capabilityResolver.resolve(
                    plan
                )
            );

        const issues: CompatibilityIssue[] = [
            ...this.findMissingCapabilities(
                plan.orderedTemplates,
                providedCapabilities
            ),
            ...this.findConflicts(
                plan.orderedTemplates,
                providedCapabilities
            )
        ];
        

        return {
            compatible:
                issues.length === 0,

            issues
        };

    }


    private findMissingCapabilities(
        templates:
            readonly TemplatePackage[],

        providedCapabilities:
            ReadonlySet<string>
    ): CompatibilityIssue[] {

        const issues:
            CompatibilityIssue[] = [];

        for (const template of templates) {

            for (
                const requiredCapability
                of template.manifest
                    .requiresCapabilities ?? []
            ) {

                const normalized =
                    this.normalize(
                        requiredCapability
                    );

                if (!normalized) {
                    continue;
                }

                if (
                    providedCapabilities.has(
                        normalized
                    )
                ) {
                    continue;
                }

                issues.push({
                    type:
                        "missing-capability",

                    capability:
                        normalized,

                    templateId:
                        template.manifest.id,

                    message:
                        [
                            `Template "${template.manifest.id}"`,
                            "requires capability",
                            `"${normalized}",`,
                            "but the composition does not provide it."
                        ].join(" ")
                });

            }

        }

        return issues;

    }

    private findConflicts(
        templates:
            readonly TemplatePackage[],

        providedCapabilities:
            ReadonlySet<string>
    ): CompatibilityIssue[] {

        const issues:
            CompatibilityIssue[] = [];

        const reported =
            new Set<string>();

        for (const template of templates) {

            for (
                const conflictingCapability
                of template.manifest
                    .conflictsWith ?? []
            ) {

                const normalized =
                    this.normalize(
                        conflictingCapability
                    );

                if (!normalized) {
                    continue;
                }

                if (
                    !providedCapabilities.has(
                        normalized
                    )
                ) {
                    continue;
                }

                const issueIdentity =
                    [
                        template.manifest.id,
                        normalized
                    ].join(":");

                if (
                    reported.has(
                        issueIdentity
                    )
                ) {
                    continue;
                }

                reported.add(
                    issueIdentity
                );

                issues.push({
                    type:
                        "conflict",

                    capability:
                        normalized,

                    templateId:
                        template.manifest.id,

                    message:
                        [
                            `Template "${template.manifest.id}"`,
                            "conflicts with capability",
                            `"${normalized}",`,
                            "which is provided by the composition."
                        ].join(" ")
                });

            }

        }

        return issues;

    }

    private normalize(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase();

    }

}