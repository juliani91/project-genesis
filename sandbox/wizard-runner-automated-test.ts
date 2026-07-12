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

                        visibleWhen: {
                            variable: "USE_DOCKER",
                            equals: "true"
                        },

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
                    },
                    {
                        key: "POSTGRES_SCHEMA",
                        label: "PostgreSQL Schema",
                        type: "string",
                        required: true,

                        visibleWhen: {
                            variable: "DATABASE",
                            equals: "postgres"
                        }
                    }
                ]
            }
        ]
    };

    const runner =
        new WizardRunner();

    /*
     * Scenario 1:
     * Docker enabled, PostgreSQL selected.
     *
     * DATABASE is visible.
     * POSTGRES_SCHEMA is visible.
     */
    const promptProvider =
        new TestPromptProvider([
            "",
            "Typed Runner Project",
            "A typed wizard runner test.",
            "true",
            "postgres",
            "public"
        ]);

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

    if (answers.length !== 5) {

        throw new Error(
            `Expected 5 answers but received ${answers.length}.`
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

    if (
        answers[4].key !==
            "POSTGRES_SCHEMA" ||
        answers[4].value !==
            "public"
    ) {

        throw new Error(
            "POSTGRES_SCHEMA was not collected correctly."
        );

    }

    if (messages.length !== 6) {

        throw new Error(
            `Expected 6 prompt attempts but received ${messages.length}.`
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

    if (
        !messages[5].includes(
            "PostgreSQL Schema"
        )
    ) {

        throw new Error(
            "The chained PostgreSQL schema prompt was not used."
        );

    }

    console.log(
        "PostgreSQL chained-visibility scenario completed successfully."
    );

    /*
     * Scenario 2:
     * Docker disabled.
     *
     * DATABASE is hidden.
     * POSTGRES_SCHEMA is also hidden.
     */
    const hiddenPromptProvider =
        new TestPromptProvider([
            "Hidden Field Test",
            "Hidden description.",
            "false"
        ]);

    const hiddenAnswers =
        await runner.run(
            wizard,
            hiddenPromptProvider
        );

    if (hiddenAnswers.length !== 3) {

        throw new Error(
            `Expected 3 answers when DATABASE is hidden but received ${hiddenAnswers.length}.`
        );

    }

    if (
        hiddenAnswers.some(
            (answer) =>
                answer.key ===
                "DATABASE"
        )
    ) {

        throw new Error(
            "DATABASE was collected even though it should have been hidden."
        );

    }

    if (
        hiddenAnswers.some(
            (answer) =>
                answer.key ===
                "POSTGRES_SCHEMA"
        )
    ) {

        throw new Error(
            "POSTGRES_SCHEMA was collected even though its dependency was hidden."
        );

    }

    console.log(
        "Hidden-field scenario completed successfully."
    );

    /*
     * Scenario 3:
     * Docker enabled, SQLite selected.
     *
     * DATABASE is visible.
     * POSTGRES_SCHEMA is hidden.
     */
    const sqlitePromptProvider =
        new TestPromptProvider([
            "SQLite Field Test",
            "SQLite description.",
            "true",
            "sqlite"
        ]);

    const sqliteAnswers =
        await runner.run(
            wizard,
            sqlitePromptProvider
        );

    if (sqliteAnswers.length !== 4) {

        throw new Error(
            `Expected 4 answers for SQLite but received ${sqliteAnswers.length}.`
        );

    }

    if (
        !sqliteAnswers.some(
            (answer) =>
                answer.key ===
                    "DATABASE" &&
                answer.value ===
                    "sqlite"
        )
    ) {

        throw new Error(
            "DATABASE was not collected correctly for the SQLite scenario."
        );

    }

    if (
        sqliteAnswers.some(
            (answer) =>
                answer.key ===
                "POSTGRES_SCHEMA"
        )
    ) {

        throw new Error(
            "POSTGRES_SCHEMA was collected when SQLite was selected."
        );

    }

    console.log(
        "SQLite chained-visibility scenario completed successfully."
    );

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