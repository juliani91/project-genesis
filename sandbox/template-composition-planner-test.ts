import {
    TemplateCompositionRequest,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompositionPlanner
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

function expectFailure(
    request:
        TemplateCompositionRequest
): void {

    const planner =
        new TemplateCompositionPlanner();

    let threw = false;

    try {

        planner.createPlan(
            request
        );

    } catch {

        threw = true;

    }

    if (!threw) {

        throw new Error(
            "Expected the composition planner to reject the request."
        );

    }

}

function main(): void {

    const nextjs =
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

    const planner =
        new TemplateCompositionPlanner();

    const plan =
        planner.createPlan({

            baseTemplate:
                nextjs,

            featureTemplates: [
                docker,
                playwright
            ]

        });

    if (
        plan.orderedTemplates.length !==
        3
    ) {

        throw new Error(
            "The merge order was incorrect."
        );

    }

    if (
        plan.orderedTemplates[0] !==
        nextjs
    ) {

        throw new Error(
            "The base template was not first."
        );

    }

    if (
        plan.orderedTemplates[1] !==
            docker ||
        plan.orderedTemplates[2] !==
            playwright
    ) {

        throw new Error(
            "The feature template order was incorrect."
        );

    }

    /*
     * Invalid base.
     */

    expectFailure({

        baseTemplate:
            docker,

        featureTemplates: []

    });

    /*
     * Invalid feature.
     */

    expectFailure({

        baseTemplate:
            nextjs,

        featureTemplates: [
            createTemplate(
                "another-base",
                "base"
            )
        ]

    });

    console.log(
        "Template composition planner test completed successfully."
    );

    const databaseSupport =
    createTemplate(
        "database-support",
        "feature"
    );

    const postgresql =
        createTemplate(
            "postgresql",
            "feature"
        );

    postgresql.manifest.requires = [
        "database-support"
    ];

    const dependencyPlan =
        planner.createPlan(
            {
                baseTemplate:
                    nextjs,

                featureTemplates: [
                    postgresql
                ]
            },
            [
                nextjs,
                databaseSupport,
                postgresql
            ]
        );

    if (
        dependencyPlan
            .orderedTemplates
            .map(
                (template) =>
                    template.manifest.id
            )
            .join(",") !==
        "nextjs,database-support,postgresql"
    ) {

        throw new Error(
            "The composition planner did not include feature dependencies in the correct order."
        );

    }

}

main();