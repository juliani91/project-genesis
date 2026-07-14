import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

/**
 * JSON-safe representation of a downloaded template archive.
 */
export interface SerializedTemplatePackageDownloadResult {

    templateId: string;

    version: string;

    sourceUrl: string;

    archivePath: string;

    archiveFormat:
        TemplateArchiveFormat;

    sizeBytes: number;

    /**
     * ISO-8601 timestamp.
     */
    downloadedAt: string;

    expectedSha256?: string;

}