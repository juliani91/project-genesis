import {
    Wizard,
    WizardAnswer
} from "../lib/models";

import {
    WizardSessionValidator
} from "../lib/validators";

function main(): void {

    const wizard: Wizard = {
        title: "Validation Test Wizard",

        description:
            "Tests wizard answer validation.",

        steps: [
            {
                id: "project",

                title:
                    "Project Information",

                description:
                    "Collect required values.",

                fields: [
                    {
                        key: "PROJECT_NAME",
                        label: "Project Name",
                        type: "string",
                        required: true
                    },
                    {
                        key: "CLIENT_NAME",
                        label: "Client Name",
                        type: "string",
                        required: false
                    }
                ]
            }
        ]
    };

    const validAnswers: WizardAnswer[] = [
        {
            key: "PROJECT_NAME",
            value: "Validation Test"
        },
        {
            key: "CLIENT_NAME",
            value: "Internal Client"
        }
    ];

    const invalidAnswers: WizardAnswer[] = [
        {
            key: "PROJECT_NAME",
            value: ""
        },
        {
            key: "PROJECT_NAME",
            value: "Duplicate Value"
        },
        {
            key: "UNKNOWN_FIELD",
            value: "Unknown"
        }
    ];

    const validator =
        new WizardSessionValidator();

    const validErrors =
        validator.validate(
            wizard,
            validAnswers
        );

    const invalidErrors =
        validator.validate(
            wizard,
            invalidAnswers
        );

    console.log(
        "Valid errors:",
        validErrors
    );

    console.log(
        "Invalid errors:",
        invalidErrors
    );

    if (validErrors.length !== 0) {

        throw new Error(
            "Valid wizard answers produced validation errors."
        );

    }

    if (invalidErrors.length !== 3) {

        throw new Error(
            `Expected 3 validation errors but received ${invalidErrors.length}.`
        );

    }

    console.log(
        "Wizard validation test completed successfully."
    );

}

main();