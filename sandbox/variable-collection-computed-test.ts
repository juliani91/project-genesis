import {
    VariableCollection
} from "../lib/models";

function main(): void {

    const variables =
        new VariableCollection();

    const firstAdd =
        variables.setIfMissing(
            "PROJECT_SLUG",
            "inventory-system"
        );

    const secondAdd =
        variables.setIfMissing(
            "PROJECT_SLUG",
            "replacement-slug"
        );

    const projectSlug =
        variables.get(
            "PROJECT_SLUG"
        );

    console.log(
        "First add:",
        firstAdd
    );

    console.log(
        "Second add:",
        secondAdd
    );

    console.log(
        "PROJECT_SLUG:",
        projectSlug
    );

    if (!firstAdd) {

        throw new Error(
            "The missing computed variable was not added."
        );

    }

    if (secondAdd) {

        throw new Error(
            "The existing variable was overwritten unexpectedly."
        );

    }

    if (
        projectSlug !==
        "inventory-system"
    ) {

        throw new Error(
            "The original computed variable value was not preserved."
        );

    }

    variables.set(
        "CURRENT_YEAR",
        "custom-year"
    );

    const yearAdd =
        variables.setIfMissing(
            "CURRENT_YEAR",
            "2026"
        );

    if (yearAdd) {

        throw new Error(
            "setIfMissing overwrote a value created with set()."
        );

    }

    if (
        variables.get(
            "CURRENT_YEAR"
        ) !==
        "custom-year"
    ) {

        throw new Error(
            "The existing CURRENT_YEAR value was not preserved."
        );

    }

    console.log(
        "Variable collection computed-value test completed successfully."
    );

}

main();