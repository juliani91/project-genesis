import {
    RemoteRegistryLoadResult,
    ResolvedTemplateRegistry
} from "../models";

import {
    TemplateRegistryHttpClient
} from "./TemplateRegistryHttpClient";

export class TemplateRemoteRegistryLoader {

    public async load(
        registry:
            ResolvedTemplateRegistry
    ): Promise<RemoteRegistryLoadResult> {

        if (
            registry.type !==
            "remote"
        ) {

            throw new Error(
                [
                    `Registry "${registry.id}"`,
                    "is not a remote registry."
                ].join(" ")
            );

        }

        const client =
            new TemplateRegistryHttpClient();

        const response =
            await client.fetchManifest(
                registry.resolvedLocation
            );

        const manifest =
            response.manifest;

        if (
            manifest.registry.id !==
            registry.id
        ) {

            throw new Error(
                [
                    `Remote registry ID mismatch.`,
                    `Expected "${registry.id}",`,
                    `but received "${manifest.registry.id}".`
                ].join(" ")
            );

        }

        if (
            manifest.registry.type !==
            "remote"
        ) {

            throw new Error(
                [
                    `Remote registry "${registry.id}"`,
                    "returned a manifest that is not marked as remote."
                ].join(" ")
            );

        }

        return {
            source:
                "network",

            manifest
        };

    }

}