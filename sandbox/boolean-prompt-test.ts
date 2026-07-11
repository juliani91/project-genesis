import {
    ConsolePromptProvider
} from "../lib/prompts";

async function main(): Promise<void> {

    const promptProvider =
        new ConsolePromptProvider();

    try {

        const result =
            await promptProvider.confirm(
                "Use Docker?"
            );

        console.log(
            "Stored value:",
            result
        );

        if (
            result !== "true" &&
            result !== "false"
        ) {

            throw new Error(
                "Boolean prompt returned an invalid stored value."
            );

        }

        console.log(
            "Boolean prompt test completed successfully."
        );

    } finally {

        promptProvider.close();

    }

}

main().catch((error: unknown) => {

    console.error(
        "Boolean prompt test failed.",
        error
    );

    process.exitCode = 1;

});