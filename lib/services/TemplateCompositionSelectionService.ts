import {
    TemplateCatalogEntry,
    TemplateCompositionRequest,
    TemplatePackage
} from "../models";

export class TemplateCompositionSelectionService {

    public createRequest(
        baseTemplateId: string,
        featureTemplateIds: readonly string[],
        templates: readonly TemplatePackage[]
    ): TemplateCompositionRequest {

        const byId =
            new Map(
                templates.map(
                    (template) => [
                        template.manifest.id,
                        template
                    ]
                )
            );

        const baseTemplate =
            byId.get(
                baseTemplateId
            );

        if (!baseTemplate) {

            throw new Error(
                `Unknown base template: ${baseTemplateId}`
            );

        }

        const baseRole =
            baseTemplate.manifest.role ??
            "base";

        if (baseRole !== "base") {

            throw new Error(
                `${baseTemplateId} is not a base template.`
            );

        }

        const features: TemplatePackage[] = [];

        const added =
            new Set<string>();

        for (
            const id
            of featureTemplateIds
        ) {

            if (
                added.has(id)
            ) {

                continue;

            }

            const feature =
                byId.get(id);

            if (!feature) {

                throw new Error(
                    `Unknown feature template: ${id}`
                );

            }

            const role =
                feature.manifest.role ??
                "base";

            if (role !== "feature") {

                throw new Error(
                    `${id} is not a feature template.`
                );

            }

            features.push(
                feature
            );

            added.add(
                id
            );

        }

        return {
            baseTemplate,
            featureTemplates:
                features
        };

    }

    public getBaseTemplates(
        catalog:
            readonly TemplateCatalogEntry[]
    ): readonly TemplateCatalogEntry[] {

        return catalog.filter(
            (entry) =>
                (
                    entry.template
                        .manifest
                        .role ??
                    "base"
                ) ===
                "base"
        );

    }

    public getFeatureTemplates(
        catalog:
            readonly TemplateCatalogEntry[]
    ): readonly TemplateCatalogEntry[] {

        return catalog.filter(
            (entry) =>
                (
                    entry.template
                        .manifest
                        .role ??
                    "base"
                ) ===
                "feature"
        );

    }

}