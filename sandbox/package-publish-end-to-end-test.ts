import {
    createHash
} from "crypto";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    PackageCommandDispatcher,
    PackagePublishCommand
} from "../lib/commands";

import {
    PackageCommandFormatter,
    RegistryPublishManifestStore,
    TemplatePublishingPipeline
} from "../lib/services";

function calculateSha256(
    content:
        Buffer
): string {

    return createHash(
        "sha256"
    )
        .update(
            content
        )
        .digest(
            "hex"
        );

}

async function fileExists(
    targetPath:
        string
): Promise<boolean> {

    try {

        await fs.access(
            targetPath
        );

        return true;

    } catch {

        return false;

    }

}

async function main(): Promise<void> {

    /*
     * ========================================================
     * Phase 1 – Create an isolated test environment
     * ========================================================
     */

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-publish-end-to-end-test"
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

    const packageDirectory =
        path.join(
            root,
            "packages"
        );

    const registryDirectory =
        path.join(
            root,
            "registry"
        );

    await fs.mkdir(
        packageDirectory,
        {
            recursive:
                true
        }
    );

    await fs.mkdir(
        registryDirectory,
        {
            recursive:
                true
        }
    );

    const registryId =
        "official";

    const manifestPath =
        path.join(
            registryDirectory,
            "publish-manifest.json"
        );

    console.log(
        "Registry initialized successfully."
    );

    /*
     * ========================================================
     * Phase 2 – Create package files
     * ========================================================
     */

    const versionOnePackagePath =
        path.join(
            packageDirectory,
            "nextjs-1.0.0.zip"
        );

    const versionTwoPackagePath =
        path.join(
            packageDirectory,
            "nextjs-2.0.0.zip"
        );

    const versionOneContent =
        Buffer.from(
            [
                "Project Genesis package.",
                "Template: nextjs",
                "Version: 1.0.0"
            ].join("\n"),
            "utf-8"
        );

    const versionTwoContent =
        Buffer.from(
            [
                "Project Genesis package.",
                "Template: nextjs",
                "Version: 2.0.0"
            ].join("\n"),
            "utf-8"
        );

    await fs.writeFile(
        versionOnePackagePath,
        versionOneContent
    );

    await fs.writeFile(
        versionTwoPackagePath,
        versionTwoContent
    );

    const versionOneSha256 =
        calculateSha256(
            versionOneContent
        );

    const versionTwoSha256 =
        calculateSha256(
            versionTwoContent
        );

    if (
        versionOneSha256 ===
        versionTwoSha256
    ) {

        throw new Error(
            "The two package files unexpectedly have the same SHA-256."
        );

    }

    console.log(
        "Package validation verified."
    );

    /*
     * ========================================================
     * Phase 3 – Create the real publishing command
     * ========================================================
     */

    const publishingPipeline =
        new TemplatePublishingPipeline();

    const publishCommand =
        new PackagePublishCommand(
            publishingPipeline,

            (
                requestedRegistryId,
                requestedManifestPath
            ) =>
                new RegistryPublishManifestStore(
                    requestedRegistryId,
                    requestedManifestPath
                )
        );

    /*
     * ========================================================
     * Phase 4 – Publish version 1 directly through the command
     * ========================================================
     */

    const versionOneOutcome =
        await publishCommand.execute({
            templateId:
                "nextjs",

            version:
                "1.0.0",

            packagePath:
                versionOnePackagePath,

            registryId,

            manifestPath
        });

    if (
        !versionOneOutcome.result.success
    ) {

        throw new Error(
            "Publishing version 1 did not report success."
        );

    }

    if (
        versionOneOutcome.entry.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "Version 1 has the wrong template ID."
        );

    }

    if (
        versionOneOutcome.entry.version !==
        "1.0.0"
    ) {

        throw new Error(
            "Version 1 has the wrong version."
        );

    }

    if (
        versionOneOutcome.entry.packagePath !==
        path.resolve(
            versionOnePackagePath
        )
    ) {

        throw new Error(
            "Version 1 has the wrong package path."
        );

    }

    if (
        versionOneOutcome.entry.sha256 !==
        versionOneSha256
    ) {

        throw new Error(
            "Version 1 has the wrong SHA-256."
        );

    }

    if (
        versionOneOutcome.manifest.registryId !==
        registryId
    ) {

        throw new Error(
            "Version 1 produced a manifest with the wrong registry ID."
        );

    }

    if (
        versionOneOutcome.manifest.packages.length !==
        1
    ) {

        throw new Error(
            "The first publish should create exactly one manifest entry."
        );

    }

    if (
        !await fileExists(
            manifestPath
        )
    ) {

        throw new Error(
            "The first publish did not create the manifest file."
        );

    }

    console.log(
        "Publishing pipeline verified."
    );

    console.log(
        "Command execution verified."
    );

    /*
     * ========================================================
     * Phase 5 – Publish version 2 through the CLI dispatcher
     * ========================================================
     */

    const output:
        string[] = [];

    const formatter =
        new PackageCommandFormatter();

    const dispatcher =
        new PackageCommandDispatcher(
            undefined,
            undefined,
            formatter,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,

            (
                value:
                    string
            ) => {

                output.push(
                    value
                );

            },

            publishCommand
        );

    const versionTwoHandled =
        await dispatcher.execute([
            "publish",
            "nextjs",
            "--version",
            "2.0.0",
            "--package",
            versionTwoPackagePath,
            "--registry",
            registryId,
            "--manifest",
            manifestPath
        ]);

    if (!versionTwoHandled) {

        throw new Error(
            "The dispatcher did not recognize the publish command."
        );

    }

    if (
        output.length !==
        1
    ) {

        throw new Error(
            [
                "The dispatcher produced the wrong number of output messages.",
                "Expected: 1",
                `Actual: ${output.length}`
            ].join(" ")
        );

    }

    const versionTwoOutput =
        output[0];

    if (!versionTwoOutput) {

        throw new Error(
            "The dispatcher did not produce formatted output."
        );

    }

    if (
        !versionTwoOutput.includes(
            "Package published successfully."
        )
    ) {

        throw new Error(
            "The dispatcher output did not report a successful publish."
        );

    }

    if (
        !versionTwoOutput.includes(
            "Template : nextjs"
        )
    ) {

        throw new Error(
            "The dispatcher output did not include the template ID."
        );

    }

    if (
        !versionTwoOutput.includes(
            "Version  : 2.0.0"
        )
    ) {

        throw new Error(
            "The dispatcher output did not include version 2.0.0."
        );

    }

    if (
        !versionTwoOutput.includes(
            "Registry : official"
        )
    ) {

        throw new Error(
            "The dispatcher output did not include the registry ID."
        );

    }

    if (
        !versionTwoOutput.includes(
            "SHA-256"
        )
    ) {

        throw new Error(
            "The dispatcher output did not include the SHA-256."
        );

    }

    if (
        !versionTwoOutput.includes(
            "Registry package entries: 2"
        )
    ) {

        throw new Error(
            "The dispatcher output did not report two registry entries."
        );

    }

    console.log(
        "Dispatcher integration verified."
    );

    console.log(
        "Formatter output verified."
    );

    /*
     * ========================================================
     * Phase 6 – Reload the manifest from disk
     * ========================================================
     */

    const reloadedStore =
        new RegistryPublishManifestStore(
            registryId,
            manifestPath
        );

    const manifestAfterVersionTwo =
        await reloadedStore.read();

    if (
        manifestAfterVersionTwo.registryId !==
        registryId
    ) {

        throw new Error(
            "The reloaded manifest has the wrong registry ID."
        );

    }

    if (
        manifestAfterVersionTwo.packages.length !==
        2
    ) {

        throw new Error(
            [
                "The manifest should contain two packages.",
                `Actual: ${manifestAfterVersionTwo.packages.length}`
            ].join(" ")
        );

    }

    const storedVersionOne =
        manifestAfterVersionTwo
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "1.0.0"
            );

    const storedVersionTwo =
        manifestAfterVersionTwo
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "2.0.0"
            );

    if (!storedVersionOne) {

        throw new Error(
            "Version 1.0.0 was not preserved in the manifest."
        );

    }

    if (!storedVersionTwo) {

        throw new Error(
            "Version 2.0.0 was not added to the manifest."
        );

    }

    if (
        storedVersionOne.sha256 !==
        versionOneSha256
    ) {

        throw new Error(
            "The persisted version 1 SHA-256 is incorrect."
        );

    }

    if (
        storedVersionTwo.sha256 !==
        versionTwoSha256
    ) {

        throw new Error(
            "The persisted version 2 SHA-256 is incorrect."
        );

    }

    if (
        !(storedVersionOne.publishedAt instanceof Date)
    ) {

        throw new Error(
            "Version 1 publishedAt was not restored as a Date."
        );

    }

    if (
        !(storedVersionTwo.publishedAt instanceof Date)
    ) {

        throw new Error(
            "Version 2 publishedAt was not restored as a Date."
        );

    }

    console.log(
        "Manifest persistence verified."
    );

    /*
     * ========================================================
     * Phase 7 – Republish version 2 with different contents
     * ========================================================
     */

    const replacementVersionTwoContent =
        Buffer.from(
            [
                "Project Genesis replacement package.",
                "Template: nextjs",
                "Version: 2.0.0",
                "Revision: replacement"
            ].join("\n"),
            "utf-8"
        );

    const replacementVersionTwoSha256 =
        calculateSha256(
            replacementVersionTwoContent
        );

    await fs.writeFile(
        versionTwoPackagePath,
        replacementVersionTwoContent
    );

    const replacementOutcome =
        await publishCommand.execute({
            templateId:
                "nextjs",

            version:
                "2.0.0",

            packagePath:
                versionTwoPackagePath,

            registryId,

            manifestPath
        });

    if (
        !replacementOutcome.result.success
    ) {

        throw new Error(
            "Republishing version 2 did not report success."
        );

    }

    if (
        replacementOutcome.manifest.packages.length !==
        2
    ) {

        throw new Error(
            "Republishing version 2 created a duplicate manifest entry."
        );

    }

    if (
        replacementOutcome.entry.sha256 !==
        replacementVersionTwoSha256
    ) {

        throw new Error(
            "Republishing version 2 did not calculate the new SHA-256."
        );

    }

    const manifestAfterReplacement =
        await reloadedStore.read();

    if (
        manifestAfterReplacement.packages.length !==
        2
    ) {

        throw new Error(
            "The persisted replacement created a duplicate entry."
        );

    }

    const persistedVersionOneAfterReplacement =
        manifestAfterReplacement
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "1.0.0"
            );

    const persistedVersionTwoAfterReplacement =
        manifestAfterReplacement
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "2.0.0"
            );

    if (!persistedVersionOneAfterReplacement) {

        throw new Error(
            "Version 1 disappeared after replacing version 2."
        );

    }

    if (!persistedVersionTwoAfterReplacement) {

        throw new Error(
            "Version 2 disappeared after being replaced."
        );

    }

    if (
        persistedVersionOneAfterReplacement.sha256 !==
        versionOneSha256
    ) {

        throw new Error(
            "Replacing version 2 unexpectedly changed version 1."
        );

    }

    if (
        persistedVersionTwoAfterReplacement.sha256 !==
        replacementVersionTwoSha256
    ) {

        throw new Error(
            "The replacement SHA-256 was not persisted."
        );

    }

    console.log(
        "Package replacement verified."
    );

    /*
     * ========================================================
     * Phase 8 – Attempt an invalid publish
     * ========================================================
     */

    const manifestBeforeFailure =
        await reloadedStore.read();

    const invalidPackagePath =
        path.join(
            packageDirectory,
            "incorrect-package-name.zip"
        );

    await fs.writeFile(
        invalidPackagePath,
        Buffer.from(
            "This package filename does not match the requested identity.",
            "utf-8"
        )
    );

    let invalidPublishThrown =
        false;

    try {

        await publishCommand.execute({
            templateId:
                "nextjs",

            version:
                "3.0.0",

            packagePath:
                invalidPackagePath,

            registryId,

            manifestPath
        });

    } catch (error) {

        invalidPublishThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.toLowerCase()
                .includes(
                    "package"
                )
        ) {

            throw new Error(
                `Unexpected invalid publish error: ${message}`
            );

        }

    }

    if (!invalidPublishThrown) {

        throw new Error(
            "The invalid package publish did not fail."
        );

    }

    const manifestAfterFailure =
        await reloadedStore.read();

    if (
        manifestAfterFailure.packages.length !==
        manifestBeforeFailure.packages.length
    ) {

        throw new Error(
            "The failed publish changed the number of manifest entries."
        );

    }

    const versionOneAfterFailure =
        manifestAfterFailure
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "1.0.0"
            );

    const versionTwoAfterFailure =
        manifestAfterFailure
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "2.0.0"
            );

    if (
        versionOneAfterFailure?.sha256 !==
        versionOneSha256
    ) {

        throw new Error(
            "The failed publish modified version 1."
        );

    }

    if (
        versionTwoAfterFailure?.sha256 !==
        replacementVersionTwoSha256
    ) {

        throw new Error(
            "The failed publish modified version 2."
        );

    }

    console.log(
        "Failure rollback verified."
    );

    /*
     * ========================================================
     * Phase 9 – Create a completely new store and reload again
     * ========================================================
     */

    const finalStore =
        new RegistryPublishManifestStore(
            registryId,
            manifestPath
        );

    const finalManifest =
        await finalStore.read();

    if (
        finalManifest.registryId !==
        registryId
    ) {

        throw new Error(
            "The final registry reload returned the wrong registry ID."
        );

    }

    if (
        finalManifest.packages.length !==
        2
    ) {

        throw new Error(
            "The final registry reload did not contain two packages."
        );

    }

    const finalVersionOne =
        finalManifest
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "1.0.0"
            );

    const finalVersionTwo =
        finalManifest
            .packages
            .find(
                (entry) =>
                    entry.templateId ===
                        "nextjs" &&
                    entry.version ===
                        "2.0.0"
            );

    if (!finalVersionOne) {

        throw new Error(
            "The final reload could not find version 1."
        );

    }

    if (!finalVersionTwo) {

        throw new Error(
            "The final reload could not find version 2."
        );

    }

    if (
        finalVersionOne.packagePath !==
        path.resolve(
            versionOnePackagePath
        )
    ) {

        throw new Error(
            "The final version 1 package path is incorrect."
        );

    }

    if (
        finalVersionTwo.packagePath !==
        path.resolve(
            versionTwoPackagePath
        )
    ) {

        throw new Error(
            "The final version 2 package path is incorrect."
        );

    }

    if (
        finalVersionOne.sha256 !==
        versionOneSha256
    ) {

        throw new Error(
            "The final version 1 SHA-256 is incorrect."
        );

    }

    if (
        finalVersionTwo.sha256 !==
        replacementVersionTwoSha256
    ) {

        throw new Error(
            "The final version 2 SHA-256 is incorrect."
        );

    }

    console.log(
        "Registry reload verified."
    );

    console.log(
        "Package publishing end-to-end workflow completed successfully."
    );

}

main().catch(
    (
        error:
            unknown
    ) => {

        console.error(
            "Package publishing end-to-end workflow failed.",
            error
        );

        process.exitCode =
            1;

    }
);