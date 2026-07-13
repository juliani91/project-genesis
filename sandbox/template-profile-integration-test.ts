import {
    TemplateProfile
} from "../lib/models";

import {
    TemplateCapabilityResolver,
    TemplateCompatibilityValidator,
    TemplateCompositionPresenter,
    TemplateDiscoveryService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService,
    TemplateProfilePresenter,
    TemplateProfileSelectionService
} from "../lib/services";

async function main(): Promise<void> {

    /*
     * Discover templates.
     */
    const templateDiscovery =
        new TemplateDiscoveryService();

    const templates =
        await templateDiscovery.discover();

    if (
        templates.length === 0
    ) {

        throw new Error(
            "No templates were discovered."
        );

    }

    /*
     * Discover profiles.
     */
    const profileDiscovery =
        new TemplateProfileDiscoveryService();

    const discoveredProfiles =
        await profileDiscovery.discover();

    if (
        discoveredProfiles.length === 0
    ) {

        throw new Error(
            "No profiles were discovered."
        );

    }

    /*
     * Sort profiles.
     */
    const selectionService =
        new TemplateProfileSelectionService();

    const profiles =
        selectionService.sort(
            discoveredProfiles
        );

    const profile =
        selectionService.findById(
            profiles,
            "project-genesis-default"
        );

    /*
     * Profile preview.
     */
    const presenter =
        new TemplateProfilePresenter();

    const preview =
        presenter.format(
            profile
        );

    console.log(preview);
    console.log("");

    const expectedPreviewValues = [
        "Profile Preview",
        "Project Genesis Default",
        "project-genesis",
        "Features    : None"
    ];

    for (
        const expectedValue
        of expectedPreviewValues
    ) {

        if (
            !preview.includes(
                expectedValue
            )
        ) {

            throw new Error(
                `The profile preview was missing: ${expectedValue}`
            );

        }

    }

    /*
     * Build the profile composition.
     */
    const compositionService =
        new TemplateProfileCompositionService();

    const result =
        compositionService.build(
            profile,
            templates
        );

    if (
        !result.compatibility
            .compatible
    ) {

        throw new Error(
            [
                "The Project Genesis profile was incompatible:",
                ...result.compatibility
                    .issues
                    .map(
                        (issue) =>
                            issue.message
                    )
            ].join(" ")
        );

    }

    /*
     * Verify capabilities.
     */
    const capabilityResolver =
        new TemplateCapabilityResolver();

    const capabilities =
        capabilityResolver.resolve(
            result.plan
        );

    const expectedCapabilities = [
        "cli",
        "template-generation",
        "typescript"
    ];

    if (
        JSON.stringify(
            capabilities
        ) !==
        JSON.stringify(
            expectedCapabilities
        )
    ) {

        throw new Error(
            [
                "Unexpected Project Genesis capabilities.",
                `Expected: ${expectedCapabilities.join(", ")}`,
                `Actual: ${capabilities.join(", ")}`
            ].join(" ")
        );

    }

    /*
     * Compatibility preview.
     */
    const compatibilityValidator =
        new TemplateCompatibilityValidator();

    const report =
        compatibilityValidator.validate(
            result.plan
        );

    const compositionPresenter =
        new TemplateCompositionPresenter();

    console.log(
        compositionPresenter.format(
            result.plan
        )
    );

    console.log("");

    if (
        !report.compatible
    ) {

        throw new Error(
            "The compatibility validator rejected the Project Genesis profile."
        );

    }

    console.log(
        "Template profile integration test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template profile integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);