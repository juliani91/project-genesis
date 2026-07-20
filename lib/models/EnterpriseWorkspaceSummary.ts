import {
    EnterpriseAuditEvent
} from "./EnterpriseAuditEvent";

import {
    EnterpriseOrganization
} from "./EnterpriseOrganization";

import {
    EnterprisePolicyCheck
} from "./EnterprisePolicyCheck";

export interface EnterpriseWorkspaceSummary {

    organization:
        EnterpriseOrganization;

    policyChecks:
        readonly EnterprisePolicyCheck[];

    auditEvents:
        readonly EnterpriseAuditEvent[];

}
