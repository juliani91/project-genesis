import http from "http";

import {
    ResolvedTemplateRegistry
} from "../lib/models";

import {
    TemplateRemoteRegistryLoader
} from "../lib/services";

async function closeServer(
    server:
        http.Server
): Promise<void> {

    await new Promise<void>(
        (resolve, reject) =>
            server.close(
                (error) =>
                    error
                        ? reject(error)
                        : resolve()
            )
    );

}

async function main(): Promise<void> {

    let responseMode:
        "valid" |
        "wrong-id" |
        "wrong-type" =
        "valid";

    const server =
        http.createServer(
            (_request, response) => {

                const registry =
                    responseMode ===
                        "wrong-id"
                        ? {
                            id:
                                "different-registry",

                            name:
                                "Different Registry",

                            type:
                                "remote",

                            location:
                                "http://localhost"
                        }
                        : responseMode ===
                            "wrong-type"
                            ? {
                                id:
                                    "official",

                                name:
                                    "Official Registry",

                                type:
                                    "local",

                                location:
                                    "templates"
                            }
                            : {
                                id:
                                    "official",

                                name:
                                    "Official Registry",

                                type:
                                    "remote",

                                location:
                                    "http://localhost"
                            };

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );

                response.end(
                    JSON.stringify({
                        registry,

                        templates: [
                            {
                                templateId:
                                    "nextjs",

                                version:
                                    "3.2.0",

                                name:
                                    "Next.js",

                                downloadUrl:
                                    "https://example.com/nextjs.zip",

                                archiveFormat:
                                    "zip"
                            }
                        ]
                    })
                );

            }
        );

    await new Promise<void>(
        (resolve) =>
            server.listen(
                0,
                resolve
            )
    );

    try {

        const address =
            server.address();

        if (
            !address ||
            typeof address ===
                "string"
        ) {

            throw new Error(
                "The temporary HTTP server did not start."
            );

        }

        const registry:
            ResolvedTemplateRegistry = {

            id:
                "official",

            name:
                "Official Registry",

            type:
                "remote",

            resolvedLocation:
                `http://127.0.0.1:${address.port}`,

            templates: []
        };

        const loader =
            new TemplateRemoteRegistryLoader();

        /*
         * Valid remote registry.
         */
        const result =
            await loader.load(
                registry
            );

        if (
            result.source !==
            "network"
        ) {

            throw new Error(
                "The remote loader did not report the network source."
            );

        }

        if (
            result.manifest
                .registry
                .id !==
            "official"
        ) {

            throw new Error(
                "The loaded registry ID was incorrect."
            );

        }

        if (
            result.manifest
                .templates
                .length !==
            1
        ) {

            throw new Error(
                "The loaded remote template count was incorrect."
            );

        }

        /*
         * A local registry cannot use the remote loader.
         */
        let localThrown =
            false;

        try {

            await loader.load({
                ...registry,

                id:
                    "local",

                type:
                    "local"
            });

        } catch (error) {

            localThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "is not a remote registry"
                )
            ) {

                throw new Error(
                    `Unexpected local-registry error: ${message}`
                );

            }

        }

        if (!localThrown) {

            throw new Error(
                "A local registry was accepted by the remote loader."
            );

        }

        /*
         * Remote manifest ID mismatch.
         */
        responseMode =
            "wrong-id";

        let wrongIdThrown =
            false;

        try {

            await loader.load(
                registry
            );

        } catch (error) {

            wrongIdThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "Remote registry ID mismatch"
                )
            ) {

                throw new Error(
                    `Unexpected registry-ID error: ${message}`
                );

            }

        }

        if (!wrongIdThrown) {

            throw new Error(
                "A remote registry ID mismatch was accepted."
            );

        }

        /*
         * Remote endpoint returns a local manifest.
         */
        responseMode =
            "wrong-type";

        let wrongTypeThrown =
            false;

        try {

            await loader.load(
                registry
            );

        } catch (error) {

            wrongTypeThrown =
                true;

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (
                !message.includes(
                    "not marked as remote"
                )
            ) {

                throw new Error(
                    `Unexpected registry-type error: ${message}`
                );

            }

        }

        if (!wrongTypeThrown) {

            throw new Error(
                "A local-type remote manifest was accepted."
            );

        }

        console.log(
            "Template remote registry loader test completed successfully."
        );

    } finally {

        await closeServer(
            server
        );

    }

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template remote registry loader test failed.",
            error
        );

        process.exitCode = 1;

    }
);