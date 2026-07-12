import {
    Wizard
} from "../lib/models";

import {
    TemplateWizardInheritanceService
} from "../lib/services";

function main(): void {

    const parent: Wizard = {
        title:
            "Base Web Wizard",

        description:
            "Collects common web project settings.",

        steps: [
            {
                id: "project",

                title:
                    "Project Information",

                description:
                    "Collect common project information.",

                fields: [
                    {
                        key: "PROJECT_NAME",
                        label: "Project Name",
                        type: "string",
                        required: true
                    }
                ]
            },
            {
                id:
                    "generation-options",

                title:
                    "Generation Options",

                description:
                    "Choose common capabilities.",

                fields: [
                    {
                        key: "USE_DOCKER",
                        label: "Use Docker",
                        type: "boolean",
                        required: true
                    }
                ]
            }
        ]
    };

    const child: Wizard = {
        title:
            "Next.js Wizard",

        description:
            "Collects Next.js project settings.",

        steps: [
            {
                id:
                    "generation-options",

                title:
                    "Next.js Options",

                description:
                    "Choose Next.js capabilities.",

                fields: [
                    {
                        key:
                            "USE_DATABASE",

                        label:
                            "Use a Database",

                        type:
                            "boolean",

                        required:
                            true
                    }
                ]
            },
            {
                id:
                    "deployment",

                title:
                    "Deployment",

                description:
                    "Choose deployment settings.",

                fields: [
                    {
                        key:
                            "DEPLOYMENT_TARGET",

                        label:
                            "Deployment Target",

                        type:
                            "select",

                        required:
                            true,

                        options: [
                            {
                                label:
                                    "Vercel",

                                value:
                                    "vercel"
                            },
                            {
                                label:
                                    "Self-hosted",

                                value:
                                    "self-hosted"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const service =
        new TemplateWizardInheritanceService();

    const resolved =
        service.resolve(
            parent,
            child
        );

    if (!resolved) {

        throw new Error(
            "The inherited wizard was not resolved."
        );

    }

    console.log(
        "Resolved wizard:"
    );

    console.log(
        JSON.stringify(
            resolved,
            null,
            2
        )
    );

    if (
        resolved.title !==
        "Next.js Wizard"
    ) {

        throw new Error(
            "The child wizard title did not override the parent title."
        );

    }

    if (
        resolved.description !==
        "Collects Next.js project settings."
    ) {

        throw new Error(
            "The child wizard description did not override the parent description."
        );

    }

    if (
        resolved.steps.length !== 3
    ) {

        throw new Error(
            `Expected 3 resolved wizard steps but received ${resolved.steps.length}.`
        );

    }

    const projectStep =
        resolved.steps.find(
            (step) =>
                step.id === "project"
        );

    if (!projectStep) {

        throw new Error(
            "The parent project step was not inherited."
        );

    }

    const generationStep =
        resolved.steps.find(
            (step) =>
                step.id ===
                "generation-options"
        );

    if (!generationStep) {

        throw new Error(
            "The generation-options step was not resolved."
        );

    }

    if (
        generationStep.title !==
        "Next.js Options"
    ) {

        throw new Error(
            "The child generation-options step did not override the parent step."
        );

    }

    if (
        generationStep.fields.length !== 1 ||
        generationStep.fields[0].key !==
            "USE_DATABASE"
    ) {

        throw new Error(
            "The child generation-options fields were not preserved."
        );

    }

    const deploymentStep =
        resolved.steps.find(
            (step) =>
                step.id ===
                "deployment"
        );

    if (!deploymentStep) {

        throw new Error(
            "The child-only deployment step was not included."
        );

    }

    const parentOnlyResult =
        service.resolve(
            parent,
            undefined
        );

    if (
        parentOnlyResult !==
        parent
    ) {

        throw new Error(
            "The parent-only wizard was not returned unchanged."
        );

    }

    const childOnlyResult =
        service.resolve(
            undefined,
            child
        );

    if (
        childOnlyResult !==
        child
    ) {

        throw new Error(
            "The child-only wizard was not returned unchanged."
        );

    }

    const emptyResult =
        service.resolve(
            undefined,
            undefined
        );

    if (
        emptyResult !==
        undefined
    ) {

        throw new Error(
            "An empty wizard inheritance result was expected."
        );

    }

    console.log(
        "Template wizard inheritance test completed successfully."
    );

}

main();