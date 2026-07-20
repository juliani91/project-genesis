"use client";

import {
    CheckCircle2,
    Database,
    FileText,
    GitBranch,
    Layers3,
    PackageCheck,
    Rocket,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    TerminalSquare,
    Users
} from "lucide-react";

import {
    useMemo,
    useState,
    type ReactNode
} from "react";

export interface ConsoleTemplate {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: string;
    tags: readonly string[];
    role: "base" | "feature";
    parentId?: string;
    install?: ConsoleTemplateInstallSummary;
}

export interface ConsoleTemplateInstallSummary {
    packageManager?: string;
    prerequisites: readonly string[];
    installStepCount: number;
    environmentVariableCount: number;
}

export interface ConsoleRegistry {
    id: string;
    name: string;
    type: string;
    location: string;
    description?: string;
    templateCount: number;
}

export interface ConsoleProfile {
    id: string;
    name: string;
    description: string;
    category: string;
    baseTemplate: string;
    featureTemplates: readonly string[];
}

export interface ConsoleInstalledPackage {
    templateId: string;
    version: string;
    installPath: string;
    source: string;
    installedAt: string;
}

export interface ConsoleRegistryPackage {
    templateId: string;
    name: string;
    description?: string;
    registryId: string;
    source: string;
    latestVersion: string;
    versionCount: number;
}

export interface ConsoleSprintTrack {
    range: string;
    title: string;
    status: string;
    detail: string;
}

export interface ConsoleEnterpriseRole {
    id: string;
    name: string;
    description: string;
    permissions: readonly string[];
}

export interface ConsoleEnterpriseMember {
    id: string;
    name: string;
    email: string;
    roleId: string;
}

export interface ConsoleEnterpriseOrganization {
    id: string;
    name: string;
    description: string;
    roles: readonly ConsoleEnterpriseRole[];
    members: readonly ConsoleEnterpriseMember[];
    registryIds: readonly string[];
}

export interface ConsoleEnterprisePolicyCheck {
    memberId: string;
    permission: string;
    allowed: boolean;
    reason: string;
}

export interface ConsoleEnterpriseAuditEvent {
    id: string;
    actor: string;
    action: string;
    target: string;
    createdAt: string;
}

export interface ConsoleEnterpriseSummary {
    organization: ConsoleEnterpriseOrganization;
    policyChecks: readonly ConsoleEnterprisePolicyCheck[];
    auditEvents: readonly ConsoleEnterpriseAuditEvent[];
}

interface GenesisConsoleProps {
    templates: readonly ConsoleTemplate[];
    registries: readonly ConsoleRegistry[];
    profiles: readonly ConsoleProfile[];
    installedPackages: readonly ConsoleInstalledPackage[];
    registryPackages: readonly ConsoleRegistryPackage[];
    sprintTracks: readonly ConsoleSprintTrack[];
    enterprise: ConsoleEnterpriseSummary;
}

type ConsoleTab =
    | "catalog"
    | "registries"
    | "profiles"
    | "packages"
    | "enterprise"
    | "documentation"
    | "roadmap";

const tabs: {
    id: ConsoleTab;
    label: string;
}[] = [
    {
        id: "catalog",
        label: "Catalog"
    },
    {
        id: "registries",
        label: "Registries"
    },
    {
        id: "profiles",
        label: "Profiles"
    },
    {
        id: "packages",
        label: "Packages"
    },
    {
        id: "enterprise",
        label: "Enterprise"
    },
    {
        id: "documentation",
        label: "Documentation"
    },
    {
        id: "roadmap",
        label: "Roadmap"
    }
];

export function GenesisConsole({
    templates,
    registries,
    profiles,
    installedPackages,
    registryPackages,
    sprintTracks,
    enterprise
}: GenesisConsoleProps) {
    const [
        activeTab,
        setActiveTab
    ] = useState<ConsoleTab>(
        "catalog"
    );

    const [
        query,
        setQuery
    ] = useState(
        ""
    );

    const [
        roleFilter,
        setRoleFilter
    ] = useState<
        "all" | "base" | "feature"
    >(
        "all"
    );

    const [
        categoryFilter,
        setCategoryFilter
    ] = useState(
        "all"
    );

    const categories =
        useMemo(
            () =>
                [
                    "all",
                    ...Array.from(
                        new Set(
                            templates.map(
                                (template) =>
                                    template.category
                            )
                        )
                    ).sort()
                ],
            [
                templates
            ]
        );

    const filteredTemplates =
        useMemo(
            () => {
                const normalizedQuery =
                    query
                        .trim()
                        .toLowerCase();

                return templates.filter(
                    (template) => {
                        const matchesRole =
                            roleFilter ===
                                "all" ||
                            template.role ===
                                roleFilter;

                        const matchesCategory =
                            categoryFilter ===
                                "all" ||
                            template.category ===
                                categoryFilter;

                        const searchable =
                            [
                                template.name,
                                template.description,
                                template.author,
                                template.category,
                                ...template.tags
                            ]
                                .join(" ")
                                .toLowerCase();

                        const matchesQuery =
                            !normalizedQuery ||
                            searchable.includes(
                                normalizedQuery
                            );

                        return (
                            matchesRole &&
                            matchesCategory &&
                            matchesQuery
                        );
                    }
                );
            },
            [
                templates,
                query,
                roleFilter,
                categoryFilter
            ]
        );

    const selectedTemplate =
        filteredTemplates[0] ??
        templates[0];

    const baseCount =
        templates.filter(
            (template) =>
                template.role ===
                "base"
        ).length;

    const featureCount =
        templates.filter(
            (template) =>
                template.role ===
                "feature"
        ).length;

    const registryTemplateCount =
        registries.reduce(
            (
                total,
                registry
            ) =>
                total +
                registry.templateCount,
            0
        );

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-teal-700">
                                <TerminalSquare className="h-4 w-4" />
                                Sprint 45-48 release console
                            </div>
                            <h1 className="text-4xl font-semibold tracking-normal text-zinc-950">
                                Project Genesis
                            </h1>
                            <p className="mt-3 text-base leading-7 text-zinc-600">
                                Inspect templates, registries, profiles, package state, enterprise policy, and release readiness from the same service-backed workspace.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                                onClick={() => setActiveTab("catalog")}
                                type="button"
                            >
                                <Layers3 className="h-4 w-4" />
                                Catalog
                            </button>
                            <button
                                className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
                                onClick={() => setActiveTab("packages")}
                                type="button"
                            >
                                <PackageCheck className="h-4 w-4" />
                                Packages
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <MetricCard
                            icon={<Layers3 className="h-5 w-5" />}
                            label="Templates"
                            value={templates.length}
                            detail={`${baseCount} base, ${featureCount} feature`}
                        />
                        <MetricCard
                            icon={<Database className="h-5 w-5" />}
                            label="Registries"
                            value={registries.length}
                            detail={`${registryTemplateCount} advertised entries`}
                        />
                        <MetricCard
                            icon={<GitBranch className="h-5 w-5" />}
                            label="Profiles"
                            value={profiles.length}
                            detail="Reusable stack presets"
                        />
                        <MetricCard
                            icon={<PackageCheck className="h-5 w-5" />}
                            label="Installed"
                            value={installedPackages.length}
                            detail={`${registryPackages.length} installable remote packages`}
                        />
                        <MetricCard
                            icon={<Users className="h-5 w-5" />}
                            label="Members"
                            value={enterprise.organization.members.length}
                            detail={`${enterprise.organization.roles.length} roles, ${enterprise.policyChecks.length} policy checks`}
                        />
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                <div className="flex flex-wrap gap-2 border-b border-zinc-200">
                    {tabs.map((tab) => (
                        <button
                            className={[
                                "h-10 rounded-t-md px-4 text-sm font-medium",
                                activeTab === tab.id
                                    ? "border border-b-white border-zinc-200 bg-white text-zinc-950"
                                    : "text-zinc-600 hover:bg-zinc-100"
                            ].join(" ")}
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "catalog" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.5fr_1fr]">
                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Template Catalog
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-600">
                                        Search, filter, and inspect loaded template packages.
                                    </p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-[1fr_130px_150px]">
                                    <label className="flex h-10 items-center gap-2 rounded-md border border-zinc-300 px-3 text-sm text-zinc-600">
                                        <Search className="h-4 w-4" />
                                        <input
                                            className="min-w-0 flex-1 bg-transparent text-zinc-950 outline-none"
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Search templates"
                                            value={query}
                                        />
                                    </label>
                                    <select
                                        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
                                        onChange={(event) => setRoleFilter(event.target.value as "all" | "base" | "feature")}
                                        value={roleFilter}
                                    >
                                        <option value="all">All roles</option>
                                        <option value="base">Base</option>
                                        <option value="feature">Feature</option>
                                    </select>
                                    <select
                                        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
                                        onChange={(event) => setCategoryFilter(event.target.value)}
                                        value={categoryFilter}
                                    >
                                        {categories.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category === "all"
                                                    ? "All categories"
                                                    : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {filteredTemplates.map((template) => (
                                    <article
                                        className="rounded-lg border border-zinc-200 p-4"
                                        key={template.id}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {template.name}
                                                </h3>
                                                <p className="mt-1 text-sm leading-6 text-zinc-600">
                                                    {template.description}
                                                </p>
                                            </div>
                                            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                                                v{template.version}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                            <Badge tone="cyan">
                                                {template.category}
                                            </Badge>
                                            <Badge tone={template.role === "base" ? "zinc" : "teal"}>
                                                {template.role}
                                            </Badge>
                                            {template.tags.slice(0, 3).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    tone="zinc"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <DetailPanel
                            selectedTemplate={selectedTemplate}
                            filteredCount={filteredTemplates.length}
                            totalCount={templates.length}
                        />
                    </section>
                )}

                {activeTab === "registries" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.2fr_1fr]">
                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <SectionHeading
                                icon={<Database className="h-5 w-5" />}
                                subtitle="Discovered local and remote registry manifests."
                                title="Registries"
                            />
                            <div className="space-y-3">
                                {registries.map((registry) => (
                                    <div
                                        className="rounded-lg border border-zinc-200 p-4"
                                        key={registry.id}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h3 className="font-semibold">
                                                {registry.name}
                                            </h3>
                                            <Badge tone={registry.type === "remote" ? "teal" : "zinc"}>
                                                {registry.type}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 break-all text-sm text-zinc-600">
                                            {registry.location}
                                        </p>
                                        <p className="mt-2 text-sm text-zinc-600">
                                            {registry.templateCount} advertised templates
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <CommandPanel
                            commands={[
                                "npm.cmd run genesis -- sync",
                                registries[0]
                                    ? `npm.cmd run genesis -- sync --registry ${registries[0].id}`
                                    : "npm.cmd run genesis -- sync --registry <registry-id>",
                                "npm.cmd run genesis -- search <query>"
                            ]}
                            title="Registry Operations"
                        />
                    </section>
                )}

                {activeTab === "profiles" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.3fr_1fr]">
                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <SectionHeading
                                icon={<GitBranch className="h-5 w-5" />}
                                subtitle="Preset project stacks built from base and feature templates."
                                title="Profiles"
                            />
                            <div className="grid gap-3 md:grid-cols-2">
                                {profiles.map((profile) => (
                                    <article
                                        className="rounded-lg border border-zinc-200 p-4"
                                        key={profile.id}
                                    >
                                        <h3 className="font-semibold">
                                            {profile.name}
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                                            {profile.description}
                                        </p>
                                        <div className="mt-4 space-y-2 text-sm">
                                            <div>
                                                Base: <span className="font-medium">{profile.baseTemplate}</span>
                                            </div>
                                            <div>
                                                Features: <span className="font-medium">{profile.featureTemplates.length}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <CommandPanel
                            commands={[
                                "npm.cmd run genesis",
                                "Choose Use a Profile",
                                profiles[0]
                                    ? `Select ${profiles[0].name}`
                                    : "Select a discovered profile"
                            ]}
                            title="Profile Flow"
                        />
                    </section>
                )}

                {activeTab === "packages" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.3fr_1fr]">
                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <SectionHeading
                                icon={<PackageCheck className="h-5 w-5" />}
                                subtitle="Installable registry packages and local installed package records."
                                title="Packages"
                            />
                            <div className="space-y-5">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                                        Installable Registry Packages
                                    </h3>
                                    <div className="space-y-3">
                                        {registryPackages.length === 0 && (
                                            <EmptyState text="No installable remote packages are advertised by the current registries." />
                                        )}
                                        {registryPackages.map((template) => (
                                            <div
                                                className="rounded-lg border border-zinc-200 p-4"
                                                key={`${template.registryId}:${template.templateId}`}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="font-semibold">
                                                        {template.name}
                                                    </h4>
                                                    <Badge tone="teal">
                                                        v{template.latestVersion}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 text-sm text-zinc-600">
                                                    {template.description ?? "No description provided."}
                                                </p>
                                                <p className="mt-2 text-xs text-zinc-500">
                                                    {template.registryId} - {template.versionCount} versions
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                                        Installed Packages
                                    </h3>
                                    <div className="space-y-3">
                                        {installedPackages.length === 0 && (
                                            <EmptyState text="No template packages are installed yet." />
                                        )}
                                        {installedPackages.map((installed) => (
                                            <div
                                                className="rounded-lg border border-zinc-200 p-4"
                                                key={`${installed.templateId}:${installed.version}`}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="font-semibold">
                                                        {installed.templateId}
                                                    </h4>
                                                    <Badge tone="zinc">
                                                        v{installed.version}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 break-all text-sm text-zinc-600">
                                                    {installed.installPath}
                                                </p>
                                                <p className="mt-2 text-xs text-zinc-500">
                                                    {installed.source} - {installed.installedAt}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CommandPanel
                            commands={[
                                "npm.cmd run genesis -- list",
                                registryPackages[0]
                                    ? `npm.cmd run genesis -- info ${registryPackages[0].templateId} --registry ${registryPackages[0].registryId}`
                                    : "npm.cmd run genesis -- info <template-id>",
                                registryPackages[0]
                                    ? `npm.cmd run genesis -- install ${registryPackages[0].templateId} --registry ${registryPackages[0].registryId}`
                                    : "npm.cmd run genesis -- install <template-id>"
                            ]}
                            title="Package Commands"
                        />
                    </section>
                )}

                {activeTab === "enterprise" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <SectionHeading
                                icon={<Users className="h-5 w-5" />}
                                subtitle="Organization roles, scoped registries, policy checks, and audit events."
                                title={enterprise.organization.name}
                            />
                            <p className="mb-5 text-sm leading-6 text-zinc-600">
                                {enterprise.organization.description}
                            </p>

                            <div className="grid gap-5 xl:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                                        Roles
                                    </h3>
                                    <div className="space-y-3">
                                        {enterprise.organization.roles.map((role) => (
                                            <article
                                                className="rounded-lg border border-zinc-200 p-4"
                                                key={role.id}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="font-semibold">
                                                        {role.name}
                                                    </h4>
                                                    <Badge tone="zinc">
                                                        {role.permissions.length} permissions
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 text-sm leading-6 text-zinc-600">
                                                    {role.description}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {role.permissions.map((permission) => (
                                                        <Badge
                                                            key={permission}
                                                            tone="teal"
                                                        >
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                                        Members
                                    </h3>
                                    <div className="space-y-3">
                                        {enterprise.organization.members.map((member) => (
                                            <article
                                                className="rounded-lg border border-zinc-200 p-4"
                                                key={member.id}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="font-semibold">
                                                        {member.name}
                                                    </h4>
                                                    <Badge tone="cyan">
                                                        {member.roleId}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 break-all text-sm text-zinc-600">
                                                    {member.email}
                                                </p>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 xl:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                                        Policy Checks
                                    </h3>
                                    <div className="space-y-3">
                                        {enterprise.policyChecks.map((check) => (
                                            <div
                                                className="rounded-lg border border-zinc-200 p-4"
                                                key={`${check.memberId}:${check.permission}`}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <span className="font-medium">
                                                        {check.permission}
                                                    </span>
                                                    <Badge tone={check.allowed ? "teal" : "zinc"}>
                                                        {check.allowed ? "Allowed" : "Denied"}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 text-sm leading-6 text-zinc-600">
                                                    {check.reason}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                                        Audit Events
                                    </h3>
                                    <div className="space-y-3">
                                        {enterprise.auditEvents.map((event) => (
                                            <div
                                                className="rounded-lg border border-zinc-200 p-4"
                                                key={event.id}
                                            >
                                                <div className="font-medium">
                                                    {event.action}
                                                </div>
                                                <p className="mt-2 break-all text-sm text-zinc-600">
                                                    {event.actor} - {event.target}
                                                </p>
                                                <p className="mt-2 text-xs text-zinc-500">
                                                    {event.createdAt}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CommandPanel
                            commands={[
                                "npm.cmd run genesis -- sync",
                                "npm.cmd run genesis -- publish <template-id> --version <version> --package <zip-path> --registry <registry-id>",
                                "npm.cmd run genesis -- install <template-id> --registry <registry-id>"
                            ]}
                            title="Governed Workflows"
                        />
                    </section>
                )}

                {activeTab === "documentation" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.5fr_1fr]">
                        <div className="space-y-6">
                            <div className="rounded-lg border border-zinc-200 bg-white p-5">
                                <SectionHeading
                                    icon={<FileText className="h-5 w-5" />}
                                    subtitle="A practical guide for using Project Genesis from selection through generated project setup."
                                    title="How to Use Project Genesis"
                                />
                                <div className="space-y-4 text-sm leading-6 text-zinc-700">
                                    <p>
                                        Project Genesis creates a new project by combining one base template with optional feature templates. You can either build a stack manually or choose a profile that already contains a complete combination.
                                    </p>
                                    <p>
                                        A base template owns the main project shape, such as a Next.js app, FastAPI service, React Native app, Unity workspace, or Godot workspace. Feature templates add focused capabilities such as PostgreSQL, Docker, GitHub Actions, Playwright, Tailwind, auth planning, mobile navigation, game design docs, or AI workspace docs.
                                    </p>
                                </div>
                            </div>

                            <DocumentationSection
                                title="Recommended Workflow"
                                items={[
                                    "Start on the Catalog tab and review available base and feature templates.",
                                    "Use the role and category filters to narrow the catalog to the kind of project you want.",
                                    "Open the Profiles tab when you want a complete stack without selecting individual feature templates.",
                                    "Use the Registries tab to confirm which template source is active.",
                                    "Use the Packages tab when working with installable remote packages.",
                                    "After generation, open the generated README.md and packageInstall.md first."
                                ]}
                            />

                            <DocumentationSection
                                title="Manual Generation Flow"
                                items={[
                                    "Run npm.cmd run genesis.",
                                    "Select a registry. The local registry currently exposes the built-in template library.",
                                    "Choose Build Manually.",
                                    "Select exactly one base template.",
                                    "Add zero or more feature templates. Stop when the desired stack is complete.",
                                    "Review the compatibility report. If it reports conflicts or missing capabilities, choose a different feature combination.",
                                    "Answer the wizard prompts for project name, package name, and description.",
                                    "Choose an output directory that does not already exist.",
                                    "Review the generated files, then follow packageInstall.md to install tools and dependencies."
                                ]}
                            />

                            <DocumentationSection
                                title="Profile Generation Flow"
                                items={[
                                    "Run npm.cmd run genesis.",
                                    "Select a registry.",
                                    "Choose Use a Profile.",
                                    "Select a profile such as web-saas-starter, api-service, mobile-app, unity-game-jam, or godot-indie-game.",
                                    "Review the profile summary, compatibility report, and version report.",
                                    "Answer the wizard prompts.",
                                    "Choose a new output directory.",
                                    "Open packageInstall.md in the generated project and follow the stack-specific setup instructions."
                                ]}
                            />

                            <DocumentationSection
                                title="Generated Files to Read First"
                                items={[
                                    "README.md explains the generated project purpose and quick start.",
                                    "packageInstall.md explains runtime requirements, package manager choices, install commands, run commands, verification commands, environment variables, and troubleshooting notes.",
                                    "Docs/ARCHITECTURE.md explains the starter architecture when the selected base template provides it.",
                                    "CLAUDE.md and Planning/STATE.md appear when the AI Workspace feature is selected.",
                                    "Feature-specific docs appear under scoped folders such as Database/, Security/, Styling/, Tests/, GameDesign/, or Mobile/."
                                ]}
                            />

                            <DocumentationSection
                                title="Template Selection Rules"
                                items={[
                                    "Choose one base template. Base templates represent the primary project type.",
                                    "Choose feature templates only when their capabilities match the base template.",
                                    "Do not combine conflicting database features such as PostgreSQL and SQLite.",
                                    "Use profiles when you want safe default combinations.",
                                    "Use manual mode when you want to experiment with custom stacks.",
                                    "If compatibility fails, remove the feature named in the issue or choose a base template that provides the missing capability."
                                ]}
                            />

                            <DocumentationSection
                                title="Install Guidance"
                                items={[
                                    "Project Genesis does not install dependencies automatically.",
                                    "Generated packageInstall.md is the source of truth for setup commands.",
                                    "Web and Node starters prefer pnpm, with npm and Bun alternatives where useful.",
                                    "FastAPI starters prefer uv for Python environment and dependency management.",
                                    "React Native starters use Expo commands through npx.",
                                    "Unity and Godot starters include manual editor setup because those toolchains are managed outside normal package managers.",
                                    "Environment variables listed in packageInstall.md are examples only. Replace secrets before real deployment and never commit production secrets."
                                ]}
                            />

                            <DocumentationSection
                                title="Common Problems"
                                items={[
                                    "If generation fails because the output directory already exists, choose a new empty directory.",
                                    "If a profile is incompatible, check whether one feature requires a capability that the base template does not provide.",
                                    "If two features conflict, remove one of them. Database features are the most likely conflict.",
                                    "If install commands fail, confirm the runtime from packageInstall.md is installed first.",
                                    "If web tests fail, confirm the app is running before executing E2E tests unless the test config starts it automatically.",
                                    "If game exports fail, confirm Unity modules or Godot export templates are installed for the target platform."
                                ]}
                            />
                        </div>

                        <aside className="space-y-6">
                            <CommandPanel
                                commands={[
                                    "npm.cmd run dev -- --hostname 127.0.0.1 --port 3000",
                                    "npm.cmd run genesis",
                                    "npm.cmd run genesis -- sync",
                                    "npm.cmd run genesis -- search <query>",
                                    "npm.cmd run genesis -- list"
                                ]}
                                title="Essential Commands"
                            />

                            <CommandPanel
                                commands={[
                                    "npm.cmd run verify",
                                    "npm.cmd run test:template-library",
                                    "npm.cmd run test:package-install",
                                    "npm.cmd run test:registry-sync",
                                    "npm.cmd run test:enterprise"
                                ]}
                                title="Verification Commands"
                            />

                            <div className="rounded-lg border border-zinc-200 bg-white p-5">
                                <SectionHeading
                                    icon={<ShieldCheck className="h-5 w-5" />}
                                    subtitle="Use this checklist after generating a project."
                                    title="Generated Project Checklist"
                                />
                                <div className="space-y-3 text-sm text-zinc-700">
                                    <ReadinessItem text="Read README.md" />
                                    <ReadinessItem text="Read packageInstall.md" />
                                    <ReadinessItem text="Install required runtime tools" />
                                    <ReadinessItem text="Install project dependencies" />
                                    <ReadinessItem text="Set required environment variables" />
                                    <ReadinessItem text="Run verification commands" />
                                    <ReadinessItem text="Commit generated starter files" />
                                </div>
                            </div>
                        </aside>
                    </section>
                )}

                {activeTab === "roadmap" && (
                    <section className="grid gap-6 py-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <SectionHeading
                                icon={<Rocket className="h-5 w-5" />}
                                subtitle="Sprint bands from publishing through release packaging."
                                title="Completion Roadmap"
                            />
                            <div className="divide-y divide-zinc-100">
                                {sprintTracks.map((track) => (
                                    <div
                                        className="grid gap-3 py-4 sm:grid-cols-[88px_1fr_130px]"
                                        key={track.range}
                                    >
                                        <div className="text-sm font-semibold text-zinc-500">
                                            Sprint {track.range}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                {track.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-zinc-600">
                                                {track.detail}
                                            </p>
                                        </div>
                                        <Badge tone={track.status === "Complete" ? "teal" : "zinc"}>
                                            {track.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 bg-white p-5">
                            <SectionHeading
                                icon={<ShieldCheck className="h-5 w-5" />}
                                subtitle="Core capabilities now visible from the UI."
                                title="Release Readiness"
                            />
                            <div className="space-y-3 text-sm text-zinc-700">
                                <ReadinessItem text="Generation engine" />
                                <ReadinessItem text="Template composition" />
                                <ReadinessItem text="Remote packages" />
                                <ReadinessItem text="Registry synchronization" />
                                <ReadinessItem text="Interactive UI console" />
                                <ReadinessItem text="Enterprise policy foundation" />
                                <ReadinessItem text="Release verification script" />
                                <ReadinessItem text="Release documentation" />
                            </div>
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}

function MetricCard({
    icon,
    label,
    value,
    detail
}: {
    icon: ReactNode;
    label: string;
    value: number;
    detail: string;
}) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between text-zinc-600">
                <span className="text-sm font-medium">
                    {label}
                </span>
                {icon}
            </div>
            <div className="mt-3 text-3xl font-semibold">
                {value}
            </div>
            <div className="mt-1 text-sm text-zinc-500">
                {detail}
            </div>
        </div>
    );
}

function Badge({
    children,
    tone
}: {
    children: ReactNode;
    tone: "cyan" | "teal" | "zinc";
}) {
    const className =
        tone === "cyan"
            ? "bg-cyan-50 text-cyan-800 ring-cyan-100"
            : tone === "teal"
                ? "bg-teal-50 text-teal-800 ring-teal-100"
                : "bg-zinc-100 text-zinc-700 ring-zinc-200";

    return (
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
            {children}
        </span>
    );
}

function SectionHeading({
    icon,
    title,
    subtitle
}: {
    icon: ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="mb-5 flex items-start justify-between gap-4">
            <div>
                <h2 className="text-lg font-semibold">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                    {subtitle}
                </p>
            </div>
            <div className="text-teal-700">
                {icon}
            </div>
        </div>
    );
}

function DetailPanel({
    selectedTemplate,
    filteredCount,
    totalCount
}: {
    selectedTemplate?: ConsoleTemplate;
    filteredCount: number;
    totalCount: number;
}) {
    return (
        <aside className="rounded-lg border border-zinc-200 bg-white p-5">
            <SectionHeading
                icon={<SlidersHorizontal className="h-5 w-5" />}
                subtitle={`${filteredCount} of ${totalCount} templates match the current filters.`}
                title="Catalog Detail"
            />

            {!selectedTemplate && (
                <EmptyState text="No templates match the current filters." />
            )}

            {selectedTemplate && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold">
                            {selectedTemplate.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            {selectedTemplate.description}
                        </p>
                    </div>
                    <dl className="grid gap-3 text-sm">
                        <DetailRow
                            label="Template ID"
                            value={selectedTemplate.id}
                        />
                        <DetailRow
                            label="Version"
                            value={selectedTemplate.version}
                        />
                        <DetailRow
                            label="Author"
                            value={selectedTemplate.author}
                        />
                        <DetailRow
                            label="Role"
                            value={selectedTemplate.role}
                        />
                        <DetailRow
                            label="Parent"
                            value={selectedTemplate.parentId ?? "None"}
                        />
                    </dl>
                    {selectedTemplate.install && (
                        <div className="rounded-lg border border-zinc-200 p-4">
                            <h4 className="font-semibold">
                                Install Guidance
                            </h4>
                            <p className="mt-2 text-sm text-zinc-600">
                                {selectedTemplate.install.packageManager ?? "Package manager guidance is provided by the generated install guide."}
                            </p>
                            <div className="mt-3 grid gap-2 text-sm">
                                <DetailRow
                                    label="Steps"
                                    value={String(selectedTemplate.install.installStepCount)}
                                />
                                <DetailRow
                                    label="Env Vars"
                                    value={String(selectedTemplate.install.environmentVariableCount)}
                                />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedTemplate.install.prerequisites.slice(0, 4).map((prerequisite) => (
                                    <Badge
                                        key={prerequisite}
                                        tone="zinc"
                                    >
                                        {prerequisite}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag) => (
                            <Badge
                                key={tag}
                                tone="zinc"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}

function DetailRow({
    label,
    value
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="grid grid-cols-[96px_1fr] gap-3">
            <dt className="text-zinc-500">
                {label}
            </dt>
            <dd className="break-all font-medium text-zinc-800">
                {value}
            </dd>
        </div>
    );
}

function CommandPanel({
    title,
    commands
}: {
    title: string;
    commands: readonly string[];
}) {
    return (
        <aside className="rounded-lg border border-zinc-200 bg-white p-5">
            <SectionHeading
                icon={<TerminalSquare className="h-5 w-5" />}
                subtitle="CLI flows that match the current workspace state."
                title={title}
            />
            <div className="space-y-3">
                {commands.map((command) => (
                    <code
                        className="block overflow-x-auto rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-50"
                        key={command}
                    >
                        {command}
                    </code>
                ))}
            </div>
        </aside>
    );
}

function DocumentationSection({
    title,
    items
}: {
    title: string;
    items: readonly string[];
}) {
    return (
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold">
                {title}
            </h2>
            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <div
                        className="flex gap-3 text-sm leading-6 text-zinc-700"
                        key={item}
                    >
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-700" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function EmptyState({
    text
}: {
    text: string;
}) {
    return (
        <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
            {text}
        </div>
    );
}

function ReadinessItem({
    text
}: {
    text: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-700" />
            <span>{text}</span>
        </div>
    );
}
