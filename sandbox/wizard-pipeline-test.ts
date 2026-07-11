import { promises as fs } from "fs";
import path from "path";

import {
    TemplatePackage,
    WizardAnswer
} from "../lib/models";

import {
    GenerationPlanner,
    GenerationService,
    PreparationService,
    TemplateDiscoveryService
} from "../lib/services";

interface GenerationRequest {
    outputFolderName: string;
    answers: readonly WizardAnswer[];
}

async function pathExists(
    targetPath: string
): Promise<boolean> {

    try {

        await fs.access(targetPath);

        return true;

    } catch {

        return false;

    }

}

async function findProjectGenesisTemplate():
Promise<TemplatePackage> {

    const discoveryService =
        new TemplateDiscoveryService();

    const templates =
        await discoveryService.discover();

    const template = templates.find(
        (item) =>
            item.manifest.id ===
            "project-genesis"
    );

    if (!template) {

        throw new Error(
            "Project Genesis template was not found."
        );

    }

    return template;

}

async function generateProject(
    template: TemplatePackage,
    request: GenerationRequest
): Promise<string> {

    const preparationService =
        new PreparationService();

    const preparationResult =
        await preparationService.prepare(
            template,
            request.answers
        );

    if (
        !preparationResult.success ||
        !preparationResult.template
    ) {

        throw new Error(
            [
                "Template preparation failed:",
                ...preparationResult.errors
            ].join(" ")
        );

    }

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        request.outputFolderName
    );

    await fs.rm(outputPath, {
        recursive: true,
        force: true
    });

    const planner =
        new GenerationPlanner();

    const plan =
        await planner.createPlan(
            preparationResult.template,
            outputPath
        );

    const generationService =
        new GenerationService();

    await generationService.generate(plan);

    console.log(
        `Generated "${request.outputFolderName}".`
    );

    console.log(
        `Folders: ${plan.folders.length}`
    );

    console.log(
        `Files: ${plan.files.length}`
    );

    return outputPath;

}

async function verifyFullProject(
    outputPath: string
): Promise<void> {

    const dockerfileExists =
        await pathExists(
            path.join(
                outputPath,
                "Docker",
                "Dockerfile"
            )
        );

    const postgresFileExists =
        await pathExists(
            path.join(
                outputPath,
                "Database",
                "PostgreSQL",
                "README.md"
            )
        );

    const readme =
        await fs.readFile(
            path.join(
                outputPath,
                "README.md"
            ),
            "utf-8"
        );

    if (!dockerfileExists) {

        throw new Error(
            "The full project did not generate its Dockerfile."
        );

    }

    if (!postgresFileExists) {

        throw new Error(
            "The full project did not generate its PostgreSQL file."
        );

    }

    if (
        !readme.includes(
            "# Full Wizard Project"
        )
    ) {

        throw new Error(
            "The full project README did not contain the wizard project name."
        );

    }

    if (
        readme.includes(
            "{{PROJECT_NAME}}"
        )
    ) {

        throw new Error(
            "The full project README contains an unresolved placeholder."
        );

    }

}

async function verifyBasicProject(
    outputPath: string
): Promise<void> {

    const dockerFolderExists =
        await pathExists(
            path.join(
                outputPath,
                "Docker"
            )
        );

    const postgresFolderExists =
        await pathExists(
            path.join(
                outputPath,
                "Database",
                "PostgreSQL"
            )
        );

    const readme =
        await fs.readFile(
            path.join(
                outputPath,
                "README.md"
            ),
            "utf-8"
        );

    if (dockerFolderExists) {

        throw new Error(
            "The basic project unexpectedly generated the Docker folder."
        );

    }

    if (postgresFolderExists) {

        throw new Error(
            "The basic project unexpectedly generated the PostgreSQL folder."
        );

    }

    if (
        !readme.includes(
            "# Basic Wizard Project"
        )
    ) {

        throw new Error(
            "The basic project README did not contain the wizard project name."
        );

    }

}

async function main(): Promise<void> {

    const template =
        await findProjectGenesisTemplate();

    const fullProjectRequest:
    GenerationRequest = {

        outputFolderName:
            "wizard-pipeline-full",

        answers: [
            {
                key: "PROJECT_NAME",
                value: "Full Wizard Project"
            },
            {
                key: "CLIENT_NAME",
                value: "Full Project Client"
            },
            {
                key: "PROJECT_DESCRIPTION",
                value: "A complete project generated through the Wizard Runtime."
            },
            {
                key: "TECH_STACK",
                value: "TypeScript, Docker, and PostgreSQL"
            },
            {
                key: "USE_DOCKER",
                value: "true"
            },
            {
                key: "USE_DATABASE",
                value: "true"
            },
            {
                key: "DATABASE",
                value: "postgres"
            }
        ]

    };

    const basicProjectRequest:
    GenerationRequest = {

        outputFolderName:
            "wizard-pipeline-basic",

        answers: [
            {
                key: "PROJECT_NAME",
                value: "Basic Wizard Project"
            },
            {
                key: "CLIENT_NAME",
                value: "Basic Project Client"
            },
            {
                key: "PROJECT_DESCRIPTION",
                value: "A basic project generated without optional features."
            },
            {
                key: "TECH_STACK",
                value: "TypeScript"
            },
            {
                key: "USE_DOCKER",
                value: "false"
            },
            {
                key: "USE_DATABASE",
                value: "false"
            },
            {
                key: "DATABASE",
                value: "none"
            }
        ]

    };

    const fullProjectPath =
        await generateProject(
            template,
            fullProjectRequest
        );

    const basicProjectPath =
        await generateProject(
            template,
            basicProjectRequest
        );

    await verifyFullProject(
        fullProjectPath
    );

    await verifyBasicProject(
        basicProjectPath
    );

    console.log(
        "Wizard pipeline test completed successfully."
    );

    console.log(
        `Full project: ${fullProjectPath}`
    );

    console.log(
        `Basic project: ${basicProjectPath}`
    );

}

main().catch((error: unknown) => {

    console.error(
        "Wizard pipeline test failed.",
        error
    );

    process.exitCode = 1;

});