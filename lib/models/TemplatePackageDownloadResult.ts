import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

/**
 * Represents a successfully downloaded template archive.
 */
export interface TemplatePackageDownloadResult {

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Final response URL after redirects.
     */
    sourceUrl: string;

    /**
     * Absolute path to the downloaded archive.
     */
    archivePath: string;

    /**
     * Archive format.
     */
    archiveFormat:
        TemplateArchiveFormat;

    /**
     * Number of bytes written to disk.
     */
    sizeBytes: number;

    /**
     * Time at which the download completed.
     */
    downloadedAt: Date;

    /**
     * Optional advertised SHA-256 checksum.
     */
    expectedSha256?: string;

}