import {
    createHash
} from "crypto";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    PackagePublishCommand
} from "../lib/commands";

import {
    RegistryPublishManifestStore,
    TemplatePublishingPipeline
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-publish-command-test"
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

    await fs.mkdir(
        root,
        {
            recursive:
                true
        }
    );

    const packageDirectory =
        path.join(
            root,
            "packages"
        );

    await fs.mkdir(
        packageDirectory,
        {
            recursive:
                true
        }
    );

    const packagePath =
        path.join(
            packageDirectory,
            "nextjs-4.0.0.zip"
        );

    const packageBytes =
        Buffer.from(
            "Project Genesis package publish command test.",
            "utf-8"
        );

    await fs.writeFile(
        packagePath,
        packageBytes
    );

    const expectedSha256 =
        createHash(
            "sha256"
        )
            .update(
                packageBytes
            )
            .digest(
                "hex"
            );

    const manifestPath =
        path.join(
            root,
            "registry",
            "publish-manifest.json"
        );

    const createdStores:
        RegistryPublishManifestStore[] = [];

    const command =
        new PackagePublishCommand(
            new TemplatePublishingPipeline(),

            (
                registryId,
                requestedManifestPath
            ) => {

                const store =
                    new RegistryPublishManifestStore(
                        registryId,
                        requestedManifestPath
                    );

                createdStores.push(
                    store
                );

                return store;

            }
        );

    /*
     * Execute the publish command.
     */
    const outcome =
        await command.execute({
            templateId:
                " NEXTJS ",

            version:
                "4.0.0",

            packagePath:
                packagePath,

            registryId:
                " OFFICIAL ",

            manifestPath:
                manifestPath
        });

    if (
        !outcome.result.success
    ) {

        throw new Error(
            "The package publish command reported failure."
        );

    }

    if (
        outcome.result.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The package publish command returned the wrong template ID."
        );

    }

    if (
        outcome.result.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The package publish command returned the wrong version."
        );

    }

    if (
        outcome.result.registryId !==
        "official"
    ) {

        throw new Error(
            "The package publish command did not normalize the registry ID."
        );

    }

    if (
        outcome.entry.packagePath !==
        path.resolve(
            packagePath
        )
    ) {

        throw new Error(
            "The package publish command did not resolve the package path."
        );

    }

    if (
        outcome.entry.sha256 !==
        expectedSha256
    ) {

        throw new Error(
            "The package publish command returned the wrong SHA-256."
        );

    }

    if (
        outcome.manifest.packages.length !==
        1
    ) {

        throw new Error(
            "The package publish command did not update the manifest."
        );

    }

    /*
     * Confirm that the command created exactly one store.
     */
    if (
        createdStores.length !==
        1
    ) {

        throw new Error(
            [
                "The package publish command created the wrong number of manifest stores.",
                "Expected: 1",
                `Actual: ${createdStores.length}`
            ].join(" ")
        );

    }

    const createdStore =
        createdStores[0];

    if (!createdStore) {

        throw new Error(
            "The package publish command did not create a manifest store."
        );

    }

    if (
        createdStore.getManifestPath() !==
        path.resolve(
            manifestPath
        )
    ) {

        throw new Error(
            "The command passed the wrong manifest path to the store."
        );

    }

    /*
     * Confirm that the manifest was persisted.
     */
    await fs.access(
        manifestPath
    );

    const persistedManifest =
        await createdStore.read();

    if (
        persistedManifest.registryId !==
        "official"
    ) {

        throw new Error(
            "The command persisted the wrong registry ID."
        );

    }

    if (
        persistedManifest.packages.length !==
        1
    ) {

        throw new Error(
            "The command did not persist the published package."
        );

    }

    if (
        persistedManifest.packages[0]
            ?.sha256 !==
        expectedSha256
    ) {

        throw new Error(
            "The command persisted the wrong package SHA-256."
        );

    }

    /*
     * Execute again with updated package contents.
     * The same identity must be replaced rather than duplicated.
     */
    const replacementBytes =
        Buffer.from(
            "Updated Project Genesis publish command package.",
            "utf-8"
        );

    await fs.writeFile(
        packagePath,
        replacementBytes
    );

    const expectedReplacementSha256 =
        createHash(
            "sha256"
        )
            .update(
                replacementBytes
            )
            .digest(
                "hex"
            );

    const replacement =
        await command.execute({
            templateId:
                "nextjs",

            version:
                "4.0.0",

            packagePath,

            registryId:
                "official",

            manifestPath
        });

    if (
        replacement.manifest.packages.length !==
        1
    ) {

        throw new Error(
            "Republishing through the command created a duplicate."
        );

    }

    if (
        replacement.entry.sha256 !==
        expectedReplacementSha256
    ) {

        throw new Error(
            "Republishing through the command did not update the SHA-256."
        );

    }

    const replacementStore =
        createdStores[1];

    if (!replacementStore) {

        throw new Error(
            "The replacement publish did not create a manifest store."
        );

    }

    const persistedReplacement =
        await replacementStore.read();

    if (
        persistedReplacement.packages[0]
            ?.sha256 !==
        expectedReplacementSha256
    ) {

        throw new Error(
            "The replacement publish entry was not persisted."
        );

    }

    /*
     * Required command arguments.
     */
    let missingTemplateIdThrown =
        false;

    try {

        await command.execute({
            templateId:
                "",

            version:
                "4.0.0",

            packagePath,

            registryId:
                "official",

            manifestPath
        });

    } catch (error) {

        missingTemplateIdThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Template ID is required"
            )
        ) {

            throw new Error(
                `Unexpected missing-template error: ${message}`
            );

        }

    }

    if (!missingTemplateIdThrown) {

        throw new Error(
            "The publish command accepted a missing template ID."
        );

    }

    let missingVersionThrown =
        false;

    try {

        await command.execute({
            templateId:
                "nextjs",

            version:
                "",

            packagePath,

            registryId:
                "official",

            manifestPath
        });

    } catch (error) {

        missingVersionThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Template version is required"
            )
        ) {

            throw new Error(
                `Unexpected missing-version error: ${message}`
            );

        }

    }

    if (!missingVersionThrown) {

        throw new Error(
            "The publish command accepted a missing version."
        );

    }

    let missingRegistryIdThrown =
        false;

    try {

        await command.execute({
            templateId:
                "nextjs",

            version:
                "4.0.0",

            packagePath,

            registryId:
                "",

            manifestPath
        });

    } catch (error) {

        missingRegistryIdThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Registry ID is required"
            )
        ) {

            throw new Error(
                `Unexpected missing-registry error: ${message}`
            );

        }

    }

    if (!missingRegistryIdThrown) {

        throw new Error(
            "The publish command accepted a missing registry ID."
        );

    }

    let missingPackagePathThrown =
        false;

    try {

        await command.execute({
            templateId:
                "nextjs",

            version:
                "4.0.0",

            packagePath:
                "",

            registryId:
                "official",

            manifestPath
        });

    } catch (error) {

        missingPackagePathThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Package path is required"
            )
        ) {

            throw new Error(
                `Unexpected missing-package-path error: ${message}`
            );

        }

    }

    if (!missingPackagePathThrown) {

        throw new Error(
            "The publish command accepted a missing package path."
        );

    }

    console.log(
        "Package publish command argument handling verified."
    );

    console.log(
        "Package publish command path resolution verified."
    );

    console.log(
        "Package publish command pipeline execution verified."
    );

    console.log(
        "Package publish command manifest persistence verified."
    );

    console.log(
        "Package publish command replacement behavior verified."
    );

    console.log(
        "Package publish command test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Package publish command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);