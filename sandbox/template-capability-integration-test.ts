import {
    TemplateCapabilityResolver,
    TemplateCatalogService,
    TemplateCompatibilityPresenter,
    TemplateCompatibilityValidator,
    TemplateCompositionPlanner,
    TemplateDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

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

    const catalogService =
        new TemplateCatalogService();

    const catalog =
        catalogService.createCatalog(
            templates
        );

    const catalogEntry =
        catalog.find(
            (entry) =>
                entry.id ===
                "project-genesis"
        );

    if (!catalogEntry) {

        throw new Error(
            "Project Genesis was not added to the template catalog."
        );

    }

    const planner =
        new TemplateCompositionPlanner();

    const plan =
        planner.createPlan(
            {
                baseTemplate:
                    projectGenesis,

                featureTemplates: []
            },
            templates
        );

    const capabilityResolver =
        new TemplateCapabilityResolver();

    const capabilities =
        capabilityResolver.resolve(
            plan
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
                "The real Project Genesis capabilities were incorrect.",
                `Expected: ${expectedCapabilities.join(", ")}`,
                `Actual: ${capabilities.join(", ")}`
            ].join(" ")
        );

    }

    const validator =
        new TemplateCompatibilityValidator();

    const report =
        validator.validate(
            plan
        );

    if (!report.compatible) {

        throw new Error(
            [
                "The real Project Genesis base composition was incompatible:",
                ...report.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    if (
        report.issues.length !== 0
    ) {

        throw new Error(
            "The compatible Project Genesis composition produced issues."
        );

    }

    const presenter =
        new TemplateCompatibilityPresenter();

    const preview =
        presenter.format(
            plan,
            report
        );

    console.log(preview);

    const expectedPreviewValues = [
        "Compatibility Preview",
        "Status       : Compatible",
        "Capabilities : cli, template-generation, typescript"
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
                `The real capability preview did not contain: ${expectedValue}`
            );

        }

    }

    console.log(
        "Template capability integration test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template capability integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);