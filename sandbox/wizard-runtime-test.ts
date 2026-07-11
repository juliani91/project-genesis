import {
    Wizard,
    WizardAnswer
} from "../lib/models";

import { WizardRuntime } from "../lib/services";

function main(): void {

    const wizard: Wizard = {
        title: "Runtime Test Wizard",

        description:
            "A focused WizardRuntime test.",

        steps: [
            {
                id: "project",

                title:
                    "Project Information",

                description:
                    "Collect project information.",

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
            value: "Wizard Runtime Test"
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

    console.log(
        "Wizard:",
        session.wizard.title
    );

    console.log(
        "Answer count:",
        session.answers.length
    );

    console.log(
        "Completed:",
        session.completedAt !== undefined
    );

    if (
        session.answers.length !== 2
    ) {

        throw new Error(
            "Wizard session did not contain the expected answers."
        );

    }

    if (!session.completedAt) {

        throw new Error(
            "Wizard session was not completed."
        );

    }

    console.log(
        "Wizard runtime test completed successfully."
    );

    try {

    runtime.execute(
        wizard,
        [
            {
                key: "USE_DOCKER",
                value: "true"
            }
        ]
    );

    console.error(
        "Invalid wizard runtime test unexpectedly succeeded."
    );

    } catch (error) {

        console.log(
            error instanceof Error
                ? error.message
                : error
        );

    }
}

main();