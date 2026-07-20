import {
    createHash
} from "crypto";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryPublishManifest
} from "../lib/models";

import {
    RegistryPublishManifestBuilder,
    TemplatePackageHashService,
    TemplatePublishingService
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-publishing-service-test"
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

    const packagePath =
        path.join(
            root,
            "nextjs-4.0.0.zip"
        );

    const packageBytes =
        Buffer.from(
            "Project Genesis template publishing service test.",
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

    const service =
        new TemplatePublishingService(
            new RegistryPublishManifestBuilder(),
            new TemplatePackageHashService()
        );

    /*
     * Publish into a new manifest.
     */
    const first =
        await service.publish({
            templateId:
                " NEXTJS ",

            version:
                "4.0.0",

            packagePath,

            registryId:
                " OFFICIAL "
        });

    if (
        !first.result.success
    ) {

        throw new Error(
            "The template publishing service reported failure."
        );

    }

    if (
        first.result.registryId !==
        "official"
    ) {

        throw new Error(
            "The publish result registry ID was not normalized."
        );

    }

    if (
        first.result.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The publish result template ID was incorrect."
        );

    }

    if (
        first.entry.sha256 !==
        expectedSha256
    ) {

        throw new Error(
            "The publishing service generated the wrong SHA-256."
        );

    }

    if (
        first.entry.packagePath !==
        path.resolve(
            packagePath
        )
    ) {

        throw new Error(
            "The publishing service returned the wrong package path."
        );

    }

    if (
        first.manifest.registryId !==
        "official"
    ) {

        throw new Error(
            "The generated publish manifest registry ID was incorrect."
        );

    }

    if (
        first.manifest.packages.length !==
        1
    ) {

        throw new Error(
            "The published package was not added to the manifest."
        );

    }

    if (
        !(first.result.publishedAt instanceof Date)
    ) {

        throw new Error(
            "The publish result timestamp was not a Date."
        );

    }

    /*
     * Publishing the same package again replaces its entry.
     */
    await fs.writeFile(
        packagePath,
        Buffer.from(
            "Updated package bytes.",
            "utf-8"
        )
    );

    const second =
        await service.publish(
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath,

                registryId:
                    "official"
            },
            first.manifest
        );

    if (
        second.manifest.packages.length !==
        1
    ) {

        throw new Error(
            "Republishing the same version created a duplicate entry."
        );

    }

    if (
        second.entry.sha256 ===
        first.entry.sha256
    ) {

        throw new Error(
            "Republishing did not update the package SHA-256."
        );

    }

    /*
     * Publishing another version preserves the existing one.
     */
    const olderPackagePath =
        path.join(
            root,
            "nextjs-3.5.0.zip"
        );

    await fs.writeFile(
        olderPackagePath,
        Buffer.from(
            "Older Next.js package.",
            "utf-8"
        )
    );

    const third =
        await service.publish(
            {
                templateId:
                    "nextjs",

                version:
                    "3.5.0",

                packagePath:
                    olderPackagePath,

                registryId:
                    "official"
            },
            second.manifest
        );

    if (
        third.manifest.packages.length !==
        2
    ) {

        throw new Error(
            "Publishing another version did not preserve both entries."
        );

    }

    if (
        third.manifest.packages[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "Published package versions were not sorted newest first."
        );

    }

    /*
     * Registry mismatch.
     */
    const wrongManifest:
        RegistryPublishManifest = {

        registryId:
            "internal",

        generatedAt:
            new Date(),

        packages:
            []
    };

    let registryMismatchThrown =
        false;

    try {

        await service.publish(
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath,

                registryId:
                    "official"
            },
            wrongManifest
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
                `Unexpected registry mismatch error: ${message}`
            );

        }

    }

    if (!registryMismatchThrown) {

        throw new Error(
            "A mismatched registry manifest was accepted."
        );

    }

    /*
     * Filename template ID mismatch.
     */
    let templateMismatchThrown =
        false;

    try {

        await service.publish({
            templateId:
                "react",

            version:
                "4.0.0",

            packagePath,

            registryId:
                "official"
        });

    } catch (error) {

        templateMismatchThrown =
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
                `Unexpected template mismatch error: ${message}`
            );

        }

    }

    if (!templateMismatchThrown) {

        throw new Error(
            "A package with a mismatched template ID was accepted."
        );

    }

    /*
     * Filename version mismatch.
     */
    let versionMismatchThrown =
        false;

    try {

        await service.publish({
            templateId:
                "nextjs",

            version:
                "9.9.9",

            packagePath,

            registryId:
                "official"
        });

    } catch (error) {

        versionMismatchThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "version does not match"
            )
        ) {

            throw new Error(
                `Unexpected version mismatch error: ${message}`
            );

        }

    }

    if (!versionMismatchThrown) {

        throw new Error(
            "A package with a mismatched version was accepted."
        );

    }

    /*
     * Missing package.
     */
    let missingPackageThrown =
        false;

    try {

        await service.publish({
            templateId:
                "missing",

            version:
                "1.0.0",

            packagePath:
                path.join(
                    root,
                    "missing-1.0.0.zip"
                ),

            registryId:
                "official"
        });

    } catch (error) {

        missingPackageThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "does not exist"
            )
        ) {

            throw new Error(
                `Unexpected missing-package error: ${message}`
            );

        }

    }

    if (!missingPackageThrown) {

        throw new Error(
            "A missing publish package was accepted."
        );

    }

    console.log(
        "Template publishing request validation verified."
    );

    console.log(
        "Template publishing checksum generation verified."
    );

    console.log(
        "Template publishing manifest update verified."
    );

    console.log(
        "Template publishing replacement behavior verified."
    );

    console.log(
        "Template publishing identity validation verified."
    );

    console.log(
        "Template publishing service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template publishing service test failed.",
            error
        );

        process.exitCode =
            1;

    }
);