import {
    VariableCollection
} from "../lib/models";

import {
    ComputedVariableService
} from "../lib/services";

function main(): void {

    const variables =
        new VariableCollection();

    variables.set(
        "PROJECT_NAME",
        "Inventory Management System"
    );

    const service =
        new ComputedVariableService();

    const fixedDate =
        new Date(
            "2026-07-12T15:30:00.000Z"
        );

    const generated =
        service.apply(
            variables,
            fixedDate
        );

    console.log(
        "Generated variables:",
        generated
    );

    if (
        variables.get(
            "PROJECT_SLUG"
        ) !==
        "inventory-management-system"
    ) {

        throw new Error(
            "PROJECT_SLUG was not added correctly."
        );

    }

    if (
        variables.get(
            "CREATED_DATE"
        ) !==
        "2026-07-12"
    ) {

        throw new Error(
            "CREATED_DATE was not added correctly."
        );

    }

    if (
        variables.get(
            "CURRENT_YEAR"
        ) !==
        "2026"
    ) {

        throw new Error(
            "CURRENT_YEAR was not added correctly."
        );

    }

    if (generated.length !== 3) {

        throw new Error(
            `Expected 3 generated variables but received ${generated.length}.`
        );

    }

    const customVariables =
        new VariableCollection();

    customVariables.set(
        "PROJECT_NAME",
        "Custom Project"
    );

    customVariables.set(
        "PROJECT_SLUG",
        "my-custom-slug"
    );

    customVariables.set(
        "CURRENT_YEAR",
        "custom-year"
    );

    const customGenerated =
        service.apply(
            customVariables,
            fixedDate
        );

    if (
        customVariables.get(
            "PROJECT_SLUG"
        ) !==
        "my-custom-slug"
    ) {

        throw new Error(
            "The existing PROJECT_SLUG was overwritten."
        );

    }

    if (
        customVariables.get(
            "CURRENT_YEAR"
        ) !==
        "custom-year"
    ) {

        throw new Error(
            "The existing CURRENT_YEAR was overwritten."
        );

    }

    if (
        customVariables.get(
            "CREATED_DATE"
        ) !==
        "2026-07-12"
    ) {

        throw new Error(
            "The missing CREATED_DATE was not added."
        );

    }

    if (customGenerated.length !== 1) {

        throw new Error(
            `Expected only CREATED_DATE to be generated, but received ${customGenerated.length} values.`
        );

    }

    if (
        customGenerated[0].key !==
        "CREATED_DATE"
    ) {

        throw new Error(
            "The wrong computed variable was reported as added."
        );

    }

    console.log(
        "Computed variable service test completed successfully."
    );

}

main();