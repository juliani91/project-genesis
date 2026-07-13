import { promises as fs } from "fs";
import path from "path";

import {
    TemplateCompositionRequest,
    TemplatePackage
} from "../lib/models";

import {
    TemplateCompatibilityPresenter,
    TemplateCompatibilityValidator,
    TemplateCompositionPlanner,
    TemplateCompositionService
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

        descriptors: {
            wizard:
                undefined,

            folders: [],

            files: [],

            resolvedFiles: []
        }
    };

}

async function validateAndCompose(
    request:
        TemplateCompositionRequest,

    availableTemplates:
        readonly TemplatePackage[]
): Promise<TemplatePackage> {

    const planner =
        new TemplateCompositionPlanner();

    const plan =
        planner.createPlan(
            request,
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

    console.log(preview);
    console.log("");

    if (!report.compatible) {

        throw new Error(
            [
                "The selected template composition is incompatible.",
                ...report.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    const compositionService =
        new TemplateCompositionService();

    return compositionService.compose(
        plan,
        availableTemplates
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-compatibility-pipeline-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    /*
     * Scenario 1:
     * Compatible composition.
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

    const compatible =
        await validateAndCompose(
            {
                baseTemplate:
                    nextjs,

                featureTemplates: [
                    playwright
                ]
            },
            [
                nextjs,
                playwright
            ]
        );

    if (
        compatible.manifest.id !==
        "nextjs"
    ) {

        throw new Error(
            "The compatible composition did not preserve the base manifest."
        );

    }

    /*
     * Scenario 2:
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

    let missingThrown =
        false;

    try {

        await validateAndCompose(
            {
                baseTemplate:
                    pythonBase,

                featureTemplates: [
                    playwright
                ]
            },
            [
                pythonBase,
                playwright
            ]
        );

    } catch (error) {

        missingThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.log(message);
        console.log("");

        if (
            !message.includes(
                "requires capability \"node\""
            ) ||
            !message.includes(
                "requires capability \"typescript\""
            )
        ) {

            throw new Error(
                "The missing-capability pipeline error was incomplete."
            );

        }

    }

    if (!missingThrown) {

        throw new Error(
            "The missing-capability composition was not stopped."
        );

    }

    /*
     * Scenario 3:
     * Capability conflict.
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

        await validateAndCompose(
            {
                baseTemplate:
                    nextjs,

                featureTemplates: [
                    postgres,
                    sqlite
                ]
            },
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
        console.log("");

        if (
            !message.includes(
                "conflicts with capability \"postgres\""
            )
        ) {

            throw new Error(
                "The conflict pipeline error was incomplete."
            );

        }

    }

    if (!conflictThrown) {

        throw new Error(
            "The conflicting composition was not stopped."
        );

    }

    /*
     * No output should be generated because this test
     * validates compatibility and composition only.
     */
    try {

        await fs.access(
            root
        );

        throw new Error(
            "Compatibility validation unexpectedly generated output."
        );

    } catch (error) {

        if (
            error instanceof Error &&
            !(
                "code" in error &&
                error.code === "ENOENT"
            )
        ) {

            throw error;

        }

    }

    console.log(
        "Template compatibility pipeline test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template compatibility pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);