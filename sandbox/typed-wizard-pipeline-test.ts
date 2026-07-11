import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateDiscoveryService,
    TemplatePackageService,
    WizardRunner
} from "../lib/services";

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

async function main(): Promise<void> {

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

    const templatePackageService =
        new TemplatePackageService();

    const enrichedTemplate =
        await templatePackageService
            .enrichWithWizard(template);

    const wizard =
        enrichedTemplate
            .descriptors
            .wizard;

    if (!wizard) {

        throw new Error(
            "The Project Genesis wizard was not loaded."
        );

    }

    const promptProvider =
        new TestPromptProvider([
            "Typed Pipeline Project",
            "Internal Test Client",
            "A complete typed wizard pipeline test.",
            "TypeScript, Docker, and PostgreSQL",
            "true",
            "true",
            "postgres"
        ]);

    const wizardRunner =
        new WizardRunner();

    const answers =
        await wizardRunner.run(
            wizard,
            promptProvider
        );

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        "typed-wizard-pipeline-test"
    );

    await fs.rm(outputPath, {
        recursive: true,
        force: true
    });

    const request: GenerationRequest = {
        template,
        answers,
        outputPath
    };

    const projectGenerationService =
        new ProjectGenerationService();

    const plan =
        await projectGenerationService.generate(
            request
        );

    const readmePath = path.join(
        outputPath,
        "README.md"
    );

    const dockerfilePath = path.join(
        outputPath,
        "Docker",
        "Dockerfile"
    );

    const postgresReadmePath = path.join(
        outputPath,
        "Database",
        "PostgreSQL",
        "README.md"
    );

    const readme =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    const dockerfileExists =
        await pathExists(
            dockerfilePath
        );

    const postgresReadmeExists =
        await pathExists(
            postgresReadmePath
        );

    if (
        !readme.includes(
            "# Typed Pipeline Project"
        )
    ) {

        throw new Error(
            "The generated README did not contain the typed project name."
        );

    }

    if (
        readme.includes(
            "{{PROJECT_NAME}}"
        )
    ) {

        throw new Error(
            "The generated README still contains an unresolved PROJECT_NAME placeholder."
        );

    }

    if (!dockerfileExists) {

        throw new Error(
            "The typed boolean answer did not generate the Dockerfile."
        );

    }

    if (!postgresReadmeExists) {

        throw new Error(
            "The typed select answer did not generate the PostgreSQL content."
        );

    }

    const messages =
        promptProvider.getMessages();

    if (
        !messages.some(
            (message) =>
                message.includes(
                    "Use Docker"
                )
        )
    ) {

        throw new Error(
            "The typed pipeline did not use the Docker boolean prompt."
        );

    }

    if (
        !messages.some(
            (message) =>
                message.includes(
                    "Database"
                )
        )
    ) {

        throw new Error(
            "The typed pipeline did not use the database select prompt."
        );

    }

    console.log(
        "Typed wizard pipeline test completed successfully."
    );

    console.log(
        `Output: ${plan.outputPath}`
    );

    console.log(
        `Folders generated: ${plan.folders.length}`
    );

    console.log(
        `Files generated: ${plan.files.length}`
    );

}

main().catch((error: unknown) => {

    console.error(
        "Typed wizard pipeline test failed.",
        error
    );

    process.exitCode = 1;

});