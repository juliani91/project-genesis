import {
    ResolvedTemplateRegistry
} from "../lib/models";

import {
    TemplateRegistryPresenter
} from "../lib/services";

function main(): void {

    const presenter =
        new TemplateRegistryPresenter();

    const registry:
        ResolvedTemplateRegistry = {

        id:
            "local",

        name:
            "Local Templates",

        type:
            "local",

        resolvedLocation:
            "C:/ProjectGenesis/templates",

        description:
            "Local Project Genesis templates.",

        templates: [
            {
                templateId:
                    "project-genesis",

                version:
                    "1.0.0",

                name:
                    "Project Genesis",

                description:
                    "Reference Project Genesis template."
            },
            {
                templateId:
                    "nextjs",

                version:
                    "3.2.0",

                name:
                    "Next.js"
            }
        ]
    };

    const preview =
        presenter.format(
            registry
        );

    console.log(
        preview
    );

    const expectedValues = [
        "Registry Preview",
        "Local Templates",
        "local",
        "C:/ProjectGenesis/templates",
        "Local Project Genesis templates.",
        "Templates   : 2",
        "Project Genesis",
        "project-genesis",
        "v1.0.0",
        "Next.js",
        "nextjs",
        "v3.2.0"
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
                `Registry preview was missing: ${expectedValue}`
            );

        }

    }

    const emptyRegistry:
        ResolvedTemplateRegistry = {

        id:
            "empty",

        name:
            "Empty Registry",

        type:
            "remote",

        resolvedLocation:
            "https://registry.example.com/",

        templates: []
    };

    const emptyPreview =
        presenter.format(
            emptyRegistry
        );

    if (
        !emptyPreview.includes(
            "No description provided."
        )
    ) {

        throw new Error(
            "The missing registry description fallback was not displayed."
        );

    }

    if (
        !emptyPreview.includes(
            "Templates   : 0"
        )
    ) {

        throw new Error(
            "The empty registry template count was not displayed."
        );

    }

    if (
        emptyPreview.includes(
            "Available Templates"
        )
    ) {

        throw new Error(
            "The template listing was displayed for an empty registry."
        );

    }

    console.log(
        "Template registry presenter test completed successfully."
    );
    
    const networkPreview =
    presenter.format(
        registry,
        "network"
    );

    if (
        !networkPreview.includes(
            "Source      : Network"
        )
    ) {

        throw new Error(
            "The network source was not displayed."
        );

    }

    const cachePreview =
        presenter.format(
            registry,
            "cache"
        );

    if (
        !cachePreview.includes(
            "Source      : Cache"
        )
    ) {

        throw new Error(
            "The cache source was not displayed."
        );

    }

    const localPreview =
        presenter.format(
            registry,
            "local"
        );

    if (
        !localPreview.includes(
            "Source      : Local"
        )
    ) {

        throw new Error(
            "The local source was not displayed."
        );

    }
}

main();