import {
    ENGINE_VERSION
} from "../lib/constants";

import {
    TemplateDiscoveryService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService,
    TemplateProfileSelectionService,
    TemplateVersionPresenter,
    TemplateVersionReportService
} from "../lib/services";

async function main(): Promise<void> {

    /*
     * Discover real templates.
     */
    const templateDiscovery =
        new TemplateDiscoveryService();

    const templates =
        await templateDiscovery.discover();

    const projectGenesis =
        templates.find(
            (template) =>
                template.manifest.id ===
                "project-genesis"
        );

    if (!projectGenesis) {

        throw new Error(
            "Project Genesis template was not discovered."
        );

    }

    if (
        projectGenesis
            .manifest
            .minGenesisVersion !==
        "0.14.0"
    ) {

        throw new Error(
            [
                "The real Project Genesis minimum engine version was incorrect.",
                `Actual: ${projectGenesis.manifest.minGenesisVersion}`
            ].join(" ")
        );

    }

    if (
        projectGenesis
            .manifest
            .deprecated !==
        false
    ) {

        throw new Error(
            "The real Project Genesis template unexpectedly appeared deprecated."
        );

    }

    /*
     * Discover the real default profile.
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
     * Build the real composition plan.
     */
    const profileCompositionService =
        new TemplateProfileCompositionService();

    const profileComposition =
        profileCompositionService.build(
            profile,
            templates
        );

    if (
        !profileComposition
            .compatibility
            .compatible
    ) {

        throw new Error(
            "The real Project Genesis profile failed capability validation."
        );

    }

    /*
     * Build the combined version report.
     */
    const versionReportService =
        new TemplateVersionReportService();

    const report =
        versionReportService.createReport(
            profileComposition.plan,
            ENGINE_VERSION
        );

    if (!report.compatible) {

        throw new Error(
            [
                "The real Project Genesis profile failed version validation:",
                ...report.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    if (
        report.issues.length !==
        0
    ) {

        throw new Error(
            [
                "The real Project Genesis profile produced unexpected version issues:",
                ...report.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    /*
     * Present the real version report.
     */
    const presenter =
        new TemplateVersionPresenter();

    const preview =
        presenter.format(
            ENGINE_VERSION,
            report
        );

    console.log(preview);

    const expectedValues = [
        "Version Preview",
        `Engine Version : ${ENGINE_VERSION}`,
        "Status         : Compatible"
    ];

    for (
        const expectedValue
        of expectedValues
    ) {

        if (
            !preview.includes(
                expectedValue
            )
        ) {

            throw new Error(
                `The real version preview was missing: ${expectedValue}`
            );

        }

    }

    if (
        preview.includes(
            "Errors"
        ) ||
        preview.includes(
            "Warnings"
        )
    ) {

        throw new Error(
            "The real compatible version preview displayed issue sections."
        );

    }

    console.log(
        "Template version integration test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template version integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);