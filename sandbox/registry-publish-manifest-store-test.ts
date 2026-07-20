import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryPublishManifest
} from "../lib/models";

import {
    RegistryPublishManifestBuilder,
    RegistryPublishManifestStore
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "registry-publish-manifest-store-test"
        );

    await fs.rm(
        root,
        {
            recursive:
                true,

            force:
                true
        }
    );

    const manifestPath =
        path.join(
            root,
            "registry",
            "publish-manifest.json"
        );

    const builder =
        new RegistryPublishManifestBuilder();

    const store =
        new RegistryPublishManifestStore(
            " OFFICIAL ",
            manifestPath,
            builder
        );

    /*
     * A missing manifest returns an empty manifest.
     */
    const empty =
        await store.read();

    if (
        empty.registryId !==
        "official"
    ) {

        throw new Error(
            "The empty stored manifest had the wrong registry ID."
        );

    }

    if (
        empty.packages.length !==
        0
    ) {

        throw new Error(
            "A missing stored manifest was not empty."
        );

    }

    /*
     * Persist a manifest.
     */
    const packagePath =
        path.join(
            root,
            "packages",
            "nextjs-4.0.0.zip"
        );

    const manifest =
        builder.add(
            empty,
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath,

                sha256:
                    "a".repeat(
                        64
                    ),

                publishedAt:
                    new Date(
                        "2026-07-16T15:00:00.000Z"
                    )
            }
        );

    await store.write(
        manifest
    );

    await fs.access(
        store.getManifestPath()
    );

    const persistedJson =
        JSON.parse(
            await fs.readFile(
                manifestPath,
                "utf-8"
            )
        ) as {
            generatedAt?: unknown;
            packages?: Array<{
                publishedAt?: unknown;
            }>;
        };

    if (
        typeof persistedJson.generatedAt !==
        "string"
    ) {

        throw new Error(
            "The stored generatedAt value was not serialized."
        );

    }

    if (
        typeof persistedJson.packages?.[0]
            ?.publishedAt !==
        "string"
    ) {

        throw new Error(
            "The stored publishedAt value was not serialized."
        );

    }

    /*
     * Read and restore the persisted manifest.
     */
    const restored =
        await store.read();

    if (
        restored.packages.length !==
        1
    ) {

        throw new Error(
            "The persisted publish manifest package was not restored."
        );

    }

    if (
        !(
            restored.generatedAt
            instanceof Date
        )
    ) {

        throw new Error(
            "The restored manifest timestamp was not a Date."
        );

    }

    if (
        !(
            restored.packages[0]
                ?.publishedAt
            instanceof Date
        )
    ) {

        throw new Error(
            "The restored package timestamp was not a Date."
        );

    }

    if (
        restored.packages[0]
            ?.publishedAt
            .toISOString() !==
        "2026-07-16T15:00:00.000Z"
    ) {

        throw new Error(
            "The restored publishedAt value was incorrect."
        );

    }

    /*
     * Update adds another package and persists it.
     */
    const updated =
        await store.update({
            templateId:
                "react",

            version:
                "3.0.0",

            packagePath:
                path.join(
                    root,
                    "packages",
                    "react-3.0.0.zip"
                ),

            sha256:
                "b".repeat(
                    64
                ),

            publishedAt:
                new Date(
                    "2026-07-16T16:00:00.000Z"
                )
        });

    if (
        updated.packages.length !==
        2
    ) {

        throw new Error(
            "The store update did not add the second package."
        );

    }

    const afterUpdate =
        await store.read();

    if (
        afterUpdate.packages.length !==
        2
    ) {

        throw new Error(
            "The updated publish manifest was not persisted."
        );

    }

    /*
     * Updating an existing identity replaces it.
     */
    const replacement =
        await store.update({
            templateId:
                "nextjs",

            version:
                "4.0.0",

            packagePath:
                path.join(
                    root,
                    "replacement",
                    "nextjs-4.0.0.zip"
                ),

            sha256:
                "c".repeat(
                    64
                ),

            publishedAt:
                new Date(
                    "2026-07-16T17:00:00.000Z"
                )
        });

    if (
        replacement.packages.length !==
        2
    ) {

        throw new Error(
            "Replacing a stored publish entry created a duplicate."
        );

    }

    const replacedNextjs =
        replacement.packages.find(
            (entry) =>
                entry.templateId ===
                    "nextjs" &&
                entry.version ===
                    "4.0.0"
        );

    if (
        replacedNextjs?.sha256 !==
        "c".repeat(
            64
        )
    ) {

        throw new Error(
            "The stored publish entry was not replaced."
        );

    }

    /*
     * Writing another registry is rejected.
     */
    const wrongRegistry:
        RegistryPublishManifest = {

        registryId:
            "internal",

        generatedAt:
            new Date(),

        packages:
            []
    };

    let wrongRegistryThrown =
        false;

    try {

        await store.write(
            wrongRegistry
        );

    } catch (error) {

        wrongRegistryThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "another registry"
            )
        ) {

            throw new Error(
                `Unexpected registry-store error: ${message}`
            );

        }

    }

    if (!wrongRegistryThrown) {

        throw new Error(
            "A manifest for another registry was stored."
        );

    }

    /*
     * Invalid JSON is rejected.
     */
    await fs.writeFile(
        manifestPath,
        "{ invalid json",
        "utf-8"
    );

    let invalidJsonThrown =
        false;

    try {

        await store.read();

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
                `Unexpected invalid-JSON error: ${message}`
            );

        }

    }

    if (!invalidJsonThrown) {

        throw new Error(
            "An invalid stored publish manifest was accepted."
        );

    }

    /*
     * No temporary files should remain.
     */
    const manifestDirectory =
        path.dirname(
            manifestPath
        );

    const directoryEntries =
        await fs.readdir(
            manifestDirectory
        );

    if (
        directoryEntries.some(
            (entry) =>
                entry.endsWith(
                    ".tmp"
                )
        )
    ) {

        throw new Error(
            "A temporary publish manifest file remained."
        );

    }

    console.log(
        "Publish manifest missing-file behavior verified."
    );

    console.log(
        "Publish manifest persistence verified."
    );

    console.log(
        "Publish manifest date restoration verified."
    );

    console.log(
        "Publish manifest update behavior verified."
    );

    console.log(
        "Publish manifest store validation verified."
    );

    console.log(
        "Registry publish manifest store test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Registry publish manifest store test failed.",
            error
        );

        process.exitCode =
            1;

    }
);