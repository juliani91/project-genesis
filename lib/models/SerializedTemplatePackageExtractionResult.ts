/**
 * JSON-safe representation of an extracted template package.
 */
export interface SerializedTemplatePackageExtractionResult {

    templateId: string;

    version: string;

    archivePath: string;

    templatePath: string;

    fileCount: number;

    directoryCount: number;

    /**
     * ISO-8601 timestamp.
     */
    extractedAt: string;

}