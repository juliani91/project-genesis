import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCapabilityResolver
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    provides:
        string[] = []
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role,
            provides
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function main(): void {

    const base =
        createTemplate(
            "nextjs",
            "base",
            [
                " TypeScript ",
                "node",
                "react"
            ]
        );

    const testing =
        createTemplate(
            "playwright",
            "feature",
            [
                "testing",
                "NODE",
                "playwright"
            ]
        );

    const emptyFeature =
        createTemplate(
            "empty-feature",
            "feature"
        );

    const plan:
        TemplateCompositionPlan = {

        baseTemplate:
            base,

        featureTemplates: [
            testing,
            emptyFeature
        ],

        orderedTemplates: [
            base,
            testing,
            emptyFeature
        ]
    };

    const resolver =
        new TemplateCapabilityResolver();

    const capabilities =
        resolver.resolve(
            plan
        );

    console.log(
        "Resolved capabilities:",
        capabilities
    );

    const expected = [
        "node",
        "playwright",
        "react",
        "testing",
        "typescript"
    ];

    if (
        JSON.stringify(
            capabilities
        ) !==
        JSON.stringify(
            expected
        )
    ) {

        throw new Error(
            [
                "Resolved capabilities were incorrect.",
                `Expected: ${expected.join(", ")}`,
                `Actual: ${capabilities.join(", ")}`
            ].join(" ")
        );

    }

    const directCapabilities =
        resolver.resolveTemplates(
            [
                testing
            ]
        );

    if (
        directCapabilities.join(",") !==
        "node,playwright,testing"
    ) {

        throw new Error(
            "Direct template capability resolution was incorrect."
        );

    }

    const emptyCapabilities =
        resolver.resolveTemplates(
            []
        );

    if (
        emptyCapabilities.length !==
        0
    ) {

        throw new Error(
            "An empty template list produced capabilities."
        );

    }

    console.log(
        "Template capability resolver test completed successfully."
    );

}

main();