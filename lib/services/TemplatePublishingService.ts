import {
    RegistryPublishEntry,
    RegistryPublishManifest,
    TemplatePublishingOutcome,
    TemplatePublishRequest
} from "../models";

import {
    RegistryPublishManifestBuilder
} from "./RegistryPublishManifestBuilder";

import {
    TemplatePackageHashService
} from "./TemplatePackageHashService";

import {
    TemplatePublishValidationService
} from "./TemplatePublishValidationService";

export class TemplatePublishingService {

    public constructor(
        private readonly manifestBuilder:
            RegistryPublishManifestBuilder =
            new RegistryPublishManifestBuilder(),

        private readonly hashService:
            TemplatePackageHashService =
            new TemplatePackageHashService(),

        private readonly validationService:
            TemplatePublishValidationService =
            new TemplatePublishValidationService()
    ) {}

    public async publish(
        request:
            TemplatePublishRequest,

        manifest?:
            RegistryPublishManifest
    ): Promise<TemplatePublishingOutcome> {

        const validation =
            await this.validationService
                .validateOrThrow(
                    request,
                    manifest
                );

        const normalizedRequest =
            validation.request;

        const sha256 =
            await this.hashService.calculateSha256(
                normalizedRequest.packagePath
            );

        const publishedAt =
            new Date();

        const entry:
            RegistryPublishEntry = {

            templateId:
                normalizedRequest.templateId,

            version:
                normalizedRequest.version,

            packagePath:
                normalizedRequest.packagePath,

            sha256,

            publishedAt
        };

        const currentManifest =
            manifest ??
            this.manifestBuilder.create(
                normalizedRequest.registryId
            );

        const updatedManifest =
            this.manifestBuilder.add(
                currentManifest,
                entry
            );

        return {
            result: {
                success:
                    true,

                message:
                    [
                        `Template "${normalizedRequest.templateId}"`,
                        `version "${normalizedRequest.version}"`,
                        `was prepared for registry "${normalizedRequest.registryId}".`
                    ].join(" "),

                registryId:
                    normalizedRequest.registryId,

                templateId:
                    normalizedRequest.templateId,

                version:
                    normalizedRequest.version,

                publishedAt
            },

            entry,

            manifest:
                updatedManifest
        };

    }

}