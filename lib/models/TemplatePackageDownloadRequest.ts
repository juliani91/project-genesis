import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

/**
 * Describes a remote template package that should
 * be downloaded.
 */
export interface TemplatePackageDownloadRequest {

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Remote archive URL.
     */
    downloadUrl: string;

    /**
     * Archive format.
     */
    archiveFormat:
        TemplateArchiveFormat;

    /**
     * Optional expected SHA-256 checksum.
     */
    sha256?: string;

}