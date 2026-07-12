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

    const useDatabaseField:
        WizardField = {
        key: "USE_DATABASE",
        label: "Use Database",
        type: "boolean",
        required: true
    };

    const databaseField:
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

    const postgresSchemaField:
        WizardField = {
        key: "POSTGRES_SCHEMA",
        label: "PostgreSQL Schema",
        type: "string",
        required: true,

        visibleWhen: {
            variable: "DATABASE",
            equals: "postgres"
        }
    };

    const answers:
        WizardAnswer[] = [];

    const useDatabaseInitiallyVisible =
        evaluator.isVisible(
            useDatabaseField,
            answers
        );

    const databaseInitiallyVisible =
        evaluator.isVisible(
            databaseField,
            answers
        );

    const schemaInitiallyVisible =
        evaluator.isVisible(
            postgresSchemaField,
            answers
        );

    console.log(
        "Use database initially visible:",
        useDatabaseInitiallyVisible
    );

    console.log(
        "Database initially visible:",
        databaseInitiallyVisible
    );

    console.log(
        "Schema initially visible:",
        schemaInitiallyVisible
    );

    if (!useDatabaseInitiallyVisible) {

        throw new Error(
            "The unconditional USE_DATABASE field was hidden."
        );

    }

    if (databaseInitiallyVisible) {

        throw new Error(
            "DATABASE was visible before USE_DATABASE was answered."
        );

    }

    if (schemaInitiallyVisible) {

        throw new Error(
            "POSTGRES_SCHEMA was visible before DATABASE was answered."
        );

    }

    answers.push({
        key: "USE_DATABASE",
        value: "true"
    });

    const databaseAfterEnablement =
        evaluator.isVisible(
            databaseField,
            answers
        );

    const schemaBeforeDatabaseChoice =
        evaluator.isVisible(
            postgresSchemaField,
            answers
        );

    console.log(
        "Database after enablement:",
        databaseAfterEnablement
    );

    console.log(
        "Schema before database choice:",
        schemaBeforeDatabaseChoice
    );

    if (!databaseAfterEnablement) {

        throw new Error(
            "DATABASE did not become visible after USE_DATABASE was enabled."
        );

    }

    if (schemaBeforeDatabaseChoice) {

        throw new Error(
            "POSTGRES_SCHEMA became visible before DATABASE was selected."
        );

    }

    answers.push({
        key: "DATABASE",
        value: "postgres"
    });

    const schemaAfterPostgres =
        evaluator.isVisible(
            postgresSchemaField,
            answers
        );

    console.log(
        "Schema after PostgreSQL selection:",
        schemaAfterPostgres
    );

    if (!schemaAfterPostgres) {

        throw new Error(
            "POSTGRES_SCHEMA did not become visible after PostgreSQL was selected."
        );

    }

    const sqliteAnswers:
        WizardAnswer[] = [
        {
            key: "USE_DATABASE",
            value: "true"
        },
        {
            key: "DATABASE",
            value: "sqlite"
        }
    ];

    const schemaForSqlite =
        evaluator.isVisible(
            postgresSchemaField,
            sqliteAnswers
        );

    console.log(
        "Schema for SQLite:",
        schemaForSqlite
    );

    if (schemaForSqlite) {

        throw new Error(
            "POSTGRES_SCHEMA was visible for SQLite."
        );

    }

    console.log(
        "Chained field visibility test completed successfully."
    );

}

main();