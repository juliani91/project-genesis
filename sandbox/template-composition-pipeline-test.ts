import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplateCompositionRequest
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateCompositionPlanner,
    TemplateCompositionService,
    TemplateDiscoveryService,
    WizardRunner
} from "../lib/services";

async function writeJson(
    targetPath: string,
    value: unknown
): Promise<void> {

    await fs.writeFile(
        targetPath,
        JSON.stringify(
            value,
            null,
            2
        ),
        "utf-8"
    );

}

async function createBaseTemplate(
    templatesRoot: string
): Promise<void> {

    const templatePath =
        path.join(
            templatesRoot,
            "test-base"
        );

    await fs.mkdir(
        path.join(
            templatePath,
            "files"
        ),
        {
            recursive: true
        }
    );

    await writeJson(
        path.join(
            templatePath,
            "genesis.json"
        ),
        {
            id: "test-base",
            extends: null,
            name: "Test Base",
            version: "1.0.0",
            description:
                "Base template for composition testing.",
            author: "Test",
            category: "Test",
            tags: [
                "base"
            ],
            role: "base"
        }
    );

    await writeJson(
        path.join(
            templatePath,
            "wizard.json"
        ),
        {
            title:
                "Test Base Wizard",

            description:
                "Collects base project information.",

            steps: [
                {
                    id:
                        "project",

                    title:
                        "Project",

                    description:
                        "Collect base project values.",

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
        }
    );

    await writeJson(
        path.join(
            templatePath,
            "folders.json"
        ),
        [
            {
                path:
                    "src"
            }
        ]
    );

    await writeJson(
        path.join(
            templatePath,
            "files.json"
        ),
        [
            {
                source:
                    "README.md",

                destination:
                    "README.md",

                mode:
                    "render"
            }
        ]
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files",
            "README.md"
        ),
        [
            "# {{PROJECT_NAME}}",
            "",
            "Slug: {{PROJECT_SLUG}}",
            "",
            "Generated: {{CREATED_DATE}}"
        ].join("\n"),
        "utf-8"
    );

}

async function createFeatureTemplate(
    templatesRoot: string
): Promise<void> {

    const templatePath =
        path.join(
            templatesRoot,
            "test-docker"
        );

    await fs.mkdir(
        path.join(
            templatePath,
            "files"
        ),
        {
            recursive: true
        }
    );

    await writeJson(
        path.join(
            templatePath,
            "genesis.json"
        ),
        {
            id:
                "test-docker",

            extends:
                null,

            name:
                "Test Docker",

            version:
                "1.0.0",

            description:
                "Docker feature for composition testing.",

            author:
                "Test",

            category:
                "Test",

            tags: [
                "docker",
                "feature"
            ],

            role:
                "feature"
        }
    );

    await writeJson(
        path.join(
            templatePath,
            "wizard.json"
        ),
        {
            title:
                "Docker Wizard",

            description:
                "Collects Docker settings.",

            steps: [
                {
                    id:
                        "docker",

                    title:
                        "Docker",

                    description:
                        "Collect Docker values.",

                    fields: [
                        {
                            key:
                                "DOCKER_PORT",

                            label:
                                "Docker Port",

                            type:
                                "string",

                            required:
                                true
                        }
                    ]
                }
            ]
        }
    );

    await writeJson(
        path.join(
            templatePath,
            "folders.json"
        ),
        [
            {
                path:
                    "Docker"
            }
        ]
    );

    await writeJson(
        path.join(
            templatePath,
            "files.json"
        ),
        [
            {
                source:
                    "Dockerfile",

                destination:
                    "Docker/Dockerfile",

                mode:
                    "render"
            }
        ]
    );

    await fs.writeFile(
        path.join(
            templatePath,
            "files",
            "Dockerfile"
        ),
        [
            "FROM node:20",
            "",
            "EXPOSE {{DOCKER_PORT}}"
        ].join("\n"),
        "utf-8"
    );

}

async function pathExists(
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

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-composition-pipeline-test"
        );

    const templatesRoot =
        path.join(
            root,
            "templates"
        );

    const generatedRoot =
        path.join(
            root,
            "generated"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    await fs.mkdir(
        templatesRoot,
        {
            recursive: true
        }
    );

    await createBaseTemplate(
        templatesRoot
    );

    await createFeatureTemplate(
        templatesRoot
    );

    const originalWorkingDirectory =
        process.cwd();

    process.chdir(
        root
    );

    try {

        const discoveryService =
            new TemplateDiscoveryService();

        const templates =
            await discoveryService.discover();

        const base =
            templates.find(
                (template) =>
                    template.manifest.id ===
                    "test-base"
            );

        const docker =
            templates.find(
                (template) =>
                    template.manifest.id ===
                    "test-docker"
            );

        if (!base || !docker) {

            throw new Error(
                "The temporary composition templates were not discovered."
            );

        }

        const request:
            TemplateCompositionRequest = {

            baseTemplate:
                base,

            featureTemplates: [
                docker
            ]
        };

        const planner =
            new TemplateCompositionPlanner();

        const plan =
            planner.createPlan(
                request,
                templates
            );

        if (
            plan.orderedTemplates
                .map(
                    (template) =>
                        template.manifest.id
                )
                .join(",") !==
            "test-base,test-docker"
        ) {

            throw new Error(
                "The composition plan order was incorrect."
            );

        }

        const compositionService =
            new TemplateCompositionService();

        const composedTemplate =
            await compositionService.compose(
                plan,
                templates
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
                "Composed Project",
                "3000"
            ]);

        const runner =
            new WizardRunner();

        const answers =
            await runner.run(
                wizard,
                promptProvider
            );

        if (
            answers.length !==
            2
        ) {

            throw new Error(
                `Expected 2 composed wizard answers but received ${answers.length}.`
            );

        }

        const generationRequest:
            GenerationRequest = {

            template:
                composedTemplate,

            answers,

            outputPath:
                generatedRoot
        };

        const generationService =
            new ProjectGenerationService();

        const generationPlan =
            await generationService.generate(
                generationRequest
            );

        const readmePath =
            path.join(
                generatedRoot,
                "README.md"
            );

        const dockerfilePath =
            path.join(
                generatedRoot,
                "Docker",
                "Dockerfile"
            );

        if (
            !await pathExists(
                readmePath
            )
        ) {

            throw new Error(
                "The composed base README was not generated."
            );

        }

        if (
            !await pathExists(
                dockerfilePath
            )
        ) {

            throw new Error(
                "The composed feature Dockerfile was not generated."
            );

        }

        const readme =
            await fs.readFile(
                readmePath,
                "utf-8"
            );

        const dockerfile =
            await fs.readFile(
                dockerfilePath,
                "utf-8"
            );

        if (
            !readme.includes(
                "# Composed Project"
            )
        ) {

            throw new Error(
                "The composed README did not contain the project name."
            );

        }

        if (
            !readme.includes(
                "composed-project"
            )
        ) {

            throw new Error(
                "The composed README did not contain PROJECT_SLUG."
            );

        }

        if (
            !dockerfile.includes(
                "EXPOSE 3000"
            )
        ) {

            throw new Error(
                "The feature Dockerfile did not contain the wizard value."
            );

        }

        if (
            readme.includes(
                "{{"
            ) ||
            dockerfile.includes(
                "{{"
            )
        ) {

            throw new Error(
                "The composed project contains unresolved placeholders."
            );

        }

        console.log(
            "Template composition pipeline test completed successfully."
        );

        console.log(
            `Output: ${generationPlan.outputPath}`
        );

        console.log(
            `Folders generated: ${generationPlan.folders.length}`
        );

        console.log(
            `Files generated: ${generationPlan.files.length}`
        );

    } finally {

        process.chdir(
            originalWorkingDirectory
        );

    }

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template composition pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);