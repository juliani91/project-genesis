import {
    CurrentYearGenerator
} from "../lib/services";

function main(): void {

    const generator =
        new CurrentYearGenerator();

    const fixedDate =
        new Date(
            "2026-07-12T15:30:00.000Z"
        );

    const result =
        generator.generate(
            fixedDate
        );

    console.log(
        "Generated year:",
        result
    );

    if (
        result.key !==
        "CURRENT_YEAR"
    ) {

        throw new Error(
            "The computed variable key was incorrect."
        );

    }

    if (
        result.value !==
        "2026"
    ) {

        throw new Error(
            `Unexpected CURRENT_YEAR value: ${result.value}`
        );

    }

    const automaticResult =
        generator.generate();

    if (
        !/^\d{4}$/.test(
            automaticResult.value
        )
    ) {

        throw new Error(
            `Automatic CURRENT_YEAR was not formatted correctly: ${automaticResult.value}`
        );

    }

    console.log(
        "Current year generator test completed successfully."
    );

}

main();