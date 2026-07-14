import {
    InstalledTemplatePackage
} from "./InstalledTemplatePackage";

import {
    PackageCommandResult
} from "./PackageCommandResult";

export interface PackageRemovalCommandResult
    extends PackageCommandResult {

    removed?:
        InstalledTemplatePackage;

}