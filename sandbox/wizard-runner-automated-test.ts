import {
    Wizard
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    WizardRunner
} from "../lib/services";

async function main(): Promise<void> {

    const wizard: Wizard = {
        title:
            "Automated Typed Wizard Test",

        description:
            "Tests typed answer collection.",

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
                        key: "PROJECT_DESCRIPTION",
                        label: "Project Description",
                        type: "multiline",
                        required: true
                    },
                    {
                        key: "USE_DOCKER",
                        label: "Use Docker",
                        type: "boolean",
                        required: true
                    },
                    {
                        key: "DATABASE",
                        label: "Database",
                        type: "select",
                        required: true,

                        options: [
                            {
                                label: "PostgreSQL",
                                value: "postgres"
                            },
                            {
                                label: "SQLite",
                                value: "sqlite"
                            },
                            {
                                label: "None",
                                value: "none"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const promptProvider =
        new TestPromptProvider([
            "",
            "Typed Runner Project",
            "A typed wizard runner test.",
            "true",
            "postgres"
        ]);

    const runner =
        new WizardRunner();

    const answers =
        await runner.run(
            wizard,
            promptProvider
        );

    const messages =
        promptProvider.getMessages();

    console.log(
        "Collected answers:"
    );

    console.log(
        JSON.stringify(
            answers,
            null,
            2
        )
    );

    console.log(
        "Prompt messages:"
    );

    console.log(
        JSON.stringify(
            messages,
            null,
            2
        )
    );

    if (answers.length !== 4) {

        throw new Error(
            "WizardRunner did not return four answers."
        );

    }

    if (
        answers[0].key !==
            "PROJECT_NAME" ||
        answers[0].value !==
            "Typed Runner Project"
    ) {

        throw new Error(
            "PROJECT_NAME was not collected correctly."
        );

    }

    if (
        answers[1].key !==
            "PROJECT_DESCRIPTION" ||
        answers[1].value !==
            "A typed wizard runner test."
    ) {

        throw new Error(
            "PROJECT_DESCRIPTION was not collected correctly."
        );

    }

    if (
        answers[2].key !==
            "USE_DOCKER" ||
        answers[2].value !==
            "true"
    ) {

        throw new Error(
            "USE_DOCKER was not collected correctly."
        );

    }

    if (
        answers[3].key !==
            "DATABASE" ||
        answers[3].value !==
            "postgres"
    ) {

        throw new Error(
            "DATABASE was not collected correctly."
        );

    }

    if (messages.length !== 5) {

        throw new Error(
            `Expected five prompt attempts but received ${messages.length}.`
        );

    }

    if (
        !messages[3].includes(
            "Use Docker"
        )
    ) {

        throw new Error(
            "The boolean prompt was not used."
        );

    }

    if (
        !messages[4].includes(
            "Database"
        )
    ) {

        throw new Error(
            "The select prompt was not used."
        );

    }

    console.log(
        "Automated typed WizardRunner test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Automated typed WizardRunner test failed.",
        error
    );

    process.exitCode = 1;

});