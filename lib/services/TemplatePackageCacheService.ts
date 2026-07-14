import { promises as fs } from "fs";
import path from "path";

import {
    RegistryTemplate,
    TemplatePackageCacheResult,
    TemplatePackageDownloadRequest,
    TemplatePackageDownloadResult,
    TemplatePackageExtractionResult
} from "../models";

import { TemplatePackageDownloader } from "./TemplatePackageDownloader";
import { TemplatePackageExtractionService } from "./TemplatePackageExtractionService";
import { TemplatePackageIntegrityService } from "./TemplatePackageIntegrityService";


export class TemplatePackageCacheService {

    public constructor(
        private readonly packageCacheDirectory:
            string = path.join(
                process.cwd(),
                ".cache",
                "packages"
            ),

        private readonly templateCacheDirectory:
            string = path.join(
                process.cwd(),
                ".cache",
                "templates"
            ),

        private readonly downloader:
            TemplatePackageDownloader =
            new TemplatePackageDownloader(
                packageCacheDirectory
            ),

        private readonly integrityService:
            TemplatePackageIntegrityService =
            new TemplatePackageIntegrityService(),

        private readonly extractionService:
            TemplatePackageExtractionService =
            new TemplatePackageExtractionService()
    ) {}

    public async prepare(
        template:
            RegistryTemplate
    ): Promise<TemplatePackageCacheResult> {

        const request =
            this.createDownloadRequest(
                template
            );

        const archivePath =
            this.downloader.getArchivePath(
                request.templateId,
                request.version
            );

        const destinationPath =
            this.getTemplatePath(
                request.templateId,
                request.version
            );

        const cachedExtraction =
            await this.tryReadCachedExtraction(
                request.templateId,
                request.version,
                archivePath,
                destinationPath
            );

        if (cachedExtraction) {

            const cachedDownload:
                TemplatePackageDownloadResult = {

                templateId:
                    request.templateId,

                version:
                    request.version,

                sourceUrl:
                    request.downloadUrl,

                archivePath,

                archiveFormat:
                    request.archiveFormat,

                sizeBytes:
                    await this.getFileSize(
                        archivePath
                    ),

                downloadedAt:
                    (
                        await fs.stat(
                            archivePath
                        )
                    ).mtime,

                expectedSha256:
                    request.sha256
            };

            return {
                download: {
                    status:
                        "cached",

                    result:
                        cachedDownload
                },

                extraction: {
                    status:
                        "cached",

                    result:
                        cachedExtraction
                }
            };

        }

        const download =
            await this.downloader.download(
                request
            );

        await this.integrityService
            .verifyOrThrow(
                download
            );

        const extraction =
            await this.extractionService.extract({
                download,

                destinationPath
            });

        return {
            download: {
                status:
                    "downloaded",

                result:
                    download
            },

            extraction: {
                status:
                    "extracted",

                result:
                    extraction
            }
        };

    }

    public getTemplatePath(
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
            this.templateCacheDirectory,
            normalizedTemplateId,
            normalizedVersion
        );

    }

    private createDownloadRequest(
        template:
            RegistryTemplate
    ): TemplatePackageDownloadRequest {

        if (
            !template.downloadUrl
        ) {

            throw new Error(
                [
                    `Remote template "${template.templateId}"`,
                    "does not provide a download URL."
                ].join(" ")
            );

        }

        if (
            !template.archiveFormat
        ) {

            throw new Error(
                [
                    `Remote template "${template.templateId}"`,
                    "does not provide an archive format."
                ].join(" ")
            );

        }

        return {
            templateId:
                template.templateId,

            version:
                template.version,

            downloadUrl:
                template.downloadUrl,

            archiveFormat:
                template.archiveFormat,

            sha256:
                template.sha256
        };

    }

    private async tryReadCachedExtraction(
        templateId:
            string,

        version:
            string,

        archivePath:
            string,

        destinationPath:
            string
    ): Promise<
        TemplatePackageExtractionResult |
        undefined
    > {

        const manifestPath =
            path.join(
                destinationPath,
                "genesis.json"
            );

        try {

            const [
                archiveStat,
                manifestStat
            ] =
                await Promise.all([
                    fs.stat(
                        archivePath
                    ),
                    fs.stat(
                        manifestPath
                    )
                ]);

            if (
                !archiveStat.isFile() ||
                !manifestStat.isFile()
            ) {

                return undefined;

            }

            const counts =
                await this.countExtractedEntries(
                    destinationPath
                );

            return {
                templateId:
                    this.normalizePathSegment(
                        templateId,
                        "Template ID"
                    ),

                version:
                    this.normalizePathSegment(
                        version,
                        "Template version"
                    ),

                archivePath,

                templatePath:
                    destinationPath,

                fileCount:
                    counts.fileCount,

                directoryCount:
                    counts.directoryCount,

                extractedAt:
                    manifestStat.mtime
            };

        } catch (error) {

            if (
                error instanceof Error &&
                "code" in error &&
                error.code ===
                    "ENOENT"
            ) {

                return undefined;

            }

            throw error;

        }

    }

    private async countExtractedEntries(
        rootPath:
            string
    ): Promise<{
        fileCount: number;
        directoryCount: number;
    }> {

        let fileCount =
            0;

        let directoryCount =
            0;

        const visit =
            async (
                currentPath:
                    string
            ): Promise<void> => {

                const entries =
                    await fs.readdir(
                        currentPath,
                        {
                            withFileTypes:
                                true,

                            encoding:
                                "utf-8"
                        }
                    );

                for (
                    const entry
                    of entries
                ) {

                    const entryPath =
                        path.join(
                            currentPath,
                            entry.name
                        );

                    if (
                        entry.isDirectory()
                    ) {

                        directoryCount++;

                        await visit(
                            entryPath
                        );

                    } else if (
                        entry.isFile()
                    ) {

                        fileCount++;

                    }

                }

            };

        await visit(
            rootPath
        );

        return {
            fileCount,
            directoryCount
        };

    }

    private async getFileSize(
        filePath:
            string
    ): Promise<number> {

        const stat =
            await fs.stat(
                filePath
            );

        return stat.size;

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