import {
    TemplatePackageDownloadResult
} from "./TemplatePackageDownloadResult";

/**
 * Describes a downloaded template archive that should
 * be extracted into the template cache.
 */
export interface TemplatePackageExtractionRequest {

    /**
     * Downloaded archive metadata.
     */
    download:
        TemplatePackageDownloadResult;

    /**
     * Absolute directory in which the extracted template
     * version should be stored.
     */
    destinationPath: string;

}