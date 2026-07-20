import {
    EnterpriseOrganization,
    EnterprisePermission,
    EnterprisePolicyCheck
} from "../models";

export class EnterprisePolicyService {

    public can(
        organization:
            EnterpriseOrganization,

        memberId:
            string,

        permission:
            EnterprisePermission
    ): EnterprisePolicyCheck {

        const member =
            organization.members.find(
                (candidate) =>
                    candidate.id ===
                    memberId
            );

        if (!member) {

            return {
                memberId,
                permission,
                allowed:
                    false,
                reason:
                    "Member does not belong to the organization."
            };

        }

        const role =
            organization.roles.find(
                (candidate) =>
                    candidate.id ===
                    member.roleId
            );

        if (!role) {

            return {
                memberId,
                permission,
                allowed:
                    false,
                reason:
                    "Member role is not defined by the organization."
            };

        }

        const allowed =
            role.permissions.includes(
                permission
            );

        return {
            memberId,
            permission,
            allowed,
            reason:
                allowed
                    ? `Role "${role.name}" grants ${permission}.`
                    : `Role "${role.name}" does not grant ${permission}.`
        };

    }

}
