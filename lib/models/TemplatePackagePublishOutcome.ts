import {
    TemplatePackagePublishResult
} from "./TemplatePackagePublishResult";

import {
    TemplatePackagePublishStatus
} from "./TemplatePackagePublishStatus";

export interface TemplatePackagePublishOutcome {

    status:
        TemplatePackagePublishStatus;

    result:
        TemplatePackagePublishResult;

}