import {
    WizardAnswer,
    WizardField
} from "../lib/models";

import {
    FieldVisibilityEvaluator
} from "../lib/services";

function main(): void {

    const evaluator =
        new FieldVisibilityEvaluator();

    const alwaysVisibleField:
        WizardField = {
        key: "PROJECT_NAME",
        label: "Project Name",
        type: "string",
        required: true
    };

    const conditionalField:
        WizardField = {
        key: "DATABASE",
        label: "Database",
        type: "select",
        required: true,

        visibleWhen: {
            variable: "USE_DATABASE",
            equals: "true"
        },

        options: [
            {
                label: "PostgreSQL",
                value: "postgres"
            },
            {
                label: "SQLite",
                value: "sqlite"
            }
        ]
    };

    const noAnswers:
        WizardAnswer[] = [];

    const enabledAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DATABASE",
            value: "true"
        }
    ];

    const disabledAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DATABASE",
            value: "false"
        }
    ];

    const alwaysVisible =
        evaluator.isVisible(
            alwaysVisibleField,
            noAnswers
        );

    const missingDependency =
        evaluator.isVisible(
            conditionalField,
            noAnswers
        );

    const matchingDependency =
        evaluator.isVisible(
            conditionalField,
            enabledAnswers
        );

    const failingDependency =
        evaluator.isVisible(
            conditionalField,
            disabledAnswers
        );

    console.log(
        "Always visible:",
        alwaysVisible
    );

    console.log(
        "Missing dependency:",
        missingDependency
    );

    console.log(
        "Matching dependency:",
        matchingDependency
    );

    console.log(
        "Failing dependency:",
        failingDependency
    );

    if (!alwaysVisible) {

        throw new Error(
            "A field without visibleWhen was hidden."
        );

    }

    if (missingDependency) {

        throw new Error(
            "A field with a missing visibility dependency was shown."
        );

    }

    if (!matchingDependency) {

        throw new Error(
            "A field with a matching visibility dependency was hidden."
        );

    }

    if (failingDependency) {

        throw new Error(
            "A field with a failing visibility dependency was shown."
        );

    }

    console.log(
        "Field visibility evaluator test completed successfully."
    );

}

main();