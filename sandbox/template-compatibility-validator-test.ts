import {
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompatibilityValidator
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    provides:
        string[] = [],
    requiresCapabilities:
        string[] = [],
    conflictsWith:
        string[] = []
): TemplatePackage {

    return {
        manifest: {
            id,
            name: id,
            version: "1.0.0",
            description: "",
            author: "Test",
            role,
            provides,
            requiresCapabilities,
            conflictsWith
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function createPlan(
    base:
        TemplatePackage,
    features:
        readonly TemplatePackage[]
): TemplateCompositionPlan {

    return {
        baseTemplate:
            base,

        featureTemplates:
            features,

        orderedTemplates: [
            base,
            ...features
        ]
    };

}

function main(): void {

    const validator =
        new TemplateCompatibilityValidator();

    /*
     * Valid composition.
     */
    const nextjs =
        createTemplate(
            "nextjs",
            "base",
            [
                "node",
                "typescript",
                "react"
            ]
        );

    const playwright =
        createTemplate(
            "playwright",
            "feature",
            [
                "playwright",
                "browser-testing"
            ],
            [
                "node",
                "typescript"
            ]
        );

    const validReport =
        validator.validate(
            createPlan(
                nextjs,
                [
                    playwright
                ]
            )
        );

    if (
        !validReport.compatible
    ) {

        throw new Error(
            "A compatible composition was rejected."
        );

    }

    if (
        validReport.issues.length !==
        0
    ) {

        throw new Error(
            "A compatible composition produced issues."
        );

    }

    /*
     * Missing capabilities.
     */
    const pythonBase =
        createTemplate(
            "python-base",
            "base",
            [
                "python"
            ]
        );

    const invalidReport =
        validator.validate(
            createPlan(
                pythonBase,
                [
                    playwright
                ]
            )
        );

    if (
        invalidReport.compatible
    ) {

        throw new Error(
            "An incompatible composition was accepted."
        );

    }

    if (
        invalidReport.issues.length !==
        2
    ) {

        throw new Error(
            `Expected 2 missing-capability issues but received ${invalidReport.issues.length}.`
        );

    }

    const issueCapabilities =
        invalidReport.issues.map(
            (issue) =>
                issue.capability
        );

    if (
        !issueCapabilities.includes(
            "node"
        ) ||
        !issueCapabilities.includes(
            "typescript"
        )
    ) {

        throw new Error(
            "The expected missing capabilities were not reported."
        );

    }

    if (
        !invalidReport.issues.every(
            (issue) =>
                issue.type ===
                "missing-capability"
        )
    ) {

        throw new Error(
            "The missing-capability issue type was incorrect."
        );

    }

    /*
     * Capability matching is case-insensitive
     * and whitespace-trimmed.
     */
    const normalizedBase =
        createTemplate(
            "normalized-base",
            "base",
            [
                " Node ",
                "TYPESCRIPT"
            ]
        );

    const normalizedFeature =
        createTemplate(
            "normalized-feature",
            "feature",
            [],
            [
                "node",
                " typescript "
            ]
        );

    const normalizedReport =
        validator.validate(
            createPlan(
                normalizedBase,
                [
                    normalizedFeature
                ]
            )
        );

    if (
        !normalizedReport.compatible
    ) {

        throw new Error(
            "Normalized capability IDs did not match."
        );

    }

    /*
     * A later feature may provide a required capability.
     */
    const databaseConsumer =
        createTemplate(
            "database-consumer",
            "feature",
            [],
            [
                "database"
            ]
        );

    const databaseProvider =
        createTemplate(
            "database-provider",
            "feature",
            [
                "database"
            ]
        );

    const crossFeatureReport =
        validator.validate(
            createPlan(
                nextjs,
                [
                    databaseConsumer,
                    databaseProvider
                ]
            )
        );

    if (
        !crossFeatureReport.compatible
    ) {

        throw new Error(
            "A capability provided by another selected feature was not resolved."
        );

    }

    /*
 * Direct capability conflict.
 */
const postgres =
    createTemplate(
        "postgres",
        "feature",
        [
            "postgres",
            "database"
        ]
    );

const sqlite =
    createTemplate(
        "sqlite",
        "feature",
        [
            "sqlite",
            "database"
        ],
        [],
        [
            "postgres"
        ]
    );

const conflictReport =
    validator.validate(
        createPlan(
            nextjs,
            [
                postgres,
                sqlite
            ]
        )
    );

if (
    conflictReport.compatible
) {

    throw new Error(
        "A conflicting composition was accepted."
    );

}

const postgresConflict =
    conflictReport.issues.find(
        (issue) =>
            issue.type ===
                "conflict" &&
            issue.templateId ===
                "sqlite" &&
            issue.capability ===
                "postgres"
    );

if (!postgresConflict) {

    throw new Error(
        "The PostgreSQL and SQLite conflict was not reported."
    );

}

/*
 * Conflict matching is normalized.
 */
const normalizedConflict =
    createTemplate(
        "normalized-conflict",
        "feature",
        [],
        [],
        [
            " POSTGRES "
        ]
    );

const normalizedConflictReport =
    validator.validate(
        createPlan(
            nextjs,
            [
                postgres,
                normalizedConflict
            ]
        )
    );

if (
    !normalizedConflictReport
        .issues
        .some(
            (issue) =>
                issue.type ===
                    "conflict" &&
                issue.capability ===
                    "postgres"
        )
) {

    throw new Error(
        "Normalized conflicting capabilities were not detected."
    );

}

/*
 * An absent conflicting capability produces no issue.
 */
const harmlessConflict =
    createTemplate(
        "harmless-conflict",
        "feature",
        [],
        [],
        [
            "dotnet"
        ]
    );

const harmlessReport =
    validator.validate(
        createPlan(
            nextjs,
            [
                harmlessConflict
            ]
        )
    );

if (
    !harmlessReport.compatible
) {

    throw new Error(
        "A conflict with an absent capability was reported."
    );

}

    console.log(
        "Template compatibility validator test completed successfully."
    );

}

main();