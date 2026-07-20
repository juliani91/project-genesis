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

export interface PackageInfoCommandResult
    extends PackageCommandResult {

    template?:
        RegistryIndexTemplate;

    localTemplate?:
        LocalTemplateInfo;

    installedVersions:
        readonly InstalledTemplatePackage[];

}
