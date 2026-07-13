import {
    ENGINE_VERSION
} from "../lib/constants";

import {
    TemplateCatalogService,
    TemplateCompatibilityValidator,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService,
    TemplateProfileSelectionService,
    TemplateRegistryDiscoveryService,
    TemplateRegistryPresenter,
    TemplateRegistryResolver,
    TemplateVersionReportService
} from "../lib/services";

import {
    TemplateDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    /*
     * Discover real registry manifests.
     */
    const registryDiscovery =
        new TemplateRegistryDiscoveryService();

    const manifests =
        await registryDiscovery.discover();

    if (
        manifests.length === 0
    ) {

        throw new Error(
            "No registry manifests were discovered."
        );

    }

    const localManifest =
        manifests.find(
            (manifest) =>
                manifest.registry.id ===
                "local"
        );

    if (!localManifest) {

        throw new Error(
            "The local registry manifest was not discovered."
        );

    }

    /*
     * Resolve the real local registry.
     */
    const registryResolver =
        new TemplateRegistryResolver();

    const localRegistry =
        registryResolver.resolve(
            localManifest
        );

    if (
        localRegistry.type !==
        "local"
    ) {

        throw new Error(
            "The resolved registry was not local."
        );

    }

    if (
        localRegistry.templates.length !==
        1
    ) {

        throw new Error(
            [
                "The local registry advertised an unexpected number of templates.",
                `Actual: ${localRegistry.templates.length}`
            ].join(" ")
        );

    }

    /*
     * Show and validate the registry preview.
     */
    const registryPresenter =
        new TemplateRegistryPresenter();

    const registryPreview =
        registryPresenter.format(
            localRegistry
        );

    console.log(
        registryPreview
    );

    console.log("");

    const expectedRegistryValues = [
        "Registry Preview",
        "Local Project Genesis Templates",
        "Type        : local",
        "Project Genesis",
        "project-genesis",
        "v1.0.0"
    ];

    for (
        const expectedValue
        of expectedRegistryValues
    ) {

        if (
            !registryPreview.includes(
                expectedValue
            )
        ) {

            throw new Error(
                `The real registry preview was missing: ${expectedValue}`
            );

        }

    }

    /*
     * Discover real templates through the selected registry.
     */
    const templateDiscovery =
        new TemplateDiscoveryService();

    const templates =
        await templateDiscovery
            .discoverFromRegistry(
                localRegistry
            );

    if (
        templates.length !==
        localRegistry.templates.length
    ) {

        throw new Error(
            [
                "The registry-loaded template count was incorrect.",
                `Expected: ${localRegistry.templates.length}`,
                `Actual: ${templates.length}`
            ].join(" ")
        );

    }

    const projectGenesis =
        templates.find(
            (template) =>
                template.manifest.id ===
                "project-genesis"
        );

    if (!projectGenesis) {

        throw new Error(
            "Project Genesis was not loaded through the local registry."
        );

    }

    if (
        projectGenesis.manifest.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The registry-loaded Project Genesis version was incorrect."
        );

    }

    /*
     * Build the catalog from registry-loaded templates.
     */
    const catalogService =
        new TemplateCatalogService();

    const catalog =
        catalogService.createCatalog(
            templates
        );

    if (
        !catalog.some(
            (entry) =>
                entry.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "The registry-loaded template was not added to the catalog."
        );

    }

    /*
     * Discover and select the real profile.
     */
    const profileDiscovery =
        new TemplateProfileDiscoveryService();

    const profiles =
        await profileDiscovery.discover();

    const profileSelection =
        new TemplateProfileSelectionService();

    const profile =
        profileSelection.findById(
            profiles,
            "project-genesis-default"
        );

    /*
     * Build a profile composition using only the
     * registry-loaded template packages.
     */
    const profileComposition =
        new TemplateProfileCompositionService();

    const profileResult =
        profileComposition.build(
            profile,
            templates
        );

    /*
     * Recheck capability compatibility through the
     * public validator used by the CLI.
     */
    const compatibilityValidator =
        new TemplateCompatibilityValidator();

    const compatibility =
        compatibilityValidator.validate(
            profileResult.plan
        );

    if (!compatibility.compatible) {

        throw new Error(
            [
                "The registry-driven profile failed capability validation:",
                ...compatibility.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    /*
     * Validate engine and template versions.
     */
    const versionReportService =
        new TemplateVersionReportService();

    const versionReport =
        versionReportService.createReport(
            profileResult.plan,
            ENGINE_VERSION
        );

    if (!versionReport.compatible) {

        throw new Error(
            [
                "The registry-driven profile failed version validation:",
                ...versionReport.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    if (
        versionReport.issues.length !==
        0
    ) {

        throw new Error(
            [
                "The real registry-driven profile produced unexpected version issues:",
                ...versionReport.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    console.log(
        "Registry templates discovered:",
        templates.length
    );

    console.log(
        "Catalog entries created:",
        catalog.length
    );

    console.log(
        "Template registry integration test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);