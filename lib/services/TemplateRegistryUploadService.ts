import {
    promises as fs
} from "fs";

import path from "path";

import {
    TemplateRegistryUploadOutcome,
    TemplateRegistryUploadRequest,
    TemplateRegistryUploadResponse,
    TemplateRegistryUploadStatus
} from "../models";

export class TemplateRegistryUploadService {

    public async upload(
        request:
            TemplateRegistryUploadRequest
    ): Promise<TemplateRegistryUploadOutcome> {

        const uploadUrl =
            this.validateUploadUrl(
                request.uploadUrl
            );

        const packagePath =
            path.resolve(
                request.packagePath
            );

        const packageStat =
            await this.requirePackageFile(
                packagePath
            );

        const templateId =
            this.requireValue(
                request.templateId,
                "Template ID"
            );

        const version =
            this.requireValue(
                request.version,
                "Template version"
            );

        const sha256 =
            this.normalizeSha256(
                request.sha256
            );

        const packageBytes =
            await fs.readFile(
                packagePath
            );

        if (
            packageBytes.byteLength !==
            packageStat.size
        ) {

            throw new Error(
                [
                    "The package size changed while preparing the upload:",
                    packagePath
                ].join(" ")
            );

        }

        const form =
            new FormData();

        form.append(
            "templateId",
            templateId
        );

        form.append(
            "version",
            version
        );

        form.append(
            "sha256",
            sha256
        );

        form.append(
            "package",
            new Blob(
                [
                    packageBytes
                ],
                {
                    type:
                        "application/zip"
                }
            ),
            path.basename(
                packagePath
            )
        );

        const headers:
            Record<string, string> = {
            Accept:
                "application/json"
        };

        const accessToken =
            request.accessToken
                ?.trim();

        if (accessToken) {

            headers.Authorization =
                `Bearer ${accessToken}`;

        }

        let response:
            Response;

        try {

            response =
                await fetch(
                    uploadUrl,
                    {
                        method:
                            "POST",

                        headers,

                        body:
                            form
                    }
                );

        } catch (error) {

            throw new Error(
                [
                    `Unable to upload template "${templateId}"`,
                    `version "${version}" to`,
                    uploadUrl,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        const status =
            this.determineStatus(
                response.status
            );

        if (!status) {

            const responseText =
                await this.readResponseText(
                    response
                );

            throw new Error(
                [
                    "Template registry upload returned HTTP",
                    String(
                        response.status
                    ),
                    response.statusText ||
                        "Unknown Status",
                    responseText
                        ? `Response: ${responseText}`
                        : ""
                ]
                    .filter(
                        Boolean
                    )
                    .join(" ")
            );

        }

        const responseBody =
            await this.readResponse(
                response
            );

        if (
            responseBody.templateId !==
            templateId
        ) {

            throw new Error(
                [
                    "Template registry upload response ID mismatch.",
                    `Expected "${templateId}",`,
                    `but received "${responseBody.templateId}".`
                ].join(" ")
            );

        }

        if (
            responseBody.version !==
            version
        ) {

            throw new Error(
                [
                    "Template registry upload response version mismatch.",
                    `Expected "${version}",`,
                    `but received "${responseBody.version}".`
                ].join(" ")
            );

        }

        return {
            status,

            result: {
                templateId,

                version,

                uploadUrl,

                statusCode:
                    response.status,

                uploadedAt:
                    new Date(),

                packageUrl:
                    responseBody
                        .packageUrl
                        ?.trim() ||
                    undefined
            }
        };

    }

    private validateUploadUrl(
        value:
            string
    ): string {

        const normalized =
            value.trim();

        if (!normalized) {

            throw new Error(
                "Template registry upload URL is required."
            );

        }

        let url:
            URL;

        try {

            url =
                new URL(
                    normalized
                );

        } catch {

            throw new Error(
                [
                    "Invalid template registry upload URL:",
                    value
                ].join(" ")
            );

        }

        if (
            url.protocol !==
                "https:" &&
            url.protocol !==
                "http:"
        ) {

            throw new Error(
                "Template registry uploads must use HTTP or HTTPS."
            );

        }

        return url.toString();

    }

    private async requirePackageFile(
        packagePath:
            string
    ): Promise<
        Awaited<
            ReturnType<
                typeof fs.stat
            >
        >
    > {

        let stat:
            Awaited<
                ReturnType<
                    typeof fs.stat
                >
            >;

        try {

            stat =
                await fs.stat(
                    packagePath
                );

        } catch {

            throw new Error(
                [
                    "Template package does not exist:",
                    packagePath
                ].join(" ")
            );

        }

        if (
            !stat.isFile()
        ) {

            throw new Error(
                [
                    "Template package path is not a file:",
                    packagePath
                ].join(" ")
            );

        }

        if (
            path.extname(
                packagePath
            ).toLowerCase() !==
            ".zip"
        ) {

            throw new Error(
                [
                    "Template registry uploads require a ZIP package:",
                    packagePath
                ].join(" ")
            );

        }

        if (
            stat.size ===
            0
        ) {

            throw new Error(
                [
                    "Template package is empty:",
                    packagePath
                ].join(" ")
            );

        }

        return stat;

    }

    private requireValue(
        value:
            string,

        label:
            string
    ): string {

        const normalized =
            value.trim();

        if (!normalized) {

            throw new Error(
                `${label} is required.`
            );

        }

        return normalized;

    }

    private normalizeSha256(
        value:
            string
    ): string {

        const normalized =
            value
                .trim()
                .toLowerCase();

        if (
            !/^[a-f0-9]{64}$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    "Invalid template package SHA-256:",
                    value
                ].join(" ")
            );

        }

        return normalized;

    }

    private determineStatus(
        statusCode:
            number
    ): TemplateRegistryUploadStatus | undefined {

        if (
            statusCode ===
                201 ||
            statusCode ===
                202
        ) {

            return "uploaded";

        }

        if (
            statusCode ===
                200 ||
            statusCode ===
                409
        ) {

            return "existing";

        }

        return undefined;

    }

    private async readResponse(
        response:
            Response
    ): Promise<TemplateRegistryUploadResponse> {

        let body:
            unknown;

        try {

            body =
                await response.json();

        } catch {

            throw new Error(
                [
                    "Template registry upload returned invalid JSON.",
                    `HTTP status: ${response.status}.`
                ].join(" ")
            );

        }

        if (
            !body ||
            typeof body !==
                "object"
        ) {

            throw new Error(
                "Template registry upload returned an invalid response body."
            );

        }

        const candidate =
            body as Partial<
                TemplateRegistryUploadResponse
            >;

        if (
            typeof candidate.templateId !==
                "string" ||
            !candidate.templateId.trim()
        ) {

            throw new Error(
                "Template registry upload response is missing templateId."
            );

        }

        if (
            typeof candidate.version !==
                "string" ||
            !candidate.version.trim()
        ) {

            throw new Error(
                "Template registry upload response is missing version."
            );

        }

        if (
            candidate.packageUrl !==
                undefined &&
            typeof candidate.packageUrl !==
                "string"
        ) {

            throw new Error(
                "Template registry upload response contains an invalid packageUrl."
            );

        }

        return {
            templateId:
                candidate.templateId.trim(),

            version:
                candidate.version.trim(),

            packageUrl:
                candidate.packageUrl
                    ?.trim() ||
                undefined
        };

    }

    private async readResponseText(
        response:
            Response
    ): Promise<string> {

        try {

            return (
                await response.text()
            ).trim();

        } catch {

            return "";

        }

    }

}