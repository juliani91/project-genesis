import {
    PackageSearchCommandResult,
    TemplateRegistryIndex
} from "../models";

import {
    TemplateRegistryManager
} from "../services";

export class PackageSearchCommand {

    public constructor(
        private readonly registryManager:
            TemplateRegistryManager =
            new TemplateRegistryManager()
    ) {}

    public execute(
        index:
            TemplateRegistryIndex,

        query:
            string
    ): PackageSearchCommandResult {

        const normalizedQuery =
            this.requireQuery(
                query
            );

        const results =
            this.registryManager.search(
                index,
                normalizedQuery
            );

        if (
            results.length ===
            0
        ) {

            return {
                success:
                    true,

                message:
                    `No packages matched "${normalizedQuery}".`,

                results
            };

        }

        return {
            success:
                true,

            message:
                results.length ===
                    1
                    ? `Found 1 package matching "${normalizedQuery}".`
                    : `Found ${results.length} packages matching "${normalizedQuery}".`,

            results
        };

    }

    private requireQuery(
        query:
            string
    ): string {

        if (
            typeof query !==
            "string"
        ) {

            throw new Error(
                "Package search query is required."
            );

        }

        const normalized =
            query.trim();

        if (!normalized) {

            throw new Error(
                "Package search query is required."
            );

        }

        return normalized;

    }

}