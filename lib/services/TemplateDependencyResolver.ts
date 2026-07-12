import {
    TemplatePackage
} from "../models";

export class TemplateDependencyResolver {

    public resolve(
        selectedFeatures:
            readonly TemplatePackage[],

        availableTemplates:
            readonly TemplatePackage[]
    ): readonly TemplatePackage[] {

        const availableById =
            new Map<
                string,
                TemplatePackage
            >();

        for (
            const template
            of availableTemplates
        ) {

            availableById.set(
                template.manifest.id,
                template
            );

        }

        const resolved:
            TemplatePackage[] = [];

        const added =
            new Set<string>();

        const visiting =
            new Set<string>();

        const visit = (
            template:
                TemplatePackage
        ): void => {

            const id =
                template.manifest.id;

            if (
                added.has(
                    id
                )
            ) {
                return;
            }

            if (
                visiting.has(
                    id
                )
            ) {

                throw new Error(
                    `Circular template dependency detected at: ${id}.`
                );

            }

            visiting.add(
                id
            );

            const dependencyIds =
                template.manifest
                    .requires ?? [];

            for (
                const dependencyId
                of dependencyIds
            ) {

                const dependency =
                    availableById.get(
                        dependencyId
                    );

                if (!dependency) {

                    throw new Error(
                        [
                            "Unable to resolve template dependency:",
                            dependencyId,
                            `required by "${id}".`
                        ].join(" ")
                    );

                }

                const dependencyRole =
                    dependency.manifest
                        .role ??
                    "base";

                if (
                    dependencyRole !==
                    "feature"
                ) {

                    throw new Error(
                        [
                            "Template dependency must be a feature template:",
                            dependencyId
                        ].join(" ")
                    );

                }

                visit(
                    dependency
                );

            }

            visiting.delete(
                id
            );

            added.add(
                id
            );

            resolved.push(
                template
            );

        };

        for (
            const feature
            of selectedFeatures
        ) {

            visit(
                feature
            );

        }

        return resolved;

    }

}