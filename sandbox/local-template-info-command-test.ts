import {
    PackageCommandDispatcher
} from "../lib/commands";

async function main(): Promise<void> {

    const output:
        string[] = [];

    const dispatcher =
        new PackageCommandDispatcher(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            (value) =>
                output.push(
                    value
                )
        );

    const handled =
        await dispatcher.execute([
            "info",
            "nextjs-app"
        ]);

    if (!handled) {

        throw new Error(
            "The local template info command was not handled."
        );

    }

    const infoOutput =
        output.at(
            -1
        ) ?? "";

    const expectedValues = [
        'Template information for "nextjs-app".',
        "Local Template Information",
        "Template    : nextjs-app",
        "Name        : Next.js App",
        "Registry    : local",
        "Capabilities Provided",
        "- web",
        "- node",
        "Tags",
        "- nextjs"
    ];

    for (
        const expected
        of expectedValues
    ) {

        if (
            !infoOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Local template info output was missing: ${expected}`
            );

        }

    }

    console.log(
        "Local template info command verified."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Local template info command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);
