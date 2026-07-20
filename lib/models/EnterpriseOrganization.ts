import {
    EnterpriseMember
} from "./EnterpriseMember";

import {
    EnterpriseRole
} from "./EnterpriseRole";

export interface EnterpriseOrganization {

    id:
        string;

    name:
        string;

    description:
        string;

    roles:
        readonly EnterpriseRole[];

    members:
        readonly EnterpriseMember[];

    registryIds:
        readonly string[];

}
