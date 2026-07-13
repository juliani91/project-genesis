import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplateCompositionPlan,
    TemplatePackage
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateCompositionService,
    TemplateVersionReportService,
    WizardRunner
} from "../lib/services";

const TEST_ENGINE_VERSION =
    "1.0.0";

function createTemplate(
    id: string,
    role:
        "base" |
        "feature",
    options: {
        version?: string;
        minGenesisVersion?: string;
        maxGenesisVersion?: string;
        requiresTemplateVersions?:
            Record<string, string>;
        deprecated?: boolean;
        replacementTemplate?: string;
    } = {}
): TemplatePackage {

    return {
        manifest: {
            id,

            name:
                id,

            version:
                options.version ??
                "1.0.0",

            description:
                "",

            author:
                "Test",

            role,

            minGenesisVersion:
                options.minGenesisVersion,

            maxGenesisVersion:
                options.maxGenesisVersion,

            requiresTemplateVersions:
                options.requiresTemplateVersions,

            deprecated:
                options.deprecated,

            replacementTemplate:
                options.replacementTemplate
        },

        path:
            `C:/templates/${id}`,

            descriptors: {
                wizard: {
                    title:
                        "Version Pipeline Wizard",

                    description:
                        "",

                    steps: [
                        {
                            id:
                                "project",

                            title:
                                "Project",

                            description:
                                "",

                            fields: [
                                {
                                    key:
                                        "PROJECT_NAME",

                                    label:
                                        "Project Name",

                                    type:
                                        "string",

                                    required:
                                        true
                                }
                            ]
                        }
                    ]
                },

                /*
                * Include one real generated folder so successful
                * scenarios produce observable filesystem output.
                */
                folders: [
                    {
                        path:
                            "src"
                    }
                ],

                files: [],

                resolvedFiles: []
            }
        
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

async function outputExists(
    targetPath: string
): Promise<boolean> {

    try {

        await fs.access(
            targetPath
        );

        return true;

    } catch {

        return false;

    }

}

async function validateAndGenerate(
    plan:
        TemplateCompositionPlan,

    availableTemplates:
        readonly TemplatePackage[],

    outputPath:
        string
): Promise<void> {

    const versionReportService =
        new TemplateVersionReportService();

    const versionReport =
        versionReportService.createReport(
            plan,
            TEST_ENGINE_VERSION
        );

    if (
        !versionReport.compatible
    ) {

        throw new Error(
            [
                "Version validation failed.",
                ...versionReport.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    const compositionService =
        new TemplateCompositionService();

    const composedTemplate =
        await compositionService.compose(
            plan,
            availableTemplates
        );

    const wizard =
        composedTemplate
            .descriptors
            .wizard;

    if (!wizard) {

        throw new Error(
            "The composed template did not contain a wizard."
        );

    }

    const promptProvider =
        new TestPromptProvider([
            "Version Pipeline Project"
        ]);

    const wizardRunner =
        new WizardRunner();

    const answers =
        await wizardRunner.run(
            wizard,
            promptProvider
        );

    const request:
        GenerationRequest = {

        template:
            composedTemplate,

        answers,

        outputPath
    };

    const generationService =
        new ProjectGenerationService();

    await generationService.generate(
        request
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-version-pipeline-test"
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
     * Compatible version succeeds.
     */
    const compatibleBase =
        createTemplate(
            "compatible-base",
            "base",
            {
                minGenesisVersion:
                    "0.9.0",

                maxGenesisVersion:
                    "1.1.0"
            }
        );

    const compatibleOutput =
        path.join(
            root,
            "compatible"
        );

    await validateAndGenerate(
        createPlan(
            compatibleBase,
            []
        ),
        [
            compatibleBase
        ],
        compatibleOutput
    );

    if (
        !await outputExists(
            compatibleOutput
        )
    ) {

        throw new Error(
            "The compatible version scenario did not generate output."
        );

    }

    /*
     * Scenario 2:
     * Deprecation warning does not block generation.
     */
    const deprecatedBase =
        createTemplate(
            "deprecated-base",
            "base",
            {
                deprecated:
                    true,

                replacementTemplate:
                    "replacement-base"
            }
        );

    const warningReport =
        new TemplateVersionReportService()
            .createReport(
                createPlan(
                    deprecatedBase,
                    []
                ),
                TEST_ENGINE_VERSION
            );

    if (
        !warningReport.compatible
    ) {

        throw new Error(
            "A deprecation warning incorrectly blocked generation."
        );

    }

    if (
        !warningReport.issues.some(
            (issue) =>
                issue.type ===
                "deprecated" &&
                issue.warning
        )
    ) {

        throw new Error(
            "The deprecation warning was not included."
        );

    }

    const deprecatedOutput =
        path.join(
            root,
            "deprecated"
        );

    await validateAndGenerate(
        createPlan(
            deprecatedBase,
            []
        ),
        [
            deprecatedBase
        ],
        deprecatedOutput
    );

    if (
        !await outputExists(
            deprecatedOutput
        )
    ) {

        throw new Error(
            "The deprecated-template scenario did not generate output."
        );

    }

    /*
     * Scenario 3:
     * Engine too old stops before generation.
     */
    const futureBase =
        createTemplate(
            "future-base",
            "base",
            {
                minGenesisVersion:
                    "2.0.0"
            }
        );

    const futureOutput =
        path.join(
            root,
            "future"
        );

    let engineFailureThrown =
        false;

    try {

        await validateAndGenerate(
            createPlan(
                futureBase,
                []
            ),
            [
                futureBase
            ],
            futureOutput
        );

    } catch (error) {

        engineFailureThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "requires Project Genesis 2.0.0 or newer"
            )
        ) {

            throw new Error(
                `Unexpected engine-version failure: ${message}`
            );

        }

    }

    if (!engineFailureThrown) {

        throw new Error(
            "The engine-too-old scenario was not stopped."
        );

    }

    if (
        await outputExists(
            futureOutput
        )
    ) {

        throw new Error(
            "The engine-too-old scenario generated output unexpectedly."
        );

    }

    /*
     * Scenario 4:
     * Template-to-template constraint mismatch stops generation.
     */
    const oldBase =
        createTemplate(
            "base-framework",
            "base",
            {
                version:
                    "1.5.0"
            }
        );

    const demandingFeature =
        createTemplate(
            "demanding-feature",
            "feature",
            {
                requiresTemplateVersions: {
                    "base-framework":
                        ">=2.0.0"
                }
            }
        );

    const mismatchOutput =
        path.join(
            root,
            "template-mismatch"
        );

    let templateFailureThrown =
        false;

    try {

        await validateAndGenerate(
            createPlan(
                oldBase,
                [
                    demandingFeature
                ]
            ),
            [
                oldBase,
                demandingFeature
            ],
            mismatchOutput
        );

    } catch (error) {

        templateFailureThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                'version ">=2.0.0"'
            ) ||
            !message.includes(
                'version "1.5.0" is selected'
            )
        ) {

            throw new Error(
                `Unexpected template-version failure: ${message}`
            );

        }

    }

    if (!templateFailureThrown) {

        throw new Error(
            "The template-version mismatch was not stopped."
        );

    }

    if (
        await outputExists(
            mismatchOutput
        )
    ) {

        throw new Error(
            "The template-version mismatch generated output unexpectedly."
        );

    }

    console.log(
        "Template version pipeline test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template version pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);