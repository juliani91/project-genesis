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
            "Automated Wizard Runner Test",

        description:
            "Tests answer collection without console input.",

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
                        key: "CLIENT_NAME",
                        label: "Client Name",
                        type: "string",
                        required: false
                    },
                    {
                        key: "PROJECT_DESCRIPTION",
                        label: "Project Description",
                        type: "multiline",
                        required: true
                    }
                ]
            }
        ]
    };

    const promptProvider =
        new TestPromptProvider([
            "",
            "Automated Test Project",
            "",
            "A generated test description."
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

    if (answers.length !== 3) {

        throw new Error(
            "WizardRunner did not return three answers."
        );

    }

    if (
        answers[0].key !==
            "PROJECT_NAME" ||
        answers[0].value !==
            "Automated Test Project"
    ) {

        throw new Error(
            "PROJECT_NAME was not collected correctly."
        );

    }

    if (
        answers[1].key !==
            "CLIENT_NAME" ||
        answers[1].value !==
            ""
    ) {

        throw new Error(
            "The optional CLIENT_NAME answer was not preserved as empty."
        );

    }

    if (
        answers[2].key !==
            "PROJECT_DESCRIPTION" ||
        answers[2].value !==
            "A generated test description."
    ) {

        throw new Error(
            "PROJECT_DESCRIPTION was not collected correctly."
        );

    }

    if (messages.length !== 4) {

        throw new Error(
            `Expected four prompt attempts but received ${messages.length}.`
        );

    }

    if (
        !messages[3].includes(
            "Project Description"
        )
    ) {

        throw new Error(
            "The multiline prompt message was not recorded correctly."
        );

    }

    console.log(
        "Automated wizard runner test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Automated wizard runner test failed.",
        error
    );

    process.exitCode = 1;

});