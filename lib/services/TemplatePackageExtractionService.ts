import { promises as fs } from "fs";
import path from "path";

import * as unzipper from "unzipper";

import {
    TemplatePackageExtractionRequest,
    TemplatePackageExtractionResult
} from "../models";

export class TemplatePackageExtractionService {

    public async extract(
        request:
            TemplatePackageExtractionRequest
    ): Promise<TemplatePackageExtractionResult> {

        const download =
            request.download;

        if (
            download.archiveFormat !==
            "zip"
        ) {

            throw new Error(
                [
                    "Unsupported template archive format:",
                    download.archiveFormat
                ].join(" ")
            );

        }

        const destinationPath =
            path.resolve(
                request.destinationPath
            );

        const temporaryPath =
            `${destinationPath}.tmp-${Date.now()}`;

        await fs.rm(
            temporaryPath,
            {
                recursive: true,
                force: true
            }
        );

        await fs.mkdir(
            temporaryPath,
            {
                recursive: true
            }
        );

        let fileCount =
            0;

        const directories =
            new Set<string>();

        try {

            const archive =
                await unzipper.Open.file(
                    download.archivePath
                );

            for (
                const entry
                of archive.files
            ) {

                const normalizedEntryPath =
                    this.normalizeEntryPath(
                        entry.path
                    );

                if (!normalizedEntryPath) {
                    continue;
                }

                const targetPath =
                    path.resolve(
                        temporaryPath,
                        normalizedEntryPath
                    );

                this.assertInsideDestination(
                    temporaryPath,
                    targetPath,
                    entry.path
                );

                if (
                    entry.type ===
                    "Directory"
                ) {

                    await fs.mkdir(
                        targetPath,
                        {
                            recursive: true
                        }
                    );

                    directories.add(
                        targetPath
                    );

                    continue;

                }

                const parentPath =
                    path.dirname(
                        targetPath
                    );

                await fs.mkdir(
                    parentPath,
                    {
                        recursive: true
                    }
                );

                this.collectDirectories(
                    temporaryPath,
                    parentPath,
                    directories
                );

                const contents =
                    await entry.buffer();

                await fs.writeFile(
                    targetPath,
                    contents
                );

                fileCount++;

            }

            await fs.rm(
                destinationPath,
                {
                    recursive: true,
                    force: true
                }
            );

            await fs.rename(
                temporaryPath,
                destinationPath
            );

        } catch (error) {

            await fs.rm(
                temporaryPath,
                {
                    recursive: true,
                    force: true
                }
            );

            throw new Error(
                [
                    `Unable to extract template package`,
                    `"${download.templateId}" version "${download.version}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        return {
            templateId:
                download.templateId,

            version:
                download.version,

            archivePath:
                download.archivePath,

            templatePath:
                destinationPath,

            fileCount,

            directoryCount:
                directories.size,

            extractedAt:
                new Date()
        };

    }

    private normalizeEntryPath(
        entryPath:
            string
    ): string {

        const normalized =
            entryPath
                .replace(
                    /\\/g,
                    "/"
                )
                .replace(
                    /^\/+/,
                    ""
                );

        if (
            !normalized ||
            normalized ===
                "."
        ) {

            return "";

        }

        if (
            path.posix.isAbsolute(
                normalized
            )
        ) {

            throw new Error(
                `ZIP entry uses an absolute path: ${entryPath}`
            );

        }

        const segments =
            normalized.split(
                "/"
            );

        if (
            segments.some(
                (segment) =>
                    segment ===
                    ".."
            )
        ) {

            throw new Error(
                `ZIP entry attempts path traversal: ${entryPath}`
            );

        }

        return segments
            .filter(
                (segment) =>
                    segment &&
                    segment !==
                        "."
            )
            .join(
                path.sep
            );

    }

    private assertInsideDestination(
        rootPath:
            string,

        targetPath:
            string,

        entryPath:
            string
    ): void {

        const relative =
            path.relative(
                rootPath,
                targetPath
            );

        if (
            relative.startsWith(
                ".."
            ) ||
            path.isAbsolute(
                relative
            )
        ) {

            throw new Error(
                `ZIP entry escapes the destination directory: ${entryPath}`
            );

        }

    }

    private collectDirectories(
        rootPath:
            string,

        directoryPath:
            string,

        directories:
            Set<string>
    ): void {

        let current =
            directoryPath;

        while (
            current !==
            rootPath
        ) {

            const relative =
                path.relative(
                    rootPath,
                    current
                );

            if (
                relative.startsWith(
                    ".."
                ) ||
                path.isAbsolute(
                    relative
                )
            ) {

                break;

            }

            directories.add(
                current
            );

            const parent =
                path.dirname(
                    current
                );

            if (
                parent ===
                current
            ) {

                break;

            }

            current =
                parent;

        }

    }

}