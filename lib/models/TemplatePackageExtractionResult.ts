/**
 * Represents a successfully extracted template package.
 */
export interface TemplatePackageExtractionResult {

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Source archive path.
     */
    archivePath: string;

    /**
     * Absolute directory containing the extracted template.
     */
    templatePath: string;

    /**
     * Number of extracted files.
     */
    fileCount: number;

    /**
     * Number of extracted directories.
     */
    directoryCount: number;

    /**
     * Time at which extraction completed.
     */
    extractedAt: Date;

}