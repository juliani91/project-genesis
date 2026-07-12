import {
    TemplateCatalogPresenter,
    TemplateCatalogService,
    TemplateDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    if (templates.length === 0) {

        throw new Error(
            "No templates were discovered."
        );

    }

    const catalogService =
        new TemplateCatalogService();

    const catalog =
        catalogService.createCatalog(
            templates
        );

    const projectGenesis =
        catalog.find(
            (entry) =>
                entry.id ===
                "project-genesis"
        );

    if (!projectGenesis) {

        throw new Error(
            "The Project Genesis catalog entry was not created."
        );

    }

    if (
        projectGenesis.name !==
        "Project Genesis"
    ) {

        throw new Error(
            "The Project Genesis catalog name was incorrect."
        );

    }

    if (
        projectGenesis.category !==
        "Project Scaffolding"
    ) {

        throw new Error(
            [
                "The Project Genesis catalog category was incorrect.",
                `Actual value: ${projectGenesis.category}`
            ].join(" ")
        );

    }

    const expectedTags = [
        "project-genesis",
        "typescript",
        "template",
        "generator"
    ];

    for (
        const expectedTag
        of expectedTags
    ) {

        if (
            !projectGenesis.tags.includes(
                expectedTag
            )
        ) {

            throw new Error(
                `The Project Genesis catalog entry was missing tag: ${expectedTag}`
            );

        }

    }

    if (
        projectGenesis.parentId !==
        undefined
    ) {

        throw new Error(
            "The Project Genesis root template unexpectedly had a parent."
        );

    }

    if (
        projectGenesis.template !==
        templates.find(
            (template) =>
                template.manifest.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "The catalog entry did not preserve the discovered template package."
        );

    }

    /*
     * Search by name.
     */
    const nameSearch =
        catalogService.search(
            catalog,
            "genesis"
        );

    if (
        !nameSearch.some(
            (entry) =>
                entry.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "Searching by name did not return Project Genesis."
        );

    }

    /*
     * Search by tag.
     */
    const tagSearch =
        catalogService.search(
            catalog,
            "typescript generator"
        );

    if (
        !tagSearch.some(
            (entry) =>
                entry.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "Searching by multiple tags did not return Project Genesis."
        );

    }

    /*
     * Category filter.
     */
    const categoryResults =
        catalogService.filterByCategory(
            catalog,
            "project scaffolding"
        );

    if (
        !categoryResults.some(
            (entry) =>
                entry.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "Filtering by category did not return Project Genesis."
        );

    }

    /*
     * Author filter.
     */
    const authorResults =
        catalogService.filterByAuthor(
            catalog,
            "project genesis"
        );

    if (
        !authorResults.some(
            (entry) =>
                entry.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "Filtering by author did not return Project Genesis."
        );

    }

    const presenter =
        new TemplateCatalogPresenter();

    const preview =
        presenter.formatPreview(
            projectGenesis
        );

    console.log(preview);

    const expectedPreviewValues = [
        "Template Preview",
        "Project Genesis",
        "Project Scaffolding",
        "project-genesis, typescript, template, generator",
        "Parent      : None"
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
                `The real template preview did not contain: ${expectedValue}`
            );

        }

    }

    console.log(
        "Catalog entries discovered:",
        catalog.length
    );

    console.log(
        "Template catalog integration test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template catalog integration test failed.",
            error
        );

        process.exitCode = 1;

    }
);