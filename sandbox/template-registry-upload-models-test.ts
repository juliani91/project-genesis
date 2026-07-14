import {
    SerializedTemplateRegistryUploadResult,
    TemplateRegistryUploadOutcome,
    TemplateRegistryUploadRequest,
    TemplateRegistryUploadResponse,
    TemplateRegistryUploadResult,
    TemplateRegistryUploadStatus
} from "../lib/models";

function main(): void {

    const request:
        TemplateRegistryUploadRequest = {

        uploadUrl:
            "https://registry.example.com/packages",

        packagePath:
            "C:/Packages/nextjs-4.0.0.zip",

        templateId:
            "nextjs",

        version:
            "4.0.0",

        sha256:
            "a".repeat(
                64
            ),

        accessToken:
            "test-token"
    };

    if (
        request.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The upload request template ID was incorrect."
        );

    }

    if (
        request.sha256.length !==
        64
    ) {

        throw new Error(
            "The upload request checksum was incorrect."
        );

    }

    const response:
        TemplateRegistryUploadResponse = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        packageUrl:
            "https://registry.example.com/packages/nextjs-4.0.0.zip"
    };

    if (
        response.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The registry upload response version was incorrect."
        );

    }

    const uploadedAt =
        new Date(
            "2026-07-14T17:00:00.000Z"
        );

    const result:
        TemplateRegistryUploadResult = {

        templateId:
            response.templateId,

        version:
            response.version,

        uploadUrl:
            request.uploadUrl,

        statusCode:
            201,

        uploadedAt,

        packageUrl:
            response.packageUrl
    };

    if (
        !(result.uploadedAt instanceof Date)
    ) {

        throw new Error(
            "The upload timestamp was not a Date."
        );

    }

    const serialized:
        SerializedTemplateRegistryUploadResult = {

        templateId:
            result.templateId,

        version:
            result.version,

        uploadUrl:
            result.uploadUrl,

        statusCode:
            result.statusCode,

        uploadedAt:
            result.uploadedAt.toISOString(),

        packageUrl:
            result.packageUrl
    };

    if (
        serialized.uploadedAt !==
        "2026-07-14T17:00:00.000Z"
    ) {

        throw new Error(
            "The serialized upload timestamp was incorrect."
        );

    }

    const uploadedStatus:
        TemplateRegistryUploadStatus =
            "uploaded";

    const uploadedOutcome:
        TemplateRegistryUploadOutcome = {

        status:
            uploadedStatus,

        result
    };

    if (
        uploadedOutcome.status !==
        "uploaded"
    ) {

        throw new Error(
            "The uploaded outcome status was incorrect."
        );

    }

    const existingOutcome:
        TemplateRegistryUploadOutcome = {

        status:
            "existing",

        result: {
            ...result,

            statusCode:
                200
        }
    };

    if (
        existingOutcome.status !==
        "existing"
    ) {

        throw new Error(
            "The existing upload outcome status was incorrect."
        );

    }

    console.log(
        "Template registry upload models test completed successfully."
    );

}

main();