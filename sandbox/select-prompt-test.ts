import {
    WizardOption
} from "../lib/models";

import {
    ConsolePromptProvider
} from "../lib/prompts";

async function main(): Promise<void> {

    const options:
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
        new ConsolePromptProvider();

    try {

        const result =
            await promptProvider.select(
                "Database",
                options
            );

        console.log(
            "Stored value:",
            result
        );

        const validValues =
            options.map(
                (option) =>
                    option.value
            );

        if (
            !validValues.includes(
                result
            )
        ) {

            throw new Error(
                "Select prompt returned an invalid stored value."
            );

        }

        console.log(
            "Select prompt test completed successfully."
        );

    } finally {

        promptProvider.close();

    }

}

main().catch((error: unknown) => {

    console.error(
        "Select prompt test failed.",
        error
    );

    process.exitCode = 1;

});