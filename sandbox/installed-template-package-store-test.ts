import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage
} from "../lib/models";

import {
    InstalledTemplatePackageStore
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "installed-template-package-store-test"
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

    const storePath =
        path.join(
            root,
            "installed",
            "packages.json"
        );

    const store =
        new InstalledTemplatePackageStore(
            storePath
        );

    /*
     * Missing store returns an empty collection.
     */
    const empty =
        await store.read();

    if (
        empty.packages.length !==
        0
    ) {

        throw new Error(
            "A missing installed-package store was not empty."
        );

    }

    const firstPackage:
        InstalledTemplatePackage = {

        templateId:
            " NextJS ",

        version:
            "4.0.0",

        installPath:
            path.join(
                root,
                "templates",
                "nextjs",
                "4.0.0"
            ),

        sha256:
            "A".repeat(
                64
            ),

        source:
            " https://registry.example.com ",

        installedAt:
            new Date(
                "2026-07-15T09:00:00.000Z"
            )

    };

    /*
     * Install the first package.
     */
    const installed =
        await store.install(
            firstPackage
        );

    if (
        installed.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The installed template ID was not normalized."
        );

    }

    if (
        installed.sha256 !==
        "a".repeat(
            64
        )
    ) {

        throw new Error(
            "The installed SHA-256 was not normalized."
        );

    }

    if (
        installed.source !==
        "https://registry.example.com"
    ) {

        throw new Error(
            "The installed package source was not normalized."
        );

    }

    await fs.access(
        store.getStorePath()
    );

    /*
     * Read the persisted package.
     */
    const persisted =
        await store.read();

    if (
        persisted.packages.length !==
        1
    ) {

        throw new Error(
            "The installed package was not persisted."
        );

    }

    const persistedFirst =
        persisted.packages[0];

    if (!persistedFirst) {

        throw new Error(
            "The persisted installed package was missing."
        );

    }

    if (
        !(
            persistedFirst.installedAt
            instanceof Date
        )
    ) {

        throw new Error(
            "The persisted installation timestamp was not restored as a Date."
        );

    }

    if (
        persistedFirst.installedAt
            .toISOString() !==
        "2026-07-15T09:00:00.000Z"
    ) {

        throw new Error(
            "The persisted installation timestamp was incorrect."
        );

    }

    /*
     * Reinstalling the same ID and version updates
     * rather than duplicates the record.
     */
    await store.install({
        ...installed,

        source:
            "https://updated.example.com",

        installedAt:
            new Date(
                "2026-07-15T10:00:00.000Z"
            )
    });

    const updated =
        await store.read();

    if (
        updated.packages.length !==
        1
    ) {

        throw new Error(
            "Reinstalling the same package created a duplicate."
        );

    }

    if (
        updated.packages[0]
            ?.source !==
        "https://updated.example.com"
    ) {

        throw new Error(
            "The existing installed package was not updated."
        );

    }

    /*
     * Install another version.
     */
    await store.install({
        ...installed,

        version:
            "4.1.0",

        installPath:
            path.join(
                root,
                "templates",
                "nextjs",
                "4.1.0"
            ),

        installedAt:
            new Date(
                "2026-07-15T11:00:00.000Z"
            )
    });

    const multipleVersions =
        await store.findById(
            " NEXTJS "
        );

    if (
        multipleVersions.length !==
        2
    ) {

        throw new Error(
            "Installed versions were not returned by template ID."
        );

    }

    if (
        multipleVersions[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "Installed package records were not sorted correctly."
        );

    }

    /*
     * Remove one version.
     */
    const removed =
        await store.remove(
            "nextjs",
            "4.0.0"
        );

    if (!removed) {

        throw new Error(
            "The installed package was not removed."
        );

    }

    const afterRemoval =
        await store.findById(
            "nextjs"
        );

    if (
        afterRemoval.length !==
        1 ||
        afterRemoval[0]
            ?.version !==
        "4.1.0"
    ) {

        throw new Error(
            "The wrong installed package remained after removal."
        );

    }

    /*
     * Removing a missing package returns false.
     */
    const missingRemoval =
        await store.remove(
            "nextjs",
            "9.9.9"
        );

    if (missingRemoval) {

        throw new Error(
            "Removing a missing installed package returned true."
        );

    }

    /*
     * Invalid SHA-256 is rejected.
     */
    let invalidShaThrown =
        false;

    try {

        await store.install({
            ...installed,

            templateId:
                "invalid-sha",

            sha256:
                "invalid"
        });

    } catch (error) {

        invalidShaThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "invalid SHA-256"
            )
        ) {

            throw new Error(
                `Unexpected invalid-SHA error: ${message}`
            );

        }

    }

    if (!invalidShaThrown) {

        throw new Error(
            "An installed package with an invalid SHA-256 was accepted."
        );

    }

    /*
     * Invalid store JSON is rejected.
     */
    await fs.writeFile(
        storePath,
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
                `Unexpected invalid-store error: ${message}`
            );

        }

    }

    if (!invalidJsonThrown) {

        throw new Error(
            "An invalid installed-package store was accepted."
        );

    }

    console.log(
        "Installed template package store test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Installed template package store test failed.",
            error
        );

        process.exitCode =
            1;

    }
);