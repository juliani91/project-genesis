import {
    InstalledTemplatePackage
} from "./InstalledTemplatePackage";

import {
    PackageCommandResult
} from "./PackageCommandResult";

export interface PackageInstallationCommandResult
    extends PackageCommandResult {

    package:
        InstalledTemplatePackage;

}