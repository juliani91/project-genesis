import {
    PackageCommandResult
} from "./PackageCommandResult";

import {
    TemplateRegistrySyncEntry
} from "./TemplateRegistrySyncEntry";

export interface TemplateRegistrySyncResult
    extends PackageCommandResult {

    synced:
        readonly TemplateRegistrySyncEntry[];

}
