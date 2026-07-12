import {
    TemplateCatalogEntry,
    TemplatePackage
} from "../models";

export class TemplateCatalogService {

    public createCatalog(
        templates: readonly TemplatePackage[]
    ): readonly TemplateCatalogEntry[] {

        const entries =
            templates.map(
                (template) =>
                    this.createEntry(
                        template
                    )
            );

        return this.sort(
            entries
        );

    }

    public sort(
        entries: readonly TemplateCatalogEntry[]
    ): readonly TemplateCatalogEntry[] {

        return [
            ...entries
        ].sort(
            (
                first,
                second
            ) => {

                const categoryComparison =
                    first.category.localeCompare(
                        second.category,
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    );

                if (
                    categoryComparison !== 0
                ) {

                    return categoryComparison;

                }

                return first.name.localeCompare(
                    second.name,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );

            }
        );

    }

    public filterByCategory(
        entries: readonly TemplateCatalogEntry[],
        category: string
    ): readonly TemplateCatalogEntry[] {

        const normalizedCategory =
            this.normalizeSearchValue(
                category
            );

        if (!normalizedCategory) {

            return [
                ...entries
            ];

        }

        return entries.filter(
            (entry) =>
                this.normalizeSearchValue(
                    entry.category
                ) ===
                normalizedCategory
        );

    }

    public filterByTag(
        entries: readonly TemplateCatalogEntry[],
        tag: string
    ): readonly TemplateCatalogEntry[] {

        const normalizedTag =
            this.normalizeSearchValue(
                tag
            );

        if (!normalizedTag) {

            return [
                ...entries
            ];

        }

        return entries.filter(
            (entry) =>
                entry.tags.some(
                    (entryTag) =>
                        this.normalizeSearchValue(
                            entryTag
                        ) ===
                        normalizedTag
                )
        );

    }

    public filterByAuthor(
        entries: readonly TemplateCatalogEntry[],
        author: string
    ): readonly TemplateCatalogEntry[] {

        const normalizedAuthor =
            this.normalizeSearchValue(
                author
            );

        if (!normalizedAuthor) {

            return [
                ...entries
            ];

        }

        return entries.filter(
            (entry) =>
                this.normalizeSearchValue(
                    entry.author
                ) ===
                normalizedAuthor
        );

    }

    public search(
        entries: readonly TemplateCatalogEntry[],
        query: string
    ): readonly TemplateCatalogEntry[] {

        const normalizedQuery =
            this.normalizeSearchValue(
                query
            );

        if (!normalizedQuery) {

            return [
                ...entries
            ];

        }

        const queryTerms =
            normalizedQuery
                .split(/\s+/)
                .filter(
                    (term) =>
                        term.length > 0
                );

        return entries.filter(
            (entry) => {

                const searchableValues = [
                    entry.name,
                    entry.description,
                    ...entry.tags
                ]
                    .map(
                        (value) =>
                            this.normalizeSearchValue(
                                value
                            )
                    );

                return queryTerms.every(
                    (term) =>
                        searchableValues.some(
                            (value) =>
                                value.includes(
                                    term
                                )
                        )
                );

            }
        );

    }

    private createEntry(
        template: TemplatePackage
    ): TemplateCatalogEntry {

        const manifest =
            template.manifest;

        return {
            id:
                manifest.id,

            name:
                manifest.name,

            description:
                manifest.description,

            version:
                manifest.version,

            author:
                manifest.author,

            category:
                this.normalizeCategory(
                    manifest.category
                ),

            tags:
                this.normalizeTags(
                    manifest.tags
                ),

            parentId:
                manifest.extends ??
                undefined,

            template
        };

    }

    private normalizeCategory(
        category: string | undefined
    ): string {

        const normalized =
            category?.trim();

        if (!normalized) {

            return "Uncategorized";

        }

        return normalized;

    }

    private normalizeTags(
        tags: readonly string[] | undefined
    ): readonly string[] {

        if (!tags) {

            return [];

        }

        return tags
            .map(
                (tag) =>
                    tag.trim()
            )
            .filter(
                (tag) =>
                    tag.length > 0
            );

    }

    private normalizeSearchValue(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase();

    }

}