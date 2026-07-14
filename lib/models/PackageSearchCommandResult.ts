import {
    RegistrySearchResult
} from "./RegistrySearchResult";

import {
    PackageCommandResult
} from "./PackageCommandResult";

export interface PackageSearchCommandResult
    extends PackageCommandResult {

    results:
        readonly RegistrySearchResult[];

}