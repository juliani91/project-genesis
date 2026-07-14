import {
    SerializedTemplatePackageMetadata,
    TemplatePackageBuildRequest,
    TemplatePackageBuildResult,
    TemplatePackageMetadata
} from "../lib/models";

function main(): void {

    const buildRequest:
        TemplatePackageBuildRequest = {

        templatePath:
            "C:/Templates/nextjs",

        packagePath:
            "C:/Packages/nextjs-4.0.0.zip",

        overwrite:
            true
    };

    if (
        buildRequest.overwrite !==
        true
    ) {

        throw new Error(
            "The package build overwrite flag was incorrect."
        );

    }

    const createdAt =
        new Date(
            "2026-07-14T16:00:00.000Z"
        );

    const metadata:
        TemplatePackageMetadata = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        archiveName:
            "nextjs-4.0.0.zip",

        archiveFormat:
            "zip",

        sizeBytes:
            20480,

        sha256:
            "a".repeat(
                64
            ),

        createdAt
    };

    if (
        metadata.archiveFormat !==
        "zip"
    ) {

        throw new Error(
            "The package metadata archive format was incorrect."
        );

    }

    if (
        !(metadata.createdAt instanceof Date)
    ) {

        throw new Error(
            "The package metadata creation timestamp was not a Date."
        );

    }

    const serialized:
        SerializedTemplatePackageMetadata = {

        templateId:
            metadata.templateId,

        version:
            metadata.version,

        archiveName:
            metadata.archiveName,

        archiveFormat:
            metadata.archiveFormat,

        sizeBytes:
            metadata.sizeBytes,

        sha256:
            metadata.sha256,

        createdAt:
            metadata.createdAt.toISOString()
    };

    if (
        serialized.createdAt !==
        "2026-07-14T16:00:00.000Z"
    ) {

        throw new Error(
            "The serialized package metadata timestamp was incorrect."
        );

    }

    const buildResult:
        TemplatePackageBuildResult = {

        templatePath:
            buildRequest.templatePath,

        packagePath:
            buildRequest.packagePath,

        metadata
    };

    if (
        buildResult.metadata.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The package build result metadata was incorrect."
        );

    }

    if (
        buildResult.packagePath !==
        "C:/Packages/nextjs-4.0.0.zip"
    ) {

        throw new Error(
            "The package build result path was incorrect."
        );

    }

    console.log(
        "Template package metadata models test completed successfully."
    );

}

main();