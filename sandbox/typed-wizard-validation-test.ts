import {
    Wizard,
    WizardAnswer
} from "../lib/models";

import {
    WizardSessionValidator
} from "../lib/validators";

function main(): void {

    const wizard: Wizard = {
        title:
            "Typed Validation Test",

        description:
            "Tests typed wizard validation.",

        steps: [
            {
                id: "options",

                title:
                    "Options",

                description:
                    "Choose typed values.",

                fields: [
                    {
                        key: "USE_DOCKER",
                        label: "Use Docker",
                        type: "boolean",
                        required: true
                    },
                    {
                        key: "DATABASE",
                        label: "Database",
                        type: "select",
                        required: true,

                        options: [
                            {
                                label: "PostgreSQL",
                                value: "postgres"
                            },
                            {
                                label: "SQLite",
                                value: "sqlite"
                            },
                            {
                                label: "None",
                                value: "none"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const validAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DOCKER",
            value: "true"
        },
        {
            key: "DATABASE",
            value: "postgres"
        }
    ];

    const invalidAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DOCKER",
            value: "yes"
        },
        {
            key: "DATABASE",
            value: "oracle"
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
            "Valid typed answers produced validation errors."
        );

    }

    if (invalidErrors.length !== 2) {

        throw new Error(
            `Expected 2 typed validation errors but received ${invalidErrors.length}.`
        );

    }

    const invalidWizard: Wizard = {
        title:
            "Invalid Select Wizard",

        description:
            "Contains an invalid select definition.",

        steps: [
            {
                id: "invalid",

                title:
                    "Invalid",

                description:
                    "Invalid select test.",

                fields: [
                    {
                        key: "EMPTY_SELECT",
                        label: "Empty Select",
                        type: "select",
                        required: true,
                        options: []
                    }
                ]
            }
        ]
    };

    const definitionErrors =
        validator.validate(
            invalidWizard,
            []
        );

    console.log(
        "Definition errors:",
        definitionErrors
    );

    if (
        !definitionErrors.some(
            (error) =>
                error.includes(
                    "has no options"
                )
        )
    ) {

        throw new Error(
            "The validator did not reject a select field without options."
        );

    }

    console.log(
        "Typed wizard validation test completed successfully."
    );

}

main();