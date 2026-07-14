import {
    InstalledTemplatePackage
} from "./InstalledTemplatePackage";

import {
    PackageCommandResult
} from "./PackageCommandResult";

import {
    RegistryIndexTemplate
} from "./RegistryIndexTemplate";

export interface PackageInfoCommandResult
    extends PackageCommandResult {

    template?:
        RegistryIndexTemplate;

    installedVersions:
        readonly InstalledTemplatePackage[];

}