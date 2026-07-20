import path from "path";

import {
    PackagePublishCommandOptions
} from "../models";

import {
    TemplatePublishingOutcome
} from "../../lib/models";

import {
    RegistryPublishManifestStore,
    TemplatePublishingPipeline
} from "../../lib/services";

export type RegistryPublishManifestStoreFactory = (
    registryId:
        string,

    manifestPath?:
        string
) => RegistryPublishManifestStore;

export class PackagePublishCommand {

    private readonly publishingPipeline:
        TemplatePublishingPipeline;

    private readonly manifestStoreFactory:
        RegistryPublishManifestStoreFactory;

    public constructor(
        publishingPipeline:
            TemplatePublishingPipeline =
            new TemplatePublishingPipeline(),

        manifestStoreFactory:
            RegistryPublishManifestStoreFactory =
            (
                registryId,
                manifestPath
            ) =>
                new RegistryPublishManifestStore(
                    registryId,
                    manifestPath
                )
    ) {

        this.publishingPipeline =
            publishingPipeline;

        this.manifestStoreFactory =
            manifestStoreFactory;

    }

    public async execute(
        options:
            PackagePublishCommandOptions
    ): Promise<TemplatePublishingOutcome> {

        const registryId =
            this.requireValue(
                options?.registryId,
                "Registry ID"
            )
                .toLowerCase();

        const packagePath =
            path.resolve(
                this.requireValue(
                    options?.packagePath,
                    "Package path"
                )
            );

        const manifestPath =
            options?.manifestPath
                ? path.resolve(
                    this.requireValue(
                        options.manifestPath,
                        "Manifest path"
                    )
                )
                : undefined;

        const manifestStore =
            this.manifestStoreFactory(
                registryId,
                manifestPath
            );

        return this.publishingPipeline.execute(
            {
                templateId:
                    this.requireValue(
                        options?.templateId,
                        "Template ID"
                    ),

                version:
                    this.requireValue(
                        options?.version,
                        "Template version"
                    ),

                packagePath,

                registryId
            },
            manifestStore
        );

    }

    private requireValue(
        value:
            unknown,

        label:
            string
    ): string {

        if (
            typeof value !==
            "string"
        ) {

            throw new Error(
                `${label} is required.`
            );

        }

        const normalized =
            value.trim();

        if (!normalized) {

            throw new Error(
                `${label} is required.`
            );

        }

        return normalized;

    }

}