import {
    Wizard,
    WizardAnswer,
    WizardSession
} from "../lib/models";

import {
    VariableCollectionBuilder,
    WizardRuntime
} from "../lib/services";

function main(): void {

    const wizard: Wizard = {
        title: "Variable Builder Test",

        description:
            "Tests WizardSession conversion.",

        steps: [
            {
                id: "project",

                title:
                    "Project Information",

                description:
                    "Collect project values.",

                fields: [
                    {
                        key: "PROJECT_NAME",
                        label: "Project Name",
                        type: "string",
                        required: true
                    },
                    {
                        key: "USE_DOCKER",
                        label: "Use Docker",
                        type: "string",
                        required: false
                    }
                ]
            }
        ]
    };

    const answers: WizardAnswer[] = [
        {
            key: "PROJECT_NAME",
            value: "Builder Test Project"
        },
        {
            key: "USE_DOCKER",
            value: "true"
        }
    ];

    const runtime =
        new WizardRuntime();

    const session =
        runtime.execute(
            wizard,
            answers
        );

    const builder =
        new VariableCollectionBuilder();

    const variables =
        builder.build(session);

    const projectName =
        variables.get("PROJECT_NAME");

    const useDocker =
        variables.get("USE_DOCKER");

    const createdDate =
        variables.get("CREATED_DATE");

    console.log(
        "PROJECT_NAME:",
        projectName
    );

    console.log(
        "USE_DOCKER:",
        useDocker
    );

    console.log(
        "CREATED_DATE:",
        createdDate
    );

    if (
        projectName !==
        "Builder Test Project"
    ) {

        throw new Error(
            "PROJECT_NAME was not added to the variable collection."
        );

    }

    if (
        useDocker !==
        "true"
    ) {

        throw new Error(
            "USE_DOCKER was not added to the variable collection."
        );

    }

    if (!createdDate) {

        throw new Error(
            "CREATED_DATE was not added to the variable collection."
        );

    }

    const parsedCreatedDate =
        Date.parse(createdDate);

    if (Number.isNaN(parsedCreatedDate)) {

        throw new Error(
            "CREATED_DATE was added, but it is not a valid ISO date."
        );

    }

    const incompleteSession: WizardSession = {
        wizard,
        answers: [],
        startedAt: new Date()
    };

    try {

        builder.build(
            incompleteSession
        );

        throw new Error(
            "Incomplete-session test unexpectedly succeeded."
        );

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            message ===
            "Incomplete-session test unexpectedly succeeded."
        ) {

            throw error;

        }

        if (
            message !==
            "Cannot build variables from an incomplete wizard session."
        ) {

            throw new Error(
                `Unexpected incomplete-session error: ${message}`
            );

        }

    }

    console.log(
        "Variable collection builder test completed successfully."
    );

}

main();