import {
    VariableCollection
} from "../lib/models";

import {
    ProjectSlugGenerator
} from "../lib/services";

function main(): void {

    const generator =
        new ProjectSlugGenerator();

    const variables =
        new VariableCollection();

    variables.set(
        "PROJECT_NAME",
        "Inventory Management System"
    );

    const result =
        generator.generate(
            variables
        );

    console.log(
        "Generated slug:",
        result
    );

    if (!result) {

        throw new Error(
            "PROJECT_SLUG was not generated."
        );

    }

    if (
        result.key !==
        "PROJECT_SLUG"
    ) {

        throw new Error(
            "The computed variable key was incorrect."
        );

    }

    if (
        result.value !==
        "inventory-management-system"
    ) {

        throw new Error(
            `Unexpected PROJECT_SLUG value: ${result.value}`
        );

    }

    const specialCharacters =
        new VariableCollection();

    specialCharacters.set(
        "PROJECT_NAME",
        "  Customer Portal!!!  "
    );

    const specialResult =
        generator.generate(
            specialCharacters
        );

    if (
        specialResult?.value !==
        "customer-portal"
    ) {

        throw new Error(
            "Special characters were not normalized correctly."
        );

    }

    const missingName =
        new VariableCollection();

    const missingResult =
        generator.generate(
            missingName
        );

    if (missingResult !== undefined) {

        throw new Error(
            "The generator produced a slug without PROJECT_NAME."
        );

    }

    const unsupportedOnly =
        new VariableCollection();

    unsupportedOnly.set(
        "PROJECT_NAME",
        "!!!"
    );

    const unsupportedResult =
        generator.generate(
            unsupportedOnly
        );

    if (
        unsupportedResult !==
        undefined
    ) {

        throw new Error(
            "The generator produced an empty or invalid slug."
        );

    }

    console.log(
        "Project slug generator test completed successfully."
    );

}

main();