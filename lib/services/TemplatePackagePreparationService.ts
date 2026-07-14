import {
    RegistryTemplate,
    TemplatePackage
} from "../models";

import {
    TemplateDiscoveryService
} from "./TemplateDiscoveryService";

import {
    TemplatePackageCacheService
} from "./TemplatePackageCacheService";

export class TemplatePackagePreparationService {

    public constructor(
        private readonly cacheService:
            TemplatePackageCacheService =
            new TemplatePackageCacheService(),

        private readonly discoveryService:
            TemplateDiscoveryService =
            new TemplateDiscoveryService()
    ) {}

    public async prepare(
        template:
            RegistryTemplate
    ): Promise<TemplatePackage> {

        const cache =
            await this.cacheService.prepare(
                template
            );

        const preparedTemplate =
            await this.discoveryService
                .discoverTemplate(
                    cache
                        .extraction
                        .result
                        .templatePath
                );

        if (
            preparedTemplate.manifest.id !==
            template.templateId
        ) {

            throw new Error(
                [
                    "Downloaded template ID mismatch.",
                    `Expected "${template.templateId}",`,
                    `but extracted manifest reports "${preparedTemplate.manifest.id}".`
                ].join(" ")
            );

        }

        if (
            preparedTemplate.manifest.version !==
            template.version
        ) {

            throw new Error(
                [
                    "Downloaded template version mismatch.",
                    `Expected "${template.version}",`,
                    `but extracted manifest reports "${preparedTemplate.manifest.version}".`
                ].join(" ")
            );

        }

        return preparedTemplate;

    }

}