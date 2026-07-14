import {
    InstalledTemplatePackage
} from "./InstalledTemplatePackage";

import {
    PackageCommandResult
} from "./PackageCommandResult";

export interface InstalledPackageCommandResult
    extends PackageCommandResult {

    packages:
        readonly InstalledTemplatePackage[];

}