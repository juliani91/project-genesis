import {
    TemplatePublishingOutcome,
    TemplatePublishRequest
} from "../models";

import {
    RegistryPublishManifestStore
} from "./RegistryPublishManifestStore";

import {
    TemplatePublishingService
} from "./TemplatePublishingService";

export class TemplatePublishingPipeline {

    public constructor(
        private readonly publishingService:
            TemplatePublishingService =
            new TemplatePublishingService()
    ) {}

    public async execute(
        request:
            TemplatePublishRequest,

        manifestStore:
            RegistryPublishManifestStore
    ): Promise<TemplatePublishingOutcome> {

        const currentManifest =
            await manifestStore.read();

        const outcome =
            await this.publishingService.publish(
                request,
                currentManifest
            );

        await manifestStore.write(
            outcome.manifest
        );

        return outcome;

    }

}