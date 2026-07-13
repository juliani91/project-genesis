import {
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompatibilityPresenter,
    TemplateCompatibilityValidator,
    TemplateCompositionPlanner
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

function validateComposition(
    baseTemplate:
        TemplatePackage,

    featureTemplates:
        readonly TemplatePackage[],

    availableTemplates:
        readonly TemplatePackage[]
): string {

    const planner =
        new TemplateCompositionPlanner();

    const plan =
        planner.createPlan(
            {
                baseTemplate,
                featureTemplates
            },
            availableTemplates
        );

    const validator =
        new TemplateCompatibilityValidator();

    const report =
        validator.validate(
            plan
        );

    const presenter =
        new TemplateCompatibilityPresenter();

    const preview =
        presenter.format(
            plan,
            report
        );

    if (
        !report.compatible
    ) {

        throw new Error(
            [
                preview,
                "",
                "The selected template composition is incompatible.",
                "Resolve the compatibility issues shown above and try again."
            ].join("\n")
        );

    }

    return preview;

}

function main(): void {

    /*
     * Compatible CLI flow.
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
                "testing"
            ],
            [
                "node",
                "typescript"
            ]
        );

    const compatiblePreview =
        validateComposition(
            nextjs,
            [
                playwright
            ],
            [
                nextjs,
                playwright
            ]
        );

    if (
        !compatiblePreview.includes(
            "Status       : Compatible"
        )
    ) {

        throw new Error(
            "The compatible CLI flow did not display a compatible status."
        );

    }

    /*
     * Missing capability flow.
     */
    const pythonBase =
        createTemplate(
            "python-base",
            "base",
            [
                "python"
            ]
        );

    let missingCapabilityThrown =
        false;

    try {

        validateComposition(
            pythonBase,
            [
                playwright
            ],
            [
                pythonBase,
                playwright
            ]
        );

    } catch (error) {

        missingCapabilityThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "Status       : Incompatible"
            )
        ) {

            throw new Error(
                "The missing-capability CLI error did not include the incompatible preview."
            );

        }

        if (
            !message.includes(
                '"node"'
            ) ||
            !message.includes(
                '"typescript"'
            )
        ) {

            throw new Error(
                "The missing-capability CLI error did not identify every missing capability."
            );

        }

        if (
            !message.includes(
                "Resolve the compatibility issues shown above"
            )
        ) {

            throw new Error(
                "The CLI error did not include friendly recovery guidance."
            );

        }

    }

    if (!missingCapabilityThrown) {

        throw new Error(
            "The incompatible missing-capability flow was not stopped."
        );

    }

    /*
     * Conflict flow.
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

    let conflictThrown =
        false;

    try {

        validateComposition(
            nextjs,
            [
                postgres,
                sqlite
            ],
            [
                nextjs,
                postgres,
                sqlite
            ]
        );

    } catch (error) {

        conflictThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);

        if (
            !message.includes(
                "conflicts with capability"
            )
        ) {

            throw new Error(
                "The CLI conflict error did not explain the capability conflict."
            );

        }

        if (
            !message.includes(
                '"postgres"'
            )
        ) {

            throw new Error(
                "The CLI conflict error did not identify the conflicting capability."
            );

        }

    }

    if (!conflictThrown) {

        throw new Error(
            "The conflicting CLI composition was not stopped."
        );

    }

    console.log(
        "Template compatibility CLI flow test completed successfully."
    );

}

main();