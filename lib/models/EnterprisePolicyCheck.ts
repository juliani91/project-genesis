import {
    EnterprisePermission
} from "./EnterprisePermission";

export interface EnterprisePolicyCheck {

    memberId:
        string;

    permission:
        EnterprisePermission;

    allowed:
        boolean;

    reason:
        string;

}
