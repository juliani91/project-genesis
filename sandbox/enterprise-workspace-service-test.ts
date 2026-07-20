import {
    TemplateRegistryManifest
} from "../lib/models";

import {
    EnterprisePolicyService,
    EnterpriseWorkspaceService
} from "../lib/services";

function createRegistryManifest(): TemplateRegistryManifest {

    return {
        registry: {
            id:
                "official",
            name:
                "Official Registry",
            type:
                "local",
            location:
                "./templates"
        },

        templates: [
            {
                templateId:
                    "project-genesis",
                version:
                    "1.0.0",
                name:
                    "Project Genesis"
            }
        ]
    };

}

function main(): void {

    const service =
        new EnterpriseWorkspaceService();

    const summary =
        service.createDefaultWorkspace([
            createRegistryManifest()
        ]);

    if (
        summary.organization.roles.length !==
        3
    ) {

        throw new Error(
            "Default enterprise workspace did not create the expected roles."
        );

    }

    if (
        summary.organization.registryIds[0] !==
        "official"
    ) {

        throw new Error(
            "Default enterprise workspace did not scope the registry."
        );

    }

    const policyService =
        new EnterprisePolicyService();

    const ownerCanManage =
        policyService.can(
            summary.organization,
            "owner",
            "organization:manage"
        );

    if (
        !ownerCanManage.allowed
    ) {

        throw new Error(
            "Owner should be allowed to manage the organization."
        );

    }

    const reviewerCanSync =
        policyService.can(
            summary.organization,
            "reviewer",
            "registry:sync"
        );

    if (
        reviewerCanSync.allowed
    ) {

        throw new Error(
            "Reviewer should not be allowed to sync registries."
        );

    }

    const missingMember =
        policyService.can(
            summary.organization,
            "missing",
            "template:read"
        );

    if (
        missingMember.allowed ||
        !missingMember.reason.includes(
            "does not belong"
        )
    ) {

        throw new Error(
            "Missing member policy result was incorrect."
        );

    }

    if (
        summary.auditEvents.length ===
        0
    ) {

        throw new Error(
            "Default enterprise workspace did not create audit events."
        );

    }

    console.log(
        "Enterprise workspace service test completed successfully."
    );

}

main();
