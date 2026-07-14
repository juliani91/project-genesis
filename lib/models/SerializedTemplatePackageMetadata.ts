import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

/**
 * JSON-safe representation of TemplatePackageMetadata.
 */
export interface SerializedTemplatePackageMetadata {

    templateId: string;

    version: string;

    archiveName: string;

    archiveFormat:
        TemplateArchiveFormat;

    sizeBytes: number;

    sha256: string;

    /**
     * ISO-8601 timestamp.
     */
    createdAt: string;

}