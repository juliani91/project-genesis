import {
    SerializedTemplatePackagePublishResult,
    TemplatePackagePublishOutcome,
    TemplatePackagePublishRequest,
    TemplatePackagePublishResult,
    TemplatePackagePublishStatus
} from "../lib/models";

function main(): void {

    const request:
        TemplatePackagePublishRequest = {

        templatePath:
            "C:/Templates/nextjs",

        outputDirectory:
            "C:/Packages",

        overwrite:
            true
    };

    if (
        request.templatePath !==
        "C:/Templates/nextjs"
    ) {

        throw new Error(
            "The publish request template path was incorrect."
        );

    }

    const publishedAt =
        new Date(
            "2026-07-14T15:00:00.000Z"
        );

    const result:
        TemplatePackagePublishResult = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        packagePath:
            "C:/Packages/nextjs-4.0.0.zip",

        packageSizeBytes:
            10240,

        sha256:
            "abcdef0123456789",

        publishedAt
    };

    if (
        !(result.publishedAt instanceof Date)
    ) {

        throw new Error(
            "The publish timestamp was not a Date."
        );

    }

    const serialized:
        SerializedTemplatePackagePublishResult = {

        templateId:
            result.templateId,

        version:
            result.version,

        packagePath:
            result.packagePath,

        packageSizeBytes:
            result.packageSizeBytes,

        sha256:
            result.sha256,

        publishedAt:
            result.publishedAt.toISOString()
    };

    if (
        serialized.publishedAt !==
        "2026-07-14T15:00:00.000Z"
    ) {

        throw new Error(
            "The serialized publish timestamp was incorrect."
        );

    }

    const status:
        TemplatePackagePublishStatus =
            "published";

    const outcome:
        TemplatePackagePublishOutcome = {

        status,

        result
    };

    if (
        outcome.status !==
        "published"
    ) {

        throw new Error(
            "The publish outcome status was incorrect."
        );

    }

    const existing:
        TemplatePackagePublishOutcome = {

        status:
            "existing",

        result
    };

    if (
        existing.status !==
        "existing"
    ) {

        throw new Error(
            "The existing publish outcome status was incorrect."
        );

    }

    console.log(
        "Template package publish models test completed successfully."
    );

}

main();