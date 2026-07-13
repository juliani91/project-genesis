import { promises as fs } from "fs";
import path from "path";

import {
    RemoteRegistryResponse,
    SerializedRegistryCacheEntry,
    TemplateRegistryManifest
} from "../lib/models";

import {
    TemplateRegistryCacheService
} from "../lib/services";

function createManifest(
    name:
        string = "Official Registry"
): TemplateRegistryManifest {

    return {
        registry: {
            id:
                "official",

            name,

            type:
                "remote",

            location:
                "https://registry.example.com/registry.json"
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
                    "https://registry.example.com/nextjs.zip",

                archiveFormat:
                    "zip"
            }
        ]
    };

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-registry-cache-service-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const cacheDirectory =
        path.join(
            root,
            "cache"
        );

    const service =
        new TemplateRegistryCacheService(
            cacheDirectory
        );

    /*
     * Missing cache.
     */
    const missing =
        await service.read(
            "official"
        );

    if (
        missing.status !==
        "missing"
    ) {

        throw new Error(
            "A nonexistent registry cache was not reported as missing."
        );

    }

    /*
     * Write cache.
     */
    const response:
        RemoteRegistryResponse = {

        sourceUrl:
            "https://registry.example.com/registry.json",

        statusCode:
            200,

        retrievedAt:
            new Date(
                "2026-07-13T15:00:00.000Z"
            ),

        manifest:
            createManifest()
    };

    const written =
        await service.write(
            response
        );

    if (
        written.registryId !==
        "official"
    ) {

        throw new Error(
            "The written cache registry ID was incorrect."
        );

    }

    await fs.access(
        written.cachePath
    );

    /*
     * Read cache.
     */
    const cached =
        await service.read(
            " OFFICIAL "
        );

    if (
        cached.status !==
        "fresh" ||
        !cached.entry
    ) {

        throw new Error(
            "The written registry cache was not read successfully."
        );

    }

    if (
        !(cached.entry.cachedAt instanceof Date)
    ) {

        throw new Error(
            "The cached timestamp was not restored as a Date."
        );

    }

    if (
        cached.entry.cachedAt
            .toISOString() !==
        "2026-07-13T15:00:00.000Z"
    ) {

        throw new Error(
            "The cached timestamp was restored incorrectly."
        );

    }

    if (
        cached.entry.manifest
            .registry
            .name !==
        "Official Registry"
    ) {

        throw new Error(
            "The cached registry manifest was incorrect."
        );

    }

    /*
     * Write an updated manifest.
     */
    const updated =
        await service.write({

            ...response,

            retrievedAt:
                new Date(
                    "2026-07-13T16:00:00.000Z"
                ),

            manifest:
                createManifest(
                    "Updated Official Registry"
                )

        });

    const updatedRead =
        await service.read(
            "official"
        );

    if (
        updatedRead.entry
            ?.manifest
            .registry
            .name !==
        "Updated Official Registry"
    ) {

        throw new Error(
            "The registry cache was not updated."
        );

    }

    if (
        updatedRead.entry
            ?.cachedAt
            .toISOString() !==
        "2026-07-13T16:00:00.000Z"
    ) {

        throw new Error(
            "The updated cache timestamp was incorrect."
        );

    }

    /*
     * Invalid cache JSON.
     */
    await fs.writeFile(
        service.getCachePath(
            "broken"
        ),
        "{ invalid json",
        "utf-8"
    );

    let invalidJsonThrown =
        false;

    try {

        await service.read(
            "broken"
        );

    } catch (error) {

        invalidJsonThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "contains invalid JSON"
            )
        ) {

            throw new Error(
                `Unexpected invalid-cache error: ${message}`
            );

        }

    }

    if (!invalidJsonThrown) {

        throw new Error(
            "Invalid cached registry JSON was accepted."
        );

    }

    /*
     * Invalid cached timestamp.
     */
    const invalidTimestamp:
        SerializedRegistryCacheEntry = {

        registryId:
            "invalid-time",

        sourceUrl:
            response.sourceUrl,

        cachePath:
            service.getCachePath(
                "invalid-time"
            ),

        cachedAt:
            "not-a-date",

        manifest: {
            ...createManifest(),

            registry: {
                ...createManifest()
                    .registry,

                id:
                    "invalid-time"
            }
        }
    };

    await fs.writeFile(
        service.getCachePath(
            "invalid-time"
        ),
        JSON.stringify(
            invalidTimestamp,
            null,
            2
        ),
        "utf-8"
    );

    let invalidTimestampThrown =
        false;

    try {

        await service.read(
            "invalid-time"
        );

    } catch (error) {

        invalidTimestampThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "invalid cachedAt timestamp"
            )
        ) {

            throw new Error(
                `Unexpected timestamp error: ${message}`
            );

        }

    }

    if (!invalidTimestampThrown) {

        throw new Error(
            "An invalid cached timestamp was accepted."
        );

    }

    /*
     * Unsafe registry ID.
     */
    let unsafeIdThrown =
        false;

    try {

        service.getCachePath(
            "../outside"
        );

    } catch {

        unsafeIdThrown =
            true;

    }

    if (!unsafeIdThrown) {

        throw new Error(
            "An unsafe registry cache ID was accepted."
        );

    }

    console.log(
        "Template registry cache service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry cache service test failed.",
            error
        );

        process.exitCode = 1;

    }
);