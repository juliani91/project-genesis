import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

/**
 * Metadata describing a distributable template package.
 */
export interface TemplatePackageMetadata {

    /**
     * Template identifier from genesis.json.
     */
    templateId: string;

    /**
     * Template version from genesis.json.
     */
    version: string;

    /**
     * Generated archive filename.
     */
    archiveName: string;

    /**
     * Archive format.
     */
    archiveFormat:
        TemplateArchiveFormat;

    /**
     * Archive size in bytes.
     */
    sizeBytes: number;

    /**
     * Lowercase SHA-256 checksum.
     */
    sha256: string;

    /**
     * Time at which the package was created.
     */
    createdAt: Date;

}