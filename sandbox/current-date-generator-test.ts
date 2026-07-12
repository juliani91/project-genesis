import {
    CurrentDateGenerator
} from "../lib/services";

function main(): void {

    const generator =
        new CurrentDateGenerator();

    const fixedDate =
        new Date(
            "2026-07-12T15:30:00.000Z"
        );

    const result =
        generator.generate(
            fixedDate
        );

    console.log(
        "Generated date:",
        result
    );

    if (
        result.key !==
        "CREATED_DATE"
    ) {

        throw new Error(
            "The computed variable key was incorrect."
        );

    }

    if (
        result.value !==
        "2026-07-12"
    ) {

        throw new Error(
            `Unexpected CREATED_DATE value: ${result.value}`
        );

    }

    const automaticResult =
        generator.generate();

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            automaticResult.value
        )
    ) {

        throw new Error(
            `Automatic CREATED_DATE was not formatted correctly: ${automaticResult.value}`
        );

    }

    console.log(
        "Current date generator test completed successfully."
    );

}

main();