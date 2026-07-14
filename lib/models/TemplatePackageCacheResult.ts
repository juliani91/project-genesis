import {
    TemplatePackageDownloadOutcome
} from "./TemplatePackageDownloadOutcome";

import {
    TemplatePackageExtractionOutcome
} from "./TemplatePackageExtractionOutcome";

export interface TemplatePackageCacheResult {

    download:
        TemplatePackageDownloadOutcome;

    extraction:
        TemplatePackageExtractionOutcome;

}