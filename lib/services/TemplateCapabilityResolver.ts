import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../models";

export class TemplateCapabilityResolver {

    public resolve(
        plan: TemplateCompositionPlan
    ): readonly string[] {

        return this.resolveTemplates(
            plan.orderedTemplates
        );

    }

    public resolveTemplates(
        templates:
            readonly TemplatePackage[]
    ): readonly string[] {

        const capabilities =
            new Set<string>();

        for (const template of templates) {

            for (
                const capability
                of template.manifest.provides ?? []
            ) {

                const normalized =
                    this.normalize(
                        capability
                    );

                if (normalized) {

                    capabilities.add(
                        normalized
                    );

                }

            }

        }

        return [
            ...capabilities
        ].sort(
            (
                first,
                second
            ) =>
                first.localeCompare(
                    second,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                )
        );

    }

    private normalize(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase();

    }

}