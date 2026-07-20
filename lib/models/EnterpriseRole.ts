import {
    EnterprisePermission
} from "./EnterprisePermission";

export interface EnterpriseRole {

    id:
        string;

    name:
        string;

    description:
        string;

    permissions:
        readonly EnterprisePermission[];

}
