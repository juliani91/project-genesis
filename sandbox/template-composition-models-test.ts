import {
    TemplateCompositionPlan,
    TemplateCompositionRequest,
    TemplatePackage
} from "../lib/models";

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

function main(): void {

    const base =
        createTemplate(
            "nextjs",
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

    const request:
        TemplateCompositionRequest = {

        baseTemplate:
            base,

        featureTemplates: [
            docker,
            playwright
        ]
    };

    const plan:
        TemplateCompositionPlan = {

        baseTemplate:
            request.baseTemplate,

        featureTemplates:
            request.featureTemplates,

        orderedTemplates: [
            request.baseTemplate,
            ...request.featureTemplates
        ]
    };

    if (
        plan.baseTemplate !==
        base
    ) {

        throw new Error(
            "The base template was not preserved."
        );

    }

    if (
        plan.featureTemplates.length !==
        2
    ) {

        throw new Error(
            "The feature template collection was incorrect."
        );

    }

    if (
        plan.orderedTemplates.length !==
        3
    ) {

        throw new Error(
            "The ordered template collection was incorrect."
        );

    }

    if (
        plan.orderedTemplates[0] !==
        base
    ) {

        throw new Error(
            "The base template was not first in merge order."
        );

    }

    if (
        plan.orderedTemplates[1] !==
            docker ||
        plan.orderedTemplates[2] !==
            playwright
    ) {

        throw new Error(
            "The feature template order was not preserved."
        );

    }

    console.log(
        "Template composition models test completed successfully."
    );

}

main();