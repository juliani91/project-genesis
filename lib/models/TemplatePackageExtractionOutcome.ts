import {
    TemplatePackageExtractionResult
} from "./TemplatePackageExtractionResult";

import {
    TemplatePackageExtractionStatus
} from "./TemplatePackageExtractionStatus";

export interface TemplatePackageExtractionOutcome {

    status:
        TemplatePackageExtractionStatus;

    result:
        TemplatePackageExtractionResult;

}