import {
    TemplateRegistryManifest,
    TemplateRegistrySyncResult
} from "../models";

import {
    TemplateRegistrySyncService
} from "../services/TemplateRegistrySyncService";

export class PackageSyncCommand {

    public constructor(
        private readonly syncService:
            TemplateRegistrySyncService =
            new TemplateRegistrySyncService()
    ) {}

    public async execute(
        manifests:
            readonly TemplateRegistryManifest[],

        registryId?:
            string
    ): Promise<TemplateRegistrySyncResult> {

        if (
            manifests.length ===
            0
        ) {

            throw new Error(
                "No template registries were discovered."
            );

        }

        return this.syncService.sync(
            manifests,
            registryId
        );

    }

}
