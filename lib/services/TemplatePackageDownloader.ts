import { promises as fs } from "fs";
import path from "path";

import {
    TemplatePackageDownloadRequest,
    TemplatePackageDownloadResult
} from "../models";

export class TemplatePackageDownloader {

    public constructor(
        private readonly downloadDirectory:
            string = path.join(
                process.cwd(),
                ".cache",
                "packages"
            )
    ) {}

    public async download(
        request:
            TemplatePackageDownloadRequest
    ): Promise<TemplatePackageDownloadResult> {

        const templateId =
            this.normalizePathSegment(
                request.templateId,
                "Template ID"
            );

        const version =
            this.normalizePathSegment(
                request.version,
                "Template version"
            );

        if (
            request.archiveFormat !==
            "zip"
        ) {

            throw new Error(
                [
                    "Unsupported template archive format:",
                    request.archiveFormat
                ].join(" ")
            );

        }

        const downloadUrl =
            this.validateDownloadUrl(
                request.downloadUrl
            );

        const archiveDirectory =
            path.join(
                this.downloadDirectory,
                templateId,
                version
            );

        const archivePath =
            path.join(
                archiveDirectory,
                "package.zip"
            );

        const temporaryPath =
            path.join(
                archiveDirectory,
                `package-${Date.now()}.tmp`
            );

        await fs.mkdir(
            archiveDirectory,
            {
                recursive: true
            }
        );

        let response:
            Response;

        try {

            response =
                await fetch(
                    downloadUrl,
                    {
                        headers: {
                            Accept:
                                "application/zip, application/octet-stream"
                        }
                    }
                );

        } catch (error) {

            throw new Error(
                [
                    `Unable to download template "${templateId}"`,
                    `version "${version}" from`,
                    downloadUrl,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        if (!response.ok) {

            throw new Error(
                [
                    `Template package download returned HTTP`,
                    String(response.status),
                    response.statusText ||
                        "Unknown Status",
                    `for "${templateId}" version "${version}".`
                ].join(" ")
            );

        }

        let archiveBytes:
            Uint8Array;

        try {

            const buffer =
                await response.arrayBuffer();

            archiveBytes =
                new Uint8Array(
                    buffer
                );

        } catch (error) {

            throw new Error(
                [
                    `Unable to read the downloaded archive for`,
                    `"${templateId}" version "${version}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        if (
            archiveBytes.byteLength ===
            0
        ) {

            throw new Error(
                [
                    `The downloaded archive for "${templateId}"`,
                    `version "${version}" was empty.`
                ].join(" ")
            );

        }

        try {

            await fs.writeFile(
                temporaryPath,
                archiveBytes
            );

            /*
             * The version-specific archive path is replaced
             * only after the complete temporary download
             * has been written successfully.
             */
            await fs.rm(
                archivePath,
                {
                    force: true
                }
            );

            await fs.rename(
                temporaryPath,
                archivePath
            );

        } catch (error) {

            await fs.rm(
                temporaryPath,
                {
                    force: true
                }
            );

            throw new Error(
                [
                    `Unable to save the downloaded archive for`,
                    `"${templateId}" version "${version}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        return {
            templateId,

            version,

            sourceUrl:
                response.url ||
                downloadUrl,

            archivePath,

            archiveFormat:
                request.archiveFormat,

            sizeBytes:
                archiveBytes.byteLength,

            downloadedAt:
                new Date(),

            expectedSha256:
                request.sha256
                    ?.trim()
                    .toLowerCase() ||
                undefined
        };

    }

    public getArchivePath(
        templateId:
            string,

        version:
            string
    ): string {

        const normalizedTemplateId =
            this.normalizePathSegment(
                templateId,
                "Template ID"
            );

        const normalizedVersion =
            this.normalizePathSegment(
                version,
                "Template version"
            );

        return path.join(
            this.downloadDirectory,
            normalizedTemplateId,
            normalizedVersion,
            "package.zip"
        );

    }

    private validateDownloadUrl(
        value:
            string
    ): string {

        const normalized =
            value.trim();

        if (!normalized) {

            throw new Error(
                "Template package download URL is required."
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
                    "Invalid template package download URL:",
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
                "Template package downloads must use HTTP or HTTPS."
            );

        }

        return url.toString();

    }

    private normalizePathSegment(
        value:
            string,

        label:
            string
    ): string {

        const normalized =
            value
                .trim()
                .toLowerCase();

        if (!normalized) {

            throw new Error(
                `${label} is required.`
            );

        }

        if (
            !/^[a-z0-9._-]+$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    `${label} contains unsupported characters:`,
                    value
                ].join(" ")
            );

        }

        return normalized;

    }

}