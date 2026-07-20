import {
    RegistryPublishEntry
} from "./RegistryPublishEntry";

import {
    RegistryPublishManifest
} from "./RegistryPublishManifest";

import {
    TemplatePublishResult
} from "./TemplatePublishResult";

export interface TemplatePublishingOutcome {

    result:
        TemplatePublishResult;

    entry:
        RegistryPublishEntry;

    manifest:
        RegistryPublishManifest;

}