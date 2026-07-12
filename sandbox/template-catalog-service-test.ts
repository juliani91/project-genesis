import {
    TemplateCatalogEntry,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCatalogService
} from "../lib/services";

function createTemplate(
    id: string,
    name: string,
    description: string,
    category?: string,
    tags?: string[],
    author:
        string = "Project Genesis",
    parent?: string
): TemplatePackage {

    return {
        manifest: {
            id,

            extends:
                parent,

            name,

            version:
                "1.0.0",

            description,

            author,

            category,

            tags
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function getIds(
    entries:
        readonly TemplateCatalogEntry[]
): string[] {

    return entries.map(
        (entry) =>
            entry.id
    );

}

function main(): void {

    const templates:
        TemplatePackage[] = [
        createTemplate(
            "python-service",
            "Python Service",
            "Builds a general Python backend.",
            "Python",
            [
                "python",
                "backend"
            ]
        ),

        createTemplate(
            "nextjs-api",
            "Next.js API",
            "Builds a production-ready web API.",
            "Web",
            [
                "nextjs",
                "typescript",
                "api"
            ],
            "Project Genesis",
            "base-web"
        ),

        createTemplate(
            "legacy-template",
            "Legacy Template",
            "Maintains an older application.",
            "   ",
            undefined,
            "Legacy Author"
        ),

        createTemplate(
            "react-app",
            "React Application",
            "Builds a browser user interface.",
            "Web",
            [
                "react",
                "typescript",
                "frontend"
            ]
        ),

        createTemplate(
            "fastapi-service",
            "FastAPI Service",
            "Builds a production Python API.",
            "Python",
            [
                "python",
                "fastapi",
                "api"
            ]
        )
    ];

    const service =
        new TemplateCatalogService();

    const catalog =
        service.createCatalog(
            templates
        );

    const expectedOrder = [
        "fastapi-service",
        "python-service",
        "legacy-template",
        "nextjs-api",
        "react-app"
    ];

    if (
        JSON.stringify(
            getIds(
                catalog
            )
        ) !==
        JSON.stringify(
            expectedOrder
        )
    ) {

        throw new Error(
            [
                "The catalog was not sorted correctly.",
                `Expected: ${expectedOrder.join(", ")}`,
                `Actual: ${getIds(catalog).join(", ")}`
            ].join(" ")
        );

    }

    const webTemplates =
        service.filterByCategory(
            catalog,
            "web"
        );

    if (
        webTemplates.length !== 2
    ) {

        throw new Error(
            `Expected 2 Web templates but received ${webTemplates.length}.`
        );

    }

    const typescriptTemplates =
        service.filterByTag(
            catalog,
            "TYPESCRIPT"
        );

    if (
        typescriptTemplates.length !== 2
    ) {

        throw new Error(
            `Expected 2 TypeScript templates but received ${typescriptTemplates.length}.`
        );

    }

    const legacyTemplates =
        service.filterByAuthor(
            catalog,
            "legacy author"
        );

    if (
        legacyTemplates.length !== 1 ||
        legacyTemplates[0].id !==
            "legacy-template"
    ) {

        throw new Error(
            "Author filtering did not return the legacy template."
        );

    }

    /*
     * Search by name.
     */
    const nextSearch =
        service.search(
            catalog,
            "next"
        );

    if (
        nextSearch.length !== 1 ||
        nextSearch[0].id !==
            "nextjs-api"
    ) {

        throw new Error(
            "Name search did not return the Next.js template."
        );

    }

    /*
     * Search by description.
     */
    const browserSearch =
        service.search(
            catalog,
            "browser"
        );

    if (
        browserSearch.length !== 1 ||
        browserSearch[0].id !==
            "react-app"
    ) {

        throw new Error(
            "Description search did not return the React template."
        );

    }

    /*
     * Search by tag.
     */
    const fastapiSearch =
        service.search(
            catalog,
            "FASTAPI"
        );

    if (
        fastapiSearch.length !== 1 ||
        fastapiSearch[0].id !==
            "fastapi-service"
    ) {

        throw new Error(
            "Tag search did not return the FastAPI template."
        );

    }

    /*
     * Multi-word search across different values.
     *
     * "typescript" comes from the tag.
     * "api" appears in the name, description, or tag.
     */
    const typescriptApiSearch =
        service.search(
            catalog,
            "typescript api"
        );

    if (
        typescriptApiSearch.length !== 1 ||
        typescriptApiSearch[0].id !==
            "nextjs-api"
    ) {

        throw new Error(
            "Multi-word search did not return the Next.js API template."
        );

    }

    /*
     * Search with no match.
     */
    const missingSearch =
        service.search(
            catalog,
            "unity"
        );

    if (
        missingSearch.length !== 0
    ) {

        throw new Error(
            "A missing search unexpectedly returned templates."
        );

    }

    /*
     * Blank search returns all entries.
     */
    const blankSearch =
        service.search(
            catalog,
            "   "
        );

    if (
        blankSearch.length !==
        catalog.length
    ) {

        throw new Error(
            "A blank search did not return the complete catalog."
        );

    }

    /*
     * Search does not mutate the catalog.
     */
    if (
        catalog.length !==
        templates.length
    ) {

        throw new Error(
            "Searching modified the original catalog."
        );

    }

    const nextjs =
        catalog.find(
            (entry) =>
                entry.id ===
                "nextjs-api"
        );

    if (
        nextjs?.parentId !==
        "base-web"
    ) {

        throw new Error(
            "The parent template ID was not preserved."
        );

    }

    console.log(
        "Template catalog sorting, filtering, and search test completed successfully."
    );

}

main();