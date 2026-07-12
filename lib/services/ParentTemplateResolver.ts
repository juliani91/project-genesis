import {
    TemplatePackage
} from "../models";

export class ParentTemplateResolver {

    public resolveParent(
        template: TemplatePackage,
        templates: readonly TemplatePackage[]
    ): TemplatePackage | undefined {

        this.validateUniqueTemplateIds(
            templates
        );

        const parentId =
            template.manifest.extends;

        if (!parentId) {
            return undefined;
        }

        const parent =
            templates.find(
                (candidate) =>
                    candidate.manifest.id ===
                    parentId
            );

        if (!parent) {

            throw new Error(
                [
                    "Unable to resolve parent template:",
                    parentId,
                    `referenced by "${template.manifest.id}".`
                ].join(" ")
            );

        }

        return parent;

    }

    public resolveChain(
        template: TemplatePackage,
        templates: readonly TemplatePackage[]
    ): readonly TemplatePackage[] {

        this.validateUniqueTemplateIds(
            templates
        );

        const chain:
            TemplatePackage[] = [];

        const visited =
            new Set<string>();

        let current:
            TemplatePackage | undefined =
            template;

        while (current) {

            const currentId =
                current.manifest.id;

            if (
                visited.has(
                    currentId
                )
            ) {

                const cycle =
                    [
                        ...chain.map(
                            (item) =>
                                item.manifest.id
                        ),
                        currentId
                    ].join(" -> ");

                throw new Error(
                    `Circular template inheritance detected: ${cycle}.`
                );

            }

            visited.add(
                currentId
            );

            chain.push(
                current
            );

            current =
                this.findParent(
                    current,
                    templates
                );

        }

        return chain;

    }

    public validateUniqueTemplateIds(
        templates: readonly TemplatePackage[]
    ): void {

        const templateCounts =
            new Map<string, number>();

        for (const template of templates) {

            const id =
                template.manifest.id;

            templateCounts.set(
                id,
                (
                    templateCounts.get(
                        id
                    ) ?? 0
                ) + 1
            );

        }

        const duplicateIds =
            [
                ...templateCounts.entries()
            ]
                .filter(
                    (
                        [, count]
                    ) =>
                        count > 1
                )
                .map(
                    (
                        [id]
                    ) =>
                        id
                );

        if (
            duplicateIds.length === 0
        ) {
            return;
        }

        throw new Error(
            [
                "Duplicate template IDs detected:",
                duplicateIds.join(", "),
                "Template IDs must be unique."
            ].join(" ")
        );

    }

    private findParent(
        template: TemplatePackage,
        templates: readonly TemplatePackage[]
    ): TemplatePackage | undefined {

        const parentId =
            template.manifest.extends;

        if (!parentId) {
            return undefined;
        }

        const parent =
            templates.find(
                (candidate) =>
                    candidate.manifest.id ===
                    parentId
            );

        if (!parent) {

            throw new Error(
                [
                    "Unable to resolve parent template:",
                    parentId,
                    `referenced by "${template.manifest.id}".`
                ].join(" ")
            );

        }

        return parent;

    }

}