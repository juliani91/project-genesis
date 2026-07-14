import {
    TemplateRegistryUploadResult
} from "./TemplateRegistryUploadResult";

import {
    TemplateRegistryUploadStatus
} from "./TemplateRegistryUploadStatus";

export interface TemplateRegistryUploadOutcome {

    status:
        TemplateRegistryUploadStatus;

    result:
        TemplateRegistryUploadResult;

}