import {
    TemplateCatalogEntry,
    TemplatePackage
} from "../lib/models";

function createTemplate(
    id: string,
    parent?: string
): TemplatePackage {

    return {
        manifest: {
            id,
            extends: parent,
            name: "Test Template",
            version: "1.0.0",
            description:
                "A template used for catalog testing.",
            author:
                "Project Genesis",
            category:
                "Web",
            tags: [
                "typescript",
                "testing"
            ]
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function main(): void {

    const template =
        createTemplate(
            "nextjs-api",
            "base-web"
        );

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

    if (
        entry.id !==
        "nextjs-api"
    ) {

        throw new Error(
            "The catalog entry ID was incorrect."
        );

    }

    if (
        entry.category !==
        "Web"
    ) {

        throw new Error(
            "The catalog entry category was incorrect."
        );

    }

    if (
        entry.tags.length !==
        2
    ) {

        throw new Error(
            "The catalog entry tags were incorrect."
        );

    }

    if (
        entry.parentId !==
        "base-web"
    ) {

        throw new Error(
            "The catalog entry parent ID was incorrect."
        );

    }

    if (
        entry.template !==
        template
    ) {

        throw new Error(
            "The original template package was not preserved."
        );

    }

    const legacyTemplate:
        TemplatePackage = {

        manifest: {
            id:
                "legacy-template",

            name:
                "Legacy Template",

            version:
                "1.0.0",

            description:
                "",

            author:
                "Test"
        },

        path:
            "C:/templates/legacy-template",

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
            legacyTemplate.manifest.category ??
            "Uncategorized",

        tags:
            legacyTemplate.manifest.tags ??
            [],

        parentId:
            legacyTemplate.manifest.extends ??
            undefined,

        template:
            legacyTemplate
    };

    if (
        legacyEntry.category !==
        "Uncategorized"
    ) {

        throw new Error(
            "The legacy template category was not normalized."
        );

    }

    if (
        legacyEntry.tags.length !==
        0
    ) {

        throw new Error(
            "The legacy template tags were not normalized."
        );

    }

    if (
        legacyEntry.parentId !==
        undefined
    ) {

        throw new Error(
            "The legacy template unexpectedly received a parent ID."
        );

    }

    console.log(
        "Template catalog entry test completed successfully."
    );

}

main();