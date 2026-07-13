import {
    CompatibilityReport,
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompatibilityPresenter
} from "../lib/services";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    provides:
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
            provides
        },

        path:
            `C:/templates/${id}`,

        descriptors: {}
    };

}

function createPlan(): TemplateCompositionPlan {

    const base =
        createTemplate(
            "nextjs",
            "base",
            [
                "node",
                "typescript",
                "react"
            ]
        );

    const feature =
        createTemplate(
            "playwright",
            "feature",
            [
                "playwright",
                "testing"
            ]
        );

    return {
        baseTemplate:
            base,

        featureTemplates: [
            feature
        ],

        orderedTemplates: [
            base,
            feature
        ]
    };

}

function main(): void {

    const presenter =
        new TemplateCompatibilityPresenter();

    const plan =
        createPlan();

    const compatibleReport:
        CompatibilityReport = {

        compatible:
            true,

        issues: []
    };

    const compatiblePreview =
        presenter.format(
            plan,
            compatibleReport
        );

    console.log(
        compatiblePreview
    );

    const compatibleValues = [
        "Compatibility Preview",
        "Status       : Compatible",
        "node",
        "playwright",
        "react",
        "testing",
        "typescript"
    ];

    for (
        const value
        of compatibleValues
    ) {

        if (
            !compatiblePreview.includes(
                value
            )
        ) {

            throw new Error(
                `Compatible preview was missing: ${value}`
            );

        }

    }

    const incompatibleReport:
        CompatibilityReport = {

        compatible:
            false,

        issues: [
            {
                type:
                    "missing-capability",

                capability:
                    "database",

                templateId:
                    "database-feature",

                message:
                    'Template "database-feature" requires capability "database".'
            },
            {
                type:
                    "conflict",

                capability:
                    "postgres",

                templateId:
                    "sqlite",

                message:
                    'Template "sqlite" conflicts with capability "postgres".'
            }
        ]
    };

    const incompatiblePreview =
        presenter.format(
            plan,
            incompatibleReport
        );

    console.log("");
    console.log(
        incompatiblePreview
    );

    if (
        !incompatiblePreview.includes(
            "Status       : Incompatible"
        )
    ) {

        throw new Error(
            "The incompatible status was not displayed."
        );

    }

    if (
        !incompatiblePreview.includes(
            "Issues"
        )
    ) {

        throw new Error(
            "The issues heading was not displayed."
        );

    }

    for (
        const issue
        of incompatibleReport.issues
    ) {

        if (
            !incompatiblePreview.includes(
                issue.message
            )
        ) {

            throw new Error(
                `The preview did not include issue: ${issue.message}`
            );

        }

    }

    const emptyBase =
        createTemplate(
            "empty-base",
            "base"
        );

    const emptyPlan:
        TemplateCompositionPlan = {

        baseTemplate:
            emptyBase,

        featureTemplates: [],

        orderedTemplates: [
            emptyBase
        ]
    };

    const emptyPreview =
        presenter.format(
            emptyPlan,
            {
                compatible:
                    true,

                issues: []
            }
        );

    if (
        !emptyPreview.includes(
            "Capabilities : None"
        )
    ) {

        throw new Error(
            "An empty capability set was not displayed correctly."
        );

    }

    console.log(
        "Template compatibility presenter test completed successfully."
    );

}

main();