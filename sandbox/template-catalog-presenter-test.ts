import {
    TemplateCatalogEntry,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCatalogPresenter
} from "../lib/services";

function createTemplate(): TemplatePackage {

    return {
        manifest: {
            id:
                "nextjs-api",

            extends:
                "base-web",

            name:
                "Next.js API",

            version:
                "1.2.0",

            description:
                "Builds a production-ready Next.js API.",

            author:
                "Project Genesis",

            category:
                "Web",

            tags: [
                "nextjs",
                "typescript",
                "api"
            ]
        },

        path:
            "C:/templates/nextjs-api",

        descriptors: {}
    };

}

function main(): void {

    const template =
        createTemplate();

    const entry:
        TemplateCatalogEntry = {
        id:
            template.manifest.id,

        name:
            template.manifest.name,

        description:
            template.manifest.description,

        version:
            template.manifest.version,

        author:
            template.manifest.author,

        category:
            template.manifest.category ??
            "Uncategorized",

        tags:
            template.manifest.tags ??
            [],

        parentId:
            template.manifest.extends ??
            undefined,

        template
    };

    const presenter =
        new TemplateCatalogPresenter();

    const preview =
        presenter.formatPreview(
            entry
        );

    console.log(preview);

    const expectedValues = [
        "Template Preview",
        "Next.js API",
        "Builds a production-ready Next.js API.",
        "Web",
        "1.2.0",
        "Project Genesis",
        "nextjs, typescript, api",
        "base-web"
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
                `Template preview did not contain: ${expectedValue}`
            );

        }

    }

    const legacyTemplate:
        TemplatePackage = {
        manifest: {
            id:
                "legacy",

            name:
                "Legacy",

            version:
                "1.0.0",

            description:
                "",

            author:
                "Test"
        },

        path:
            "C:/templates/legacy",

        descriptors: {}
    };

    const legacyEntry:
        TemplateCatalogEntry = {
        id:
            legacyTemplate.manifest.id,

        name:
            legacyTemplate.manifest.name,

        description:
            legacyTemplate.manifest.description,

        version:
            legacyTemplate.manifest.version,

        author:
            legacyTemplate.manifest.author,

        category:
            "Uncategorized",

        tags: [],

        parentId:
            undefined,

        template:
            legacyTemplate
    };

    const legacyPreview =
        presenter.formatPreview(
            legacyEntry
        );

    if (
        !legacyPreview.includes(
            "No description provided."
        )
    ) {

        throw new Error(
            "The empty description fallback was not displayed."
        );

    }

    if (
        !legacyPreview.includes(
            "Tags        : None"
        )
    ) {

        throw new Error(
            "The empty tags fallback was not displayed."
        );

    }

    if (
        !legacyPreview.includes(
            "Parent      : None"
        )
    ) {

        throw new Error(
            "The missing parent fallback was not displayed."
        );

    }

    console.log(
        "Template catalog presenter test completed successfully."
    );

}

main();