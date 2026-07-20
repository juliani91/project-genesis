import {
    InstalledTemplatePackage
} from "./InstalledTemplatePackage";

import {
    PackageCommandResult
} from "./PackageCommandResult";

import {
    RegistryIndexTemplate
} from "./RegistryIndexTemplate";

import {
    TemplateManifest
} from "./TemplateManifest";

import {
    TemplateProfile
} from "./TemplateProfile";

export interface LocalTemplateInfo {

    manifest:
        TemplateManifest;

    registryId:
        string;

    source:
        string;

    path:
        string;

}

export interface LocalProfileInfo {

    profile:
        TemplateProfile;

    source:
        string;

}

export interface PackageInfoCommandResult
    extends PackageCommandResult {

    template?:
        RegistryIndexTemplate;

    localTemplate?:
        LocalTemplateInfo;

    localProfile?:
        LocalProfileInfo;

    installedVersions:
        readonly InstalledTemplatePackage[];

}
