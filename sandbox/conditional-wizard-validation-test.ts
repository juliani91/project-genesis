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
            "Conditional Validation Test",

        description:
            "Tests conditional required fields.",

        steps: [
            {
                id: "database",

                title:
                    "Database",

                description:
                    "Choose database settings.",

                fields: [
                    {
                        key: "USE_DATABASE",
                        label: "Use Database",
                        type: "boolean",
                        required: true
                    },
                    {
                        key: "DATABASE",
                        label: "Database",
                        type: "select",
                        required: true,

                        visibleWhen: {
                            variable:
                                "USE_DATABASE",
                            equals:
                                "true"
                        },

                        options: [
                            {
                                label:
                                    "PostgreSQL",
                                value:
                                    "postgres"
                            },
                            {
                                label:
                                    "SQLite",
                                value:
                                    "sqlite"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const disabledAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DATABASE",
            value: "false"
        }
    ];

    const enabledAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DATABASE",
            value: "true"
        },
        {
            key: "DATABASE",
            value: "postgres"
        }
    ];

    const missingVisibleAnswer:
        WizardAnswer[] = [
        {
            key: "USE_DATABASE",
            value: "true"
        }
    ];

    const validator =
        new WizardSessionValidator();

    const disabledErrors =
        validator.validate(
            wizard,
            disabledAnswers
        );

    const enabledErrors =
        validator.validate(
            wizard,
            enabledAnswers
        );

    const missingErrors =
        validator.validate(
            wizard,
            missingVisibleAnswer
        );

    console.log(
        "Disabled errors:",
        disabledErrors
    );

    console.log(
        "Enabled errors:",
        enabledErrors
    );

    console.log(
        "Missing visible answer errors:",
        missingErrors
    );

    if (
        disabledErrors.length !== 0
    ) {

        throw new Error(
            "A hidden required field produced a validation error."
        );

    }

    if (
        enabledErrors.length !== 0
    ) {

        throw new Error(
            "Valid visible-field answers produced validation errors."
        );

    }

    if (
        !missingErrors.some(
            (error) =>
                error.includes(
                    "Required wizard answer is missing: DATABASE."
                )
        )
    ) {

        throw new Error(
            "A visible required field did not produce a missing-answer error."
        );

    }

    const invalidWizard: Wizard = {
        title:
            "Invalid Visibility Wizard",

        description:
            "Contains invalid visibility references.",

        steps: [
            {
                id: "invalid",

                title: "Invalid",

                description:
                    "Invalid visibility rules.",

                fields: [
                    {
                        key: "FIRST",
                        label: "First",
                        type: "string",
                        required: true,

                        visibleWhen: {
                            variable:
                                "SECOND",
                            equals:
                                "yes"
                        }
                    },
                    {
                        key: "SECOND",
                        label: "Second",
                        type: "string",
                        required: true
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
                    "references a later field"
                )
        )
    ) {

        throw new Error(
            "The validator did not reject a later-field visibility reference."
        );

    }

    console.log(
        "Conditional wizard validation test completed successfully."
    );

}

main();