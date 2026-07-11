import {
    Wizard
} from "../lib/models";

import {
    ConsolePromptProvider
} from "../lib/prompts";

import {
    WizardRunner
} from "../lib/services";

async function main(): Promise<void> {

    const wizard: Wizard = {
        title: "Wizard Runner Test",

        description:
            "Tests interactive answer collection.",

        steps: [
            {
                id: "project",

                title:
                    "Project Information",

                description:
                    "Enter basic project information.",

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
        new ConsolePromptProvider();

    try {

        const runner =
            new WizardRunner();

        const answers =
            await runner.run(
                wizard,
                promptProvider
            );

        console.log("");
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

        if (answers.length !== 3) {

            throw new Error(
                "WizardRunner did not collect the expected number of answers."
            );

        }

        if (
            answers[0].key !==
            "PROJECT_NAME"
        ) {

            throw new Error(
                "The first collected answer did not match PROJECT_NAME."
            );

        }

        console.log(
            "Wizard runner test completed successfully."
        );

    } finally {

        promptProvider.close();

    }

}

main().catch((error: unknown) => {

    console.error(
        "Wizard runner test failed.",
        error
    );

    process.exitCode = 1;

});