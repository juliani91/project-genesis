import {
    createHash
} from "crypto";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryPublishManifestBuilder,
    RegistryPublishManifestStore,
    TemplatePackageHashService,
    TemplatePublishingPipeline,
    TemplatePublishingService,
    TemplatePublishValidationService
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-publishing-pipeline-test"
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

    const manifestPath =
        path.join(
            root,
            "registry",
            "publish-manifest.json"
        );

    const builder =
        new RegistryPublishManifestBuilder();

    const manifestStore =
        new RegistryPublishManifestStore(
            "official",
            manifestPath,
            builder
        );

    const publishingService =
        new TemplatePublishingService(
            builder,
            new TemplatePackageHashService(),
            new TemplatePublishValidationService()
        );

    const pipeline =
        new TemplatePublishingPipeline(
            publishingService
        );

    /*
     * Publish the first package.
     */
    const firstPackagePath =
        path.join(
            packageDirectory,
            "nextjs-4.0.0.zip"
        );

    const firstPackageBytes =
        Buffer.from(
            "Project Genesis publishing pipeline package one.",
            "utf-8"
        );

    await fs.writeFile(
        firstPackagePath,
        firstPackageBytes
    );

    const expectedFirstSha256 =
        createHash(
            "sha256"
        )
            .update(
                firstPackageBytes
            )
            .digest(
                "hex"
            );

    const firstOutcome =
        await pipeline.execute(
            {
                templateId:
                    " NEXTJS ",

                version:
                    "4.0.0",

                packagePath:
                    firstPackagePath,

                registryId:
                    " OFFICIAL "
            },
            manifestStore
        );

    if (
        !firstOutcome.result.success
    ) {

        throw new Error(
            "The publishing pipeline reported failure."
        );

    }

    if (
        firstOutcome.result.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The publishing pipeline did not normalize the template ID."
        );

    }

    if (
        firstOutcome.result.registryId !==
        "official"
    ) {

        throw new Error(
            "The publishing pipeline did not normalize the registry ID."
        );

    }

    if (
        firstOutcome.entry.sha256 !==
        expectedFirstSha256
    ) {

        throw new Error(
            "The publishing pipeline generated the wrong SHA-256."
        );

    }

    if (
        firstOutcome.manifest.packages.length !==
        1
    ) {

        throw new Error(
            "The first package was not added to the publish manifest."
        );

    }

    /*
     * Confirm the manifest was actually persisted.
     */
    await fs.access(
        manifestPath
    );

    const persistedFirstManifest =
        await manifestStore.read();

    if (
        persistedFirstManifest.packages.length !==
        1
    ) {

        throw new Error(
            "The first publishing pipeline manifest was not persisted."
        );

    }

    if (
        persistedFirstManifest.packages[0]
            ?.sha256 !==
        expectedFirstSha256
    ) {

        throw new Error(
            "The persisted first package SHA-256 was incorrect."
        );

    }

    /*
     * Publish a second version.
     */
    const secondPackagePath =
        path.join(
            packageDirectory,
            "nextjs-3.5.0.zip"
        );

    await fs.writeFile(
        secondPackagePath,
        Buffer.from(
            "Project Genesis publishing pipeline package two.",
            "utf-8"
        )
    );

    const secondOutcome =
        await pipeline.execute(
            {
                templateId:
                    "nextjs",

                version:
                    "3.5.0",

                packagePath:
                    secondPackagePath,

                registryId:
                    "official"
            },
            manifestStore
        );

    if (
        secondOutcome.manifest.packages.length !==
        2
    ) {

        throw new Error(
            "Publishing another version did not preserve both packages."
        );

    }

    if (
        secondOutcome.manifest.packages[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The persisted package versions were not sorted correctly."
        );

    }

    if (
        secondOutcome.manifest.packages[1]
            ?.version !==
        "3.5.0"
    ) {

        throw new Error(
            "The older package version was not stored correctly."
        );

    }

    /*
     * Republish the first version with different contents.
     */
    const replacementBytes =
        Buffer.from(
            "Project Genesis replacement package bytes.",
            "utf-8"
        );

    await fs.writeFile(
        firstPackagePath,
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

    const replacementOutcome =
        await pipeline.execute(
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath:
                    firstPackagePath,

                registryId:
                    "official"
            },
            manifestStore
        );

    if (
        replacementOutcome.manifest.packages.length !==
        2
    ) {

        throw new Error(
            "Republishing an existing version created a duplicate."
        );

    }

    const replacedEntry =
        replacementOutcome.manifest.packages.find(
            (entry) =>
                entry.templateId ===
                    "nextjs" &&
                entry.version ===
                    "4.0.0"
        );

    if (
        replacedEntry?.sha256 !==
        expectedReplacementSha256
    ) {

        throw new Error(
            "Republishing did not replace the existing package entry."
        );

    }

    const persistedReplacement =
        await manifestStore.read();

    const persistedReplacedEntry =
        persistedReplacement.packages.find(
            (entry) =>
                entry.templateId ===
                    "nextjs" &&
                entry.version ===
                    "4.0.0"
        );

    if (
        persistedReplacedEntry?.sha256 !==
        expectedReplacementSha256
    ) {

        throw new Error(
            "The replacement package entry was not persisted."
        );

    }

    /*
     * Invalid publishing must not overwrite the manifest.
     */
    const manifestBeforeFailure =
        await fs.readFile(
            manifestPath,
            "utf-8"
        );

    let invalidRequestThrown =
        false;

    try {

        await pipeline.execute(
            {
                templateId:
                    "react",

                version:
                    "4.0.0",

                packagePath:
                    firstPackagePath,

                registryId:
                    "official"
            },
            manifestStore
        );

    } catch (error) {

        invalidRequestThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "template ID does not match"
            )
        ) {

            throw new Error(
                `Unexpected publishing-pipeline validation error: ${message}`
            );

        }

    }

    if (!invalidRequestThrown) {

        throw new Error(
            "The publishing pipeline accepted an invalid request."
        );

    }

    const manifestAfterFailure =
        await fs.readFile(
            manifestPath,
            "utf-8"
        );

    if (
        manifestAfterFailure !==
        manifestBeforeFailure
    ) {

        throw new Error(
            "A failed publish request modified the persisted manifest."
        );

    }

    /*
     * A mismatched store registry must fail.
     */
    const internalManifestStore =
        new RegistryPublishManifestStore(
            "internal",
            path.join(
                root,
                "internal-registry",
                "publish-manifest.json"
            ),
            builder
        );

    let registryMismatchThrown =
        false;

    try {

        await pipeline.execute(
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath:
                    firstPackagePath,

                registryId:
                    "official"
            },
            internalManifestStore
        );

    } catch (error) {

        registryMismatchThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "does not match the manifest registry"
            )
        ) {

            throw new Error(
                `Unexpected pipeline registry error: ${message}`
            );

        }

    }

    if (!registryMismatchThrown) {

        throw new Error(
            "The publishing pipeline accepted a mismatched manifest store."
        );

    }

    /*
     * Confirm no temporary manifest files remain.
     */
    const manifestDirectory =
        path.dirname(
            manifestPath
        );

    const manifestFiles =
        await fs.readdir(
            manifestDirectory
        );

    if (
        manifestFiles.some(
            (fileName) =>
                fileName.endsWith(
                    ".tmp"
                )
        )
    ) {

        throw new Error(
            "A temporary publish manifest file remained after the pipeline."
        );

    }

    console.log(
        "Publishing pipeline request processing verified."
    );

    console.log(
        "Publishing pipeline checksum generation verified."
    );

    console.log(
        "Publishing pipeline manifest persistence verified."
    );

    console.log(
        "Publishing pipeline replacement behavior verified."
    );

    console.log(
        "Publishing pipeline failure safety verified."
    );

    console.log(
        "Template publishing pipeline test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template publishing pipeline test failed.",
            error
        );

        process.exitCode =
            1;

    }
);