import {
    TemplateCompositionPlan
} from "../models";

export class TemplateCompositionPresenter {

    public format(
        plan: TemplateCompositionPlan
    ): string {

        const lines: string[] = [];

        lines.push(
            "Composition Preview"
        );

        lines.push(
            "-------------------"
        );

        lines.push("");

        lines.push(
            `Base Template : ${plan.baseTemplate.manifest.name}`
        );

        lines.push("");

        if (
            plan.featureTemplates.length === 0
        ) {

            lines.push(
                "Features      : None"
            );

        } else {

            lines.push(
                "Features"
            );

            lines.push(
                "--------"
            );

            for (
                const feature
                of plan.featureTemplates
            ) {

                lines.push(
                    `• ${feature.manifest.name}`
                );

            }

        }

        lines.push("");

        lines.push(
            `Templates to Merge : ${plan.orderedTemplates.length}`
        );

        return lines.join("\n");

    }

}