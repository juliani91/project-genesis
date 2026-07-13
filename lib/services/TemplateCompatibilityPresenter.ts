import {
    CompatibilityReport,
    TemplateCompositionPlan
} from "../models";

import {
    TemplateCapabilityResolver
} from "./TemplateCapabilityResolver";

export class TemplateCompatibilityPresenter {

    public format(
        plan: TemplateCompositionPlan,
        report: CompatibilityReport
    ): string {

        const resolver =
            new TemplateCapabilityResolver();

        const capabilities =
            resolver.resolve(
                plan
            );

        const lines:
            string[] = [
                "Compatibility Preview",
                "---------------------",
                "",
                `Status       : ${
                    report.compatible
                        ? "Compatible"
                        : "Incompatible"
                }`,
                "",
                `Capabilities : ${
                    capabilities.length > 0
                        ? capabilities.join(", ")
                        : "None"
                }`
            ];

        if (
            report.issues.length > 0
        ) {

            lines.push(
                "",
                "Issues",
                "------"
            );

            for (
                const issue
                of report.issues
            ) {

                lines.push(
                    `- ${issue.message}`
                );

            }

        }

        return lines.join("\n");

    }

}