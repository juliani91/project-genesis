import {
    EnterpriseAuditEvent,
    EnterpriseOrganization,
    EnterpriseWorkspaceSummary,
    TemplateRegistryManifest
} from "../models";

import {
    EnterprisePolicyService
} from "./EnterprisePolicyService";

export class EnterpriseWorkspaceService {

    public constructor(
        private readonly policyService:
            EnterprisePolicyService =
            new EnterprisePolicyService()
    ) {}

    public createDefaultWorkspace(
        registries:
            readonly TemplateRegistryManifest[]
    ): EnterpriseWorkspaceSummary {

        const organization =
            this.createOrganization(
                registries
            );

        const owner =
            organization.members[0];

        const maintainer =
            organization.members[1];

        const reviewer =
            organization.members[2];

        const policyChecks =
            [
                this.policyService.can(
                    organization,
                    owner.id,
                    "organization:manage"
                ),
                this.policyService.can(
                    organization,
                    maintainer.id,
                    "template:publish"
                ),
                this.policyService.can(
                    organization,
                    reviewer.id,
                    "registry:sync"
                )
            ];

        return {
            organization,
            policyChecks,
            auditEvents:
                this.createAuditEvents(
                    organization
                )
        };

    }

    private createOrganization(
        registries:
            readonly TemplateRegistryManifest[]
    ): EnterpriseOrganization {

        return {
            id:
                "project-genesis-org",

            name:
                "Project Genesis Organization",

            description:
                "Default enterprise workspace for governing template registries, packages, and publishing workflows.",

            registryIds:
                registries.map(
                    (manifest) =>
                        manifest.registry.id
                ),

            roles: [
                {
                    id:
                        "owner",
                    name:
                        "Owner",
                    description:
                        "Manages organization policy, registries, publishing, and package lifecycle operations.",
                    permissions: [
                        "template:read",
                        "template:publish",
                        "registry:read",
                        "registry:sync",
                        "package:install",
                        "package:remove",
                        "organization:manage"
                    ]
                },
                {
                    id:
                        "maintainer",
                    name:
                        "Maintainer",
                    description:
                        "Publishes templates, synchronizes registries, and manages installed packages.",
                    permissions: [
                        "template:read",
                        "template:publish",
                        "registry:read",
                        "registry:sync",
                        "package:install",
                        "package:remove"
                    ]
                },
                {
                    id:
                        "reviewer",
                    name:
                        "Reviewer",
                    description:
                        "Reviews templates and registry state without mutating the workspace.",
                    permissions: [
                        "template:read",
                        "registry:read"
                    ]
                }
            ],

            members: [
                {
                    id:
                        "owner",
                    name:
                        "Workspace Owner",
                    email:
                        "owner@projectgenesis.local",
                    roleId:
                        "owner"
                },
                {
                    id:
                        "maintainer",
                    name:
                        "Template Maintainer",
                    email:
                        "maintainer@projectgenesis.local",
                    roleId:
                        "maintainer"
                },
                {
                    id:
                        "reviewer",
                    name:
                        "Template Reviewer",
                    email:
                        "reviewer@projectgenesis.local",
                    roleId:
                        "reviewer"
                }
            ]
        };

    }

    private createAuditEvents(
        organization:
            EnterpriseOrganization
    ): readonly EnterpriseAuditEvent[] {

        const createdAt =
            new Date(
                "2026-07-20T00:00:00.000Z"
            );

        return [
            {
                id:
                    "enterprise-policy-created",
                actor:
                    organization.members[0].email,
                action:
                    "created enterprise policy",
                target:
                    organization.name,
                createdAt
            },
            {
                id:
                    "registry-scope-assigned",
                actor:
                    organization.members[0].email,
                action:
                    "assigned registry scope",
                target:
                    organization.registryIds.join(
                        ", "
                    ),
                createdAt
            }
        ];

    }

}
