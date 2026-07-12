import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompositionPresenter
} from "../lib/services";

function createTemplate(
    id: string,
    name: string,
    role:
        "base" |
        "feature"
): TemplatePackage {

    return {

        manifest: {

            id,

            name,

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

function main(): void {

    const nextjs =
        createTemplate(
            "nextjs",
            "Next.js",
            "base"
        );

    const docker =
        createTemplate(
            "docker",
            "Docker",
            "feature"
        );

    const playwright =
        createTemplate(
            "playwright",
            "Playwright",
            "feature"
        );

    const plan:
        TemplateCompositionPlan = {

        baseTemplate:
            nextjs,

        featureTemplates: [
            docker,
            playwright
        ],

        orderedTemplates: [
            nextjs,
            docker,
            playwright
        ]

    };

    const presenter =
        new TemplateCompositionPresenter();

    const preview =
        presenter.format(
            plan
        );

    console.log(preview);

    const expectedValues = [
        "Composition Preview",
        "Next.js",
        "Docker",
        "Playwright",
        "Templates to Merge : 3"
    ];

    for (
        const value
        of expectedValues
    ) {

        if (
            !preview.includes(
                value
            )
        ) {

            throw new Error(
                `Missing preview value: ${value}`
            );

        }

    }

    const baseOnlyPlan:
        TemplateCompositionPlan = {

        baseTemplate:
            nextjs,

        featureTemplates: [],

        orderedTemplates: [
            nextjs
        ]

    };

    const baseOnlyPreview =
        presenter.format(
            baseOnlyPlan
        );

    if (
        !baseOnlyPreview.includes(
            "Features      : None"
        )
    ) {

        throw new Error(
            "Base-only compositions did not display the expected feature message."
        );

    }

    console.log(
        "Template composition presenter test completed successfully."
    );

}

main();