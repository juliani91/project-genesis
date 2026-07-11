import {
    WizardOption
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

async function main(): Promise<void> {

    const databaseOptions:
        WizardOption[] = [
        {
            label: "PostgreSQL",
            value: "postgres"
        },
        {
            label: "SQLite",
            value: "sqlite"
        },
        {
            label: "SQL Server",
            value: "sqlserver"
        },
        {
            label: "None",
            value: "none"
        }
    ];

    const promptProvider =
        new TestPromptProvider([
            "Typed Prompt Test",
            "true",
            "postgres"
        ]);

    const projectName =
        await promptProvider.ask(
            "Project Name:"
        );

    const useDocker =
        await promptProvider.confirm(
            "Use Docker?"
        );

    const database =
        await promptProvider.select(
            "Database",
            databaseOptions
        );

    console.log(
        "PROJECT_NAME:",
        projectName
    );

    console.log(
        "USE_DOCKER:",
        useDocker
    );

    console.log(
        "DATABASE:",
        database
    );

    if (
        projectName !==
        "Typed Prompt Test"
    ) {

        throw new Error(
            "The free-text prompt returned the wrong value."
        );

    }

    if (
        useDocker !==
        "true"
    ) {

        throw new Error(
            "The boolean prompt returned the wrong value."
        );

    }

    if (
        database !==
        "postgres"
    ) {

        throw new Error(
            "The select prompt returned the wrong value."
        );

    }

    const messages =
        promptProvider.getMessages();

    console.log(
        "Prompt messages:",
        messages
    );

    if (messages.length !== 3) {

        throw new Error(
            `Expected 3 prompt messages but received ${messages.length}.`
        );

    }

    if (
        messages[0] !==
        "Project Name:"
    ) {

        throw new Error(
            "The text prompt message was not recorded correctly."
        );

    }

    if (
        messages[1] !==
        "Use Docker?"
    ) {

        throw new Error(
            "The boolean prompt message was not recorded correctly."
        );

    }

    if (
        messages[2] !==
        "Database"
    ) {

        throw new Error(
            "The select prompt message was not recorded correctly."
        );

    }

    const invalidSelectProvider =
        new TestPromptProvider([
            "oracle"
        ]);

    try {

        await invalidSelectProvider.select(
            "Database",
            databaseOptions
        );

        throw new Error(
            "Invalid select test unexpectedly succeeded."
        );

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(
            "Invalid selection error:",
            message
        );

        if (
            message ===
            "Invalid select test unexpectedly succeeded."
        ) {

            throw error;

        }

        if (
            !message.includes(
                "Invalid test selection"
            )
        ) {

            throw new Error(
                `Unexpected invalid-selection error: ${message}`
            );

        }

    }

    const emptyOptionsProvider =
        new TestPromptProvider([
            "postgres"
        ]);

    try {

        await emptyOptionsProvider.select(
            "Empty Database List",
            []
        );

        throw new Error(
            "Empty-options test unexpectedly succeeded."
        );

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(
            "Empty options error:",
            message
        );

        if (
            message ===
            "Empty-options test unexpectedly succeeded."
        ) {

            throw error;

        }

        if (
            !message.includes(
                "No options are available"
            )
        ) {

            throw new Error(
                `Unexpected empty-options error: ${message}`
            );

        }

    }

    const missingResponseProvider =
        new TestPromptProvider([]);

    try {

        await missingResponseProvider.ask(
            "Missing Response:"
        );

        throw new Error(
            "Missing-response test unexpectedly succeeded."
        );

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(
            "Missing response error:",
            message
        );

        if (
            message ===
            "Missing-response test unexpectedly succeeded."
        ) {

            throw error;

        }

        if (
            !message.includes(
                "No test response is available"
            )
        ) {

            throw new Error(
                `Unexpected missing-response error: ${message}`
            );

        }

    }

    console.log(
        "Typed prompt provider test completed successfully."
    );

}

main().catch((error: unknown) => {

    console.error(
        "Typed prompt provider test failed.",
        error
    );

    process.exitCode = 1;

});