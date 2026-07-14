import {
    SerializedTemplatePackageDownloadResult,
    TemplatePackageDownloadOutcome,
    TemplatePackageDownloadRequest,
    TemplatePackageDownloadResult,
    TemplatePackageDownloadStatus
} from "../lib/models";

function main(): void {

    const request:
        TemplatePackageDownloadRequest = {

        templateId:
            "nextjs",

        version:
            "3.2.0",

        downloadUrl:
            "https://registry.example.com/packages/nextjs-3.2.0.zip",

        archiveFormat:
            "zip",

        sha256:
            "0123456789abcdef"
    };

    if (
        request.archiveFormat !==
        "zip"
    ) {

        throw new Error(
            "The package archive format was incorrect."
        );

    }

    const downloadedAt =
        new Date(
            "2026-07-13T18:00:00.000Z"
        );

    const result:
        TemplatePackageDownloadResult = {

        templateId:
            request.templateId,

        version:
            request.version,

        sourceUrl:
            request.downloadUrl,

        archivePath:
            "C:/ProjectGenesis/.cache/packages/nextjs/3.2.0/package.zip",

        archiveFormat:
            request.archiveFormat,

        sizeBytes:
            4096,

        downloadedAt,

        expectedSha256:
            request.sha256
    };

    if (
        !(result.downloadedAt instanceof Date)
    ) {

        throw new Error(
            "The download timestamp was not a Date."
        );

    }

    if (
        result.sizeBytes !==
        4096
    ) {

        throw new Error(
            "The downloaded byte count was incorrect."
        );

    }

    const serialized:
        SerializedTemplatePackageDownloadResult = {

        templateId:
            result.templateId,

        version:
            result.version,

        sourceUrl:
            result.sourceUrl,

        archivePath:
            result.archivePath,

        archiveFormat:
            result.archiveFormat,

        sizeBytes:
            result.sizeBytes,

        downloadedAt:
            result.downloadedAt.toISOString(),

        expectedSha256:
            result.expectedSha256
    };

    if (
        serialized.downloadedAt !==
        "2026-07-13T18:00:00.000Z"
    ) {

        throw new Error(
            "The serialized download timestamp was incorrect."
        );

    }

    const downloadedStatus:
        TemplatePackageDownloadStatus =
            "downloaded";

    const outcome:
        TemplatePackageDownloadOutcome = {

        status:
            downloadedStatus,

        result
    };

    if (
        outcome.status !==
        "downloaded"
    ) {

        throw new Error(
            "The package download outcome status was incorrect."
        );

    }

    const cachedOutcome:
        TemplatePackageDownloadOutcome = {

        status:
            "cached",

        result
    };

    if (
        cachedOutcome.status !==
        "cached"
    ) {

        throw new Error(
            "The cached package outcome status was incorrect."
        );

    }

    console.log(
        "Template package download models test completed successfully."
    );

}

main();