import http from "http";

import {
    TemplateRegistryHttpClient
} from "../lib/services";

async function main(): Promise<void> {

    const server =
        http.createServer(
            (_request, response) => {

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );

                response.end(
                    JSON.stringify({
                        registry: {
                            id:
                                "official",

                            name:
                                "Official Registry",

                            type:
                                "remote",

                            location:
                                "http://localhost"
                        },

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

    const url =
        `http://127.0.0.1:${address.port}`;

    const client =
        new TemplateRegistryHttpClient();

    const response =
        await client.fetchManifest(
            url
        );

    if (
        response.statusCode !==
        200
    ) {

        throw new Error(
            "The HTTP status code was incorrect."
        );

    }

    if (
        !(response.retrievedAt instanceof Date)
    ) {

        throw new Error(
            "The retrieval timestamp was not a Date."
        );

    }

    if (
        response.manifest.registry.id !==
        "official"
    ) {

        throw new Error(
            "The registry ID was incorrect."
        );

    }

    if (
        response.manifest.templates.length !==
        1
    ) {

        throw new Error(
            "The registry template count was incorrect."
        );

    }

    await new Promise<void>(
        (resolve, reject) =>
            server.close(
                (error) =>
                    error
                        ? reject(error)
                        : resolve()
            )
    );

    console.log(
        "Template registry HTTP client test completed successfully."
    );

}

main().catch(
    async (error: unknown) => {

        console.error(
            "Template registry HTTP client test failed.",
            error
        );

        process.exitCode = 1;

    }
);