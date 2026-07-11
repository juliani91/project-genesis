import {
    ConsolePromptProvider
} from "../lib/prompts";

async function main(): Promise<void> {

    const promptProvider =
        new ConsolePromptProvider();

    try {

        const response =
            await promptProvider.ask(
                "Enter a test value:"
            );

        console.log(
            "You entered:",
            response
        );

        if (!response) {

            throw new Error(
                "The prompt returned an empty value."
            );

        }

        console.log(
            "Console prompt test completed successfully."
        );

    } finally {

        promptProvider.close();

    }

}

main().catch((error: unknown) => {

    console.error(
        "Console prompt test failed.",
        error
    );

    process.exitCode = 1;

});