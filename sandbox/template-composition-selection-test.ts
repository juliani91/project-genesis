import {
    TemplateCatalogEntry,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompositionSelectionService
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature"
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function createEntry(
    template:
        TemplatePackage
): TemplateCatalogEntry {

    return {
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
            "Test",

        tags: [],

        parentId:
            undefined,

        template
    };

}

function main(): void {

    const nextjs =
        createTemplate(
            "nextjs",
            "base"
        );

    const fastapi =
        createTemplate(
            "fastapi",
            "base"
        );

    const docker =
        createTemplate(
            "docker",
            "feature"
        );

    const playwright =
        createTemplate(
            "playwright",
            "feature"
        );

    const templates = [
        nextjs,
        fastapi,
        docker,
        playwright
    ];

    const catalog = [
        createEntry(nextjs),
        createEntry(fastapi),
        createEntry(docker),
        createEntry(playwright)
    ];

    const service =
        new TemplateCompositionSelectionService();

    const baseTemplates =
        service.getBaseTemplates(
            catalog
        );

    if (
        baseTemplates.length !==
        2
    ) {

        throw new Error(
            "Base template filtering failed."
        );

    }

    const featureTemplates =
        service.getFeatureTemplates(
            catalog
        );

    if (
        featureTemplates.length !==
        2
    ) {

        throw new Error(
            "Feature template filtering failed."
        );

    }

    const request =
        service.createRequest(
            "nextjs",
            [
                "docker",
                "playwright",
                "docker"
            ],
            templates
        );

    if (
        request.baseTemplate
            .manifest.id !==
        "nextjs"
    ) {

        throw new Error(
            "Incorrect base template selected."
        );

    }

    if (
        request.featureTemplates.length !==
        2
    ) {

        throw new Error(
            "Duplicate feature templates were not removed."
        );

    }

    let threw =
        false;

    try {

        service.createRequest(
            "docker",
            [],
            templates
        );

    } catch {

        threw =
            true;

    }

    if (!threw) {

        throw new Error(
            "A feature template was accepted as the base template."
        );

    }

    threw =
        false;

    try {

        service.createRequest(
            "nextjs",
            [
                "fastapi"
            ],
            templates
        );

    } catch {

        threw =
            true;

    }

    if (!threw) {

        throw new Error(
            "A base template was accepted as a feature."
        );

    }

    console.log(
        "Template composition selection test completed successfully."
    );

}

main();