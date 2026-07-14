import {
    InstalledTemplatePackage,
    RegistrySearchResult,
    TemplateRegistryIndex,
    TemplateRegistryManifest
} from "../models";

import {
    InstalledTemplatePackageStore
} from "./InstalledTemplatePackageStore";

import {
    TemplatePackageSearchService
} from "./TemplatePackageSearchService";

import {
    TemplateRegistryIndexService
} from "./TemplateRegistryIndexService";

export class TemplateRegistryManager {

    public constructor(
        private readonly indexService:
            TemplateRegistryIndexService =
            new TemplateRegistryIndexService(),

        private readonly searchService:
            TemplatePackageSearchService =
            new TemplatePackageSearchService(),

        private readonly installedStore:
            InstalledTemplatePackageStore =
            new InstalledTemplatePackageStore()
    ) {}

    public buildIndex(
        manifests:
            readonly TemplateRegistryManifest[]
    ): TemplateRegistryIndex {

        return this.indexService.build(
            manifests
        );

    }

    public search(
        index:
            TemplateRegistryIndex,

        query:
            string
    ): RegistrySearchResult[] {

        return this.searchService.search(
            index,
            query
        );

    }

    public async listInstalled():
        Promise<InstalledTemplatePackage[]> {

        const collection =
            await this.installedStore.read();

        return [
            ...collection.packages
        ].sort(
            (
                left,
                right
            ) => {

                const idComparison =
                    left.templateId.localeCompare(
                        right.templateId
                    );

                if (
                    idComparison !==
                    0
                ) {

                    return idComparison;

                }

                return left.version.localeCompare(
                    right.version,
                    undefined,
                    {
                        numeric:
                            true
                    }
                );

            }
        );

    }

    public async findInstalled(
        templateId:
            string
    ): Promise<InstalledTemplatePackage[]> {

        const installed =
            await this.installedStore.findById(
                templateId
            );

        return [
            ...installed
        ].sort(
            (
                left,
                right
            ) =>
                right.version.localeCompare(
                    left.version,
                    undefined,
                    {
                        numeric:
                            true
                    }
                )
        );

    }

}