import {
    GenesisConsole
} from "./GenesisConsole";

import { loadPackageInstall } from "@/lib/loaders/PackageInstallLoader";
import { InstalledTemplatePackageStore } from "@/lib/services/InstalledTemplatePackageStore";
import { EnterpriseWorkspaceService } from "@/lib/services/EnterpriseWorkspaceService";
import { TemplateCatalogService } from "@/lib/services/TemplateCatalogService";
import { TemplateProfileDiscoveryService } from "@/lib/services/TemplateProfileDiscoveryService";
import { TemplateRegistryDiscoveryService } from "@/lib/services/TemplateRegistryDiscoveryService";
import { TemplateRegistryIndexService } from "@/lib/services/TemplateRegistryIndexService";
import { TemplateService } from "@/lib/services/TemplateService";

function summarizeInstallMetadata(
    install:
        Awaited<ReturnType<typeof loadPackageInstall>>
) {
    if (!install) {
        return undefined;
    }

    return {
        packageManager:
            install.packageManager,

        prerequisites:
            install.prerequisites,

        installStepCount:
            install.installSteps.length,

        environmentVariableCount:
            install.environmentVariables.length
    };
}

const sprintTracks = [
    {
        range: "26-30",
        title: "Template publishing ecosystem",
        status: "Complete",
        detail: "Package validation, publish manifests, CLI publishing, and registry handoff are wired."
    },
    {
        range: "31-35",
        title: "Registry server and synchronization",
        status: "Complete",
        detail: "Registry sync, cache refresh, cache fallback, and CLI synchronization are available."
    },
    {
        range: "36-40",
        title: "UI feature completion",
        status: "Complete",
        detail: "The web console now supports tabs, filtering, inspection, package visibility, and workflow commands."
    },
    {
        range: "41-44",
        title: "Enterprise features",
        status: "Complete",
        detail: "Organization roles, permission policy checks, registry scope, and audit summaries are available."
    },
    {
        range: "45-48",
        title: "Polish and packaging",
        status: "Complete",
        detail: "Release scripts, README, release checklist, documentation, and final verification are complete."
    }
];

export default async function Home() {
    const templateService =
        new TemplateService();

    const registryDiscovery =
        new TemplateRegistryDiscoveryService();

    const profileDiscovery =
        new TemplateProfileDiscoveryService();

    const installedStore =
        new InstalledTemplatePackageStore();

    const [
        templates,
        registries,
        profiles,
        installedPackages
    ] = await Promise.all([
        templateService.getTemplates(),
        registryDiscovery.discover(),
        profileDiscovery.discover(),
        installedStore.read()
    ]);

    const catalogService =
        new TemplateCatalogService();

    const catalog =
        catalogService.createCatalog(
            templates
        );

    const registryIndexService =
        new TemplateRegistryIndexService();

    const registryIndex =
        registryIndexService.build(
            registries
        );

    const installMetadataByTemplateId =
        new Map(
            await Promise.all(
                templates.map(
                    async (template) => {
                        const install =
                            await loadPackageInstall(
                                `${template.path}/packageInstall.json`
                            );

                        return [
                            template.manifest.id,
                            install
                        ] as const;
                    }
                )
            )
        );

    const enterpriseWorkspaceService =
        new EnterpriseWorkspaceService();

    const enterpriseSummary =
        enterpriseWorkspaceService.createDefaultWorkspace(
            registries
        );

    return (
        <GenesisConsole
            enterprise={{
                organization: {
                    id:
                        enterpriseSummary.organization.id,

                    name:
                        enterpriseSummary.organization.name,

                    description:
                        enterpriseSummary.organization.description,

                    registryIds:
                        enterpriseSummary.organization.registryIds,

                    roles:
                        enterpriseSummary.organization.roles.map(
                            (role) => ({
                                id:
                                    role.id,

                                name:
                                    role.name,

                                description:
                                    role.description,

                                permissions:
                                    role.permissions
                            })
                        ),

                    members:
                        enterpriseSummary.organization.members.map(
                            (member) => ({
                                id:
                                    member.id,

                                name:
                                    member.name,

                                email:
                                    member.email,

                                roleId:
                                    member.roleId
                            })
                        )
                },

                policyChecks:
                    enterpriseSummary.policyChecks.map(
                        (check) => ({
                            memberId:
                                check.memberId,

                            permission:
                                check.permission,

                            allowed:
                                check.allowed,

                            reason:
                                check.reason
                        })
                    ),

                auditEvents:
                    enterpriseSummary.auditEvents.map(
                        (event) => ({
                            id:
                                event.id,

                            actor:
                                event.actor,

                            action:
                                event.action,

                            target:
                                event.target,

                            createdAt:
                                event.createdAt.toISOString()
                        })
                    )
            }}
            installedPackages={
                installedPackages.packages.map(
                    (installedPackage) => ({
                        templateId:
                            installedPackage.templateId,

                        version:
                            installedPackage.version,

                        installPath:
                            installedPackage.installPath,

                        source:
                            installedPackage.source,

                        installedAt:
                            installedPackage.installedAt.toISOString()
                    })
                )
            }
            profiles={
                profiles.map(
                    (profile) => ({
                        id:
                            profile.id,

                        name:
                            profile.name,

                        description:
                            profile.description,

                        category:
                            profile.category,

                        baseTemplate:
                            profile.baseTemplate,

                        featureTemplates:
                            profile.featureTemplates
                    })
                )
            }
            registries={
                registries.map(
                    (manifest) => ({
                        id:
                            manifest.registry.id,

                        name:
                            manifest.registry.name,

                        type:
                            manifest.registry.type,

                        location:
                            manifest.registry.location,

                        description:
                            manifest.registry.description,

                        templateCount:
                            manifest.templates.length
                    })
                )
            }
            registryPackages={
                registryIndex.templates.map(
                    (template) => ({
                        templateId:
                            template.templateId,

                        name:
                            template.name,

                        description:
                            template.description,

                        registryId:
                            template.registryId,

                        source:
                            template.source,

                        latestVersion:
                            template.latestVersion,

                        versionCount:
                            template.versions.length
                    })
                )
            }
            sprintTracks={sprintTracks}
            templates={
                catalog.map(
                    (entry) => ({
                        id:
                            entry.id,

                        name:
                            entry.name,

                        description:
                            entry.description,

                        version:
                            entry.version,

                        author:
                            entry.author,

                        category:
                            entry.category,

                        tags:
                            entry.tags,

                        role:
                            entry.template.manifest.role ??
                            "base",

                        parentId:
                            entry.parentId,

                        install:
                            summarizeInstallMetadata(
                                installMetadataByTemplateId
                                    .get(
                                        entry.id
                                    )
                            )
                    })
                )
            }
        />
    );
}
