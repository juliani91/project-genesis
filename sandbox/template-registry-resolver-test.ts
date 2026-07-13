import path from "path";

import {
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryResolver
} from "../lib/services";

function main(): void {

    const resolver =
        new TemplateRegistryResolver();

    const basePath =
        path.join(
            "C:",
            "ProjectGenesis"
        );

    const localManifest:
        TemplateRegistryManifest = {

        registry: {
            id:
                "local",

            name:
                "Local Templates",

            type:
                "local",

            location:
                "templates",

            description:
                " Local template registry. "
        },

        templates: [
            {
                templateId:
                    "project-genesis",

                version:
                    "1.0.0",

                name:
                    "Project Genesis"
            }
        ]
    };

    const localRegistry =
        resolver.resolve(
            localManifest,
            basePath
        );

    const expectedLocalPath =
        path.resolve(
            basePath,
            "templates"
        );

    if (
        localRegistry.resolvedLocation !==
        expectedLocalPath
    ) {

        throw new Error(
            [
                "The local registry path was not resolved correctly.",
                `Expected: ${expectedLocalPath}`,
                `Actual: ${localRegistry.resolvedLocation}`
            ].join(" ")
        );

    }

    if (
        localRegistry.description !==
        "Local template registry."
    ) {

        throw new Error(
            "The registry description was not normalized."
        );

    }

    if (
        localRegistry.templates.length !==
        1
    ) {

        throw new Error(
            "The advertised registry templates were not preserved."
        );

    }

    /*
     * Absolute local paths remain absolute.
     */
    const absoluteLocation =
        path.resolve(
            basePath,
            "external-templates"
        );

    const absoluteRegistry =
        resolver.resolve(
            {
                ...localManifest,

                registry: {
                    ...localManifest.registry,

                    id:
                        "absolute-local",

                    location:
                        absoluteLocation
                }
            },
            basePath
        );

    if (
        absoluteRegistry.resolvedLocation !==
        path.normalize(
            absoluteLocation
        )
    ) {

        throw new Error(
            "An absolute local registry path was changed incorrectly."
        );

    }

    /*
     * Remote URL resolution.
     */
    const remoteRegistry =
        resolver.resolve({

            registry: {
                id:
                    "official",

                name:
                    "Official Registry",

                type:
                    "remote",

                location:
                    "https://registry.example.com/templates"
            },

            templates: []

        });

    if (
        remoteRegistry.resolvedLocation !==
        "https://registry.example.com/templates"
    ) {

        throw new Error(
            [
                "The remote registry URL was not preserved.",
                `Actual: ${remoteRegistry.resolvedLocation}`
            ].join(" ")
        );

    }

    /*
     * Invalid remote URL.
     */
    let invalidUrlThrown =
        false;

    try {

        resolver.resolve({

            registry: {
                id:
                    "invalid-remote",

                name:
                    "Invalid Remote",

                type:
                    "remote",

                location:
                    "not-a-url"
            },

            templates: []

        });

    } catch (error) {

        invalidUrlThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "invalid URL"
            )
        ) {

            throw new Error(
                `Unexpected invalid-URL error: ${message}`
            );

        }

    }

    if (!invalidUrlThrown) {

        throw new Error(
            "An invalid remote registry URL was accepted."
        );

    }

    /*
     * Unsupported remote protocol.
     */
    let protocolThrown =
        false;

    try {

        resolver.resolve({

            registry: {
                id:
                    "ftp-registry",

                name:
                    "FTP Registry",

                type:
                    "remote",

                location:
                    "ftp://registry.example.com"
            },

            templates: []

        });

    } catch (error) {

        protocolThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "must use HTTP or HTTPS"
            )
        ) {

            throw new Error(
                `Unexpected protocol error: ${message}`
            );

        }

    }

    if (!protocolThrown) {

        throw new Error(
            "An unsupported remote registry protocol was accepted."
        );

    }

    console.log(
        "Template registry resolver test completed successfully."
    );

}

main();