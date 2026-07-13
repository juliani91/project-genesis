import path from "path";

import {
    ResolvedTemplateRegistry,
    TemplateRegistryManifest
} from "../models";

export class TemplateRegistryResolver {

    public resolve(
        manifest:
            TemplateRegistryManifest,

        basePath:
            string = process.cwd()
    ): ResolvedTemplateRegistry {

        const registry =
            manifest.registry;

        const id =
            registry.id.trim();

        if (!id) {

            throw new Error(
                "Registry ID is required."
            );

        }

        const name =
            registry.name.trim();

        if (!name) {

            throw new Error(
                `Registry "${id}" must have a name.`
            );

        }

        const location =
            registry.location.trim();

        if (!location) {

            throw new Error(
                `Registry "${id}" must have a location.`
            );

        }

        const resolvedLocation =
            registry.type ===
                "local"
                ? this.resolveLocalLocation(
                    location,
                    basePath
                )
                : this.resolveRemoteLocation(
                    location,
                    id
                );

        return {
            id,

            name,

            type:
                registry.type,

            resolvedLocation,

            description:
                registry.description
                    ?.trim() ||
                undefined,

            templates:
                manifest.templates
        };

    }

    private resolveLocalLocation(
        location: string,
        basePath: string
    ): string {

        if (
            path.isAbsolute(
                location
            )
        ) {

            return path.normalize(
                location
            );

        }

        return path.resolve(
            basePath,
            location
        );

    }

    private resolveRemoteLocation(
        location: string,
        registryId: string
    ): string {

        let url:
            URL;

        try {

            url =
                new URL(
                    location
                );

        } catch {

            throw new Error(
                [
                    `Remote registry "${registryId}"`,
                    "has an invalid URL:",
                    location
                ].join(" ")
            );

        }

        if (
            url.protocol !==
                "https:" &&
            url.protocol !==
                "http:"
        ) {

            throw new Error(
                [
                    `Remote registry "${registryId}"`,
                    "must use HTTP or HTTPS."
                ].join(" ")
            );

        }

        return url.toString();

    }

}