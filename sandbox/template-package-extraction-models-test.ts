import {
    SerializedTemplatePackageExtractionResult,
    TemplatePackageDownloadResult,
    TemplatePackageExtractionOutcome,
    TemplatePackageExtractionRequest,
    TemplatePackageExtractionResult,
    TemplatePackageExtractionStatus,
    TemplatePackageIntegrityResult
} from "../lib/models";

function main(): void {

    const download:
        TemplatePackageDownloadResult = {

        templateId:
            "nextjs",

        version:
            "3.2.0",

        sourceUrl:
            "https://registry.example.com/nextjs.zip",

        archivePath:
            "C:/ProjectGenesis/.cache/packages/nextjs/3.2.0/package.zip",

        archiveFormat:
            "zip",

        sizeBytes:
            4096,

        downloadedAt:
            new Date(
                "2026-07-13T18:00:00.000Z"
            ),

        expectedSha256:
            "0123456789abcdef"
    };

    const request:
        TemplatePackageExtractionRequest = {

        download,

        destinationPath:
            "C:/ProjectGenesis/.cache/templates/nextjs/3.2.0"
    };

    if (
        request.download.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The extraction request download was incorrect."
        );

    }

    const extractedAt =
        new Date(
            "2026-07-13T18:05:00.000Z"
        );

    const result:
        TemplatePackageExtractionResult = {

        templateId:
            "nextjs",

        version:
            "3.2.0",

        archivePath:
            download.archivePath,

        templatePath:
            request.destinationPath,

        fileCount:
            12,

        directoryCount:
            4,

        extractedAt
    };

    if (
        !(result.extractedAt instanceof Date)
    ) {

        throw new Error(
            "The extraction timestamp was not a Date."
        );

    }

    if (
        result.fileCount !==
        12
    ) {

        throw new Error(
            "The extracted file count was incorrect."
        );

    }

    const serialized:
        SerializedTemplatePackageExtractionResult = {

        templateId:
            result.templateId,

        version:
            result.version,

        archivePath:
            result.archivePath,

        templatePath:
            result.templatePath,

        fileCount:
            result.fileCount,

        directoryCount:
            result.directoryCount,

        extractedAt:
            result.extractedAt.toISOString()
    };

    if (
        serialized.extractedAt !==
        "2026-07-13T18:05:00.000Z"
    ) {

        throw new Error(
            "The serialized extraction timestamp was incorrect."
        );

    }

    const status:
        TemplatePackageExtractionStatus =
            "extracted";

    const outcome:
        TemplatePackageExtractionOutcome = {

        status,

        result
    };

    if (
        outcome.status !==
        "extracted"
    ) {

        throw new Error(
            "The extraction outcome status was incorrect."
        );

    }

    const cachedOutcome:
        TemplatePackageExtractionOutcome = {

        status:
            "cached",

        result
    };

    if (
        cachedOutcome.status !==
        "cached"
    ) {

        throw new Error(
            "The cached extraction outcome status was incorrect."
        );

    }

    const verifiedIntegrity:
        TemplatePackageIntegrityResult = {

        archivePath:
            download.archivePath,

        actualSha256:
            "0123456789abcdef",

        expectedSha256:
            "0123456789abcdef",

        valid:
            true,

        verified:
            true
    };

    if (
        !verifiedIntegrity.valid ||
        !verifiedIntegrity.verified
    ) {

        throw new Error(
            "The verified integrity result was incorrect."
        );

    }

    const unverifiedIntegrity:
        TemplatePackageIntegrityResult = {

        archivePath:
            download.archivePath,

        actualSha256:
            "fedcba9876543210",

        valid:
            true,

        verified:
            false
    };

    if (
        !unverifiedIntegrity.valid ||
        unverifiedIntegrity.verified
    ) {

        throw new Error(
            "The unverified integrity result was incorrect."
        );

    }

    console.log(
        "Template package extraction models test completed successfully."
    );

}

main();