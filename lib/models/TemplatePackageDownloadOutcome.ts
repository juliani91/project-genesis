import {
    TemplatePackageDownloadResult
} from "./TemplatePackageDownloadResult";

import {
    TemplatePackageDownloadStatus
} from "./TemplatePackageDownloadStatus";

export interface TemplatePackageDownloadOutcome {

    status:
        TemplatePackageDownloadStatus;

    result:
        TemplatePackageDownloadResult;

}