import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryPublishManifest
} from "../lib/models";

import {
    TemplatePublishValidationService
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-publish-validation-service-test"
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
            "Template publish validation service test.",
            "utf-8"
        );

    await fs.writeFile(
        packagePath,
        packageBytes
    );

    const service =
        new TemplatePublishValidationService();

    /*
     * Valid request.
     */
    const valid =
        await service.validate({
            templateId:
                " NEXTJS ",

            version:
                "4.0.0",

            packagePath,

            registryId:
                " OFFICIAL "
        });

    if (
        !valid.valid
    ) {

        throw new Error(
            [
                "A valid publish request was rejected.",
                ...valid.errors
            ].join(" ")
        );

    }

    if (
        valid.errors.length !==
        0
    ) {

        throw new Error(
            "A valid publish request contained validation errors."
        );

    }

    if (
        valid.normalizedRequest
            ?.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The validated template ID was not normalized."
        );

    }

    if (
        valid.normalizedRequest
            ?.registryId !==
        "official"
    ) {

        throw new Error(
            "The validated registry ID was not normalized."
        );

    }

    if (
        valid.normalizedRequest
            ?.packagePath !==
        path.resolve(
            packagePath
        )
    ) {

        throw new Error(
            "The validated package path was not normalized."
        );

    }

    if (
        valid.packageSizeBytes !==
        packageBytes.byteLength
    ) {

        throw new Error(
            "The validated package size was incorrect."
        );

    }

    /*
     * Matching existing manifest.
     */
    const matchingManifest:
        RegistryPublishManifest = {

        registryId:
            "official",

        generatedAt:
            new Date(),

        packages:
            []
    };

    const validatedOrThrow =
        await service.validateOrThrow(
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath,

                registryId:
                    "official"
            },
            matchingManifest
        );

    if (
        validatedOrThrow.request.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "validateOrThrow returned the wrong normalized request."
        );

    }

    /*
     * Collect multiple request errors.
     */
    const invalid =
        await service.validate({
            templateId:
                "Invalid Template!",

            version:
                "",

            packagePath:
                path.join(
                    root,
                    "missing-package.tar"
                ),

            registryId:
                "Invalid Registry!"
        });

    if (
        invalid.valid
    ) {

        throw new Error(
            "An invalid publish request was accepted."
        );

    }

    const expectedInvalidErrors = [
        "Template ID contains unsupported characters",
        "Template version is required",
        "Registry ID contains unsupported characters",
        "must use the .zip extension",
        "does not exist"
    ];

    for (
        const expected
        of expectedInvalidErrors
    ) {

        if (
            !invalid.errors.some(
                (error) =>
                    error.includes(
                        expected
                    )
            )
        ) {

            throw new Error(
                `Publish validation errors were missing: ${expected}`
            );

        }

    }

    /*
     * Template ID mismatch.
     */
    const templateMismatch =
        await service.validate({
            templateId:
                "react",

            version:
                "4.0.0",

            packagePath,

            registryId:
                "official"
        });

    if (
        !templateMismatch.errors.some(
            (error) =>
                error.includes(
                    "template ID does not match"
                )
        )
    ) {

        throw new Error(
            "The package filename template-ID mismatch was not detected."
        );

    }

    /*
     * Version mismatch.
     */
    const versionMismatch =
        await service.validate({
            templateId:
                "nextjs",

            version:
                "9.9.9",

            packagePath,

            registryId:
                "official"
        });

    if (
        !versionMismatch.errors.some(
            (error) =>
                error.includes(
                    "version does not match"
                )
        )
    ) {

        throw new Error(
            "The package filename version mismatch was not detected."
        );

    }

    /*
     * Invalid filename format.
     */
    const invalidNamePath =
        path.join(
            root,
            "invalid-package-name.zip"
        );

    await fs.writeFile(
        invalidNamePath,
        "invalid filename",
        "utf-8"
    );

    const invalidName =
        await service.validate({
            templateId:
                "invalid-package-name",

            version:
                "1.0.0",

            packagePath:
                invalidNamePath,

            registryId:
                "official"
        });

    if (
        !invalidName.errors.some(
            (error) =>
                error.includes(
                    "filename must follow"
                )
        )
    ) {

        throw new Error(
            "An invalid package filename format was accepted."
        );

    }

    /*
     * Registry mismatch.
     */
    const registryMismatch =
        await service.validate(
            {
                templateId:
                    "nextjs",

                version:
                    "4.0.0",

                packagePath,

                registryId:
                    "official"
            },
            {
                registryId:
                    "internal",

                generatedAt:
                    new Date(),

                packages:
                    []
            }
        );

    if (
        !registryMismatch.errors.some(
            (error) =>
                error.includes(
                    "does not match the manifest registry"
                )
        )
    ) {

        throw new Error(
            "A registry manifest mismatch was not detected."
        );

    }

    /*
     * Empty package.
     */
    const emptyPackagePath =
        path.join(
            root,
            "empty-1.0.0.zip"
        );

    await fs.writeFile(
        emptyPackagePath,
        Buffer.alloc(
            0
        )
    );

    const emptyPackage =
        await service.validate({
            templateId:
                "empty",

            version:
                "1.0.0",

            packagePath:
                emptyPackagePath,

            registryId:
                "official"
        });

    if (
        !emptyPackage.errors.some(
            (error) =>
                error.includes(
                    "package is empty"
                )
        )
    ) {

        throw new Error(
            "An empty publish package was accepted."
        );

    }

    /*
     * validateOrThrow aggregates validation errors.
     */
    let validationThrown =
        false;

    try {

        await service.validateOrThrow({
            templateId:
                "",

            version:
                "",

            packagePath:
                "",

            registryId:
                ""
        });

    } catch (error) {

        validationThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Template publish validation failed"
            ) ||
            !message.includes(
                "Template ID is required"
            ) ||
            !message.includes(
                "Package path is required"
            )
        ) {

            throw new Error(
                `Unexpected validation exception: ${message}`
            );

        }

    }

    if (!validationThrown) {

        throw new Error(
            "validateOrThrow accepted an invalid publish request."
        );

    }

    console.log(
        "Publish request normalization verified."
    );

    console.log(
        "Publish package file validation verified."
    );

    console.log(
        "Publish package identity validation verified."
    );

    console.log(
        "Publish manifest registry validation verified."
    );

    console.log(
        "Publish validation error aggregation verified."
    );

    console.log(
        "Template publish validation service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template publish validation service test failed.",
            error
        );

        process.exitCode =
            1;

    }
);