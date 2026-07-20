import {
    TemplatePublishRequest
} from "./TemplatePublishRequest";

export interface TemplatePublishValidationResult {

    valid:
        boolean;

    errors:
        readonly string[];

    normalizedRequest?:
        TemplatePublishRequest;

    packageSizeBytes?:
        number;

}