import {
    RegistryIndexTemplate,
    RegistrySearchResult,
    TemplateRegistryIndex
} from "../models";

export class TemplatePackageSearchService {

    public search(
        index:
            TemplateRegistryIndex,

        query:
            string
    ): RegistrySearchResult[] {

        const normalizedQuery =
            query
                .trim()
                .toLowerCase();

        if (!normalizedQuery) {

            return [];

        }

        const results:
            RegistrySearchResult[] = [];

        for (
            const template
            of index.templates
        ) {

            const result =
                this.createSearchResult(
                    template,
                    normalizedQuery
                );

            if (result) {

                results.push(
                    result
                );

            }

        }

        results.sort(
            (
                left,
                right
            ) => {

                const rankComparison =
                    left.rank -
                    right.rank;

                if (
                    rankComparison !==
                    0
                ) {

                    return rankComparison;

                }

                const idComparison =
                    left.template
                        .templateId
                        .localeCompare(
                            right.template
                                .templateId
                        );

                if (
                    idComparison !==
                    0
                ) {

                    return idComparison;

                }

                return left.template
                    .registryId
                    .localeCompare(
                        right.template
                            .registryId
                    );

            }
        );

        return results;

    }

    private createSearchResult(
        template:
            RegistryIndexTemplate,

        query:
            string
    ): RegistrySearchResult | undefined {

        const templateId =
            template.templateId
                .toLowerCase();

        const name =
            template.name
                .toLowerCase();

        const description =
            template.description
                ?.toLowerCase() ??
            "";

        const matchedBy:
            (
                | "id"
                | "name"
                | "description"
            )[] = [];

        let rank:
            number | undefined;

        if (
            templateId ===
            query
        ) {

            rank =
                0;

            matchedBy.push(
                "id"
            );

        } else if (
            templateId.startsWith(
                query
            )
        ) {

            rank =
                1;

            matchedBy.push(
                "id"
            );

        } else if (
            templateId.includes(
                query
            )
        ) {

            rank =
                2;

            matchedBy.push(
                "id"
            );

        }

        if (
            name.startsWith(
                query
            )
        ) {

            rank =
                this.selectBetterRank(
                    rank,
                    3
                );

            matchedBy.push(
                "name"
            );

        } else if (
            name.includes(
                query
            )
        ) {

            rank =
                this.selectBetterRank(
                    rank,
                    4
                );

            matchedBy.push(
                "name"
            );

        }

        if (
            description.includes(
                query
            )
        ) {

            rank =
                this.selectBetterRank(
                    rank,
                    5
                );

            matchedBy.push(
                "description"
            );

        }

        if (
            rank ===
            undefined
        ) {

            return undefined;

        }

        return {
            template,

            rank,

            matchedBy
        };

    }

    private selectBetterRank(
        current:
            number | undefined,

        candidate:
            number
    ): number {

        if (
            current ===
            undefined
        ) {

            return candidate;

        }

        return Math.min(
            current,
            candidate
        );

    }

}