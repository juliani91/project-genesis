import { promises as fs } from "fs";
import path from "path";

import {
    GenerationRequest,
    TemplatePackage,
    Wizard
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

async function loadTemplateAndWizard(): Promise<{
    template: TemplatePackage;
    wizard: Wizard;
}> {

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

    return {
        template,
        wizard
    };

}

async function generateProject(
    template: TemplatePackage,
    wizard: Wizard,
    responses: readonly string[],
    outputFolderName: string
): Promise<{
    outputPath: string;
    answers: Awaited<
        ReturnType<
            WizardRunner["run"]
        >
    >;
}> {

    const promptProvider =
        new TestPromptProvider(
            responses
        );

    const runner =
        new WizardRunner();

    const answers =
        await runner.run(
            wizard,
            promptProvider
        );

    const outputPath = path.join(
        process.cwd(),
        "sandbox-output",
        outputFolderName
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

    const service =
        new ProjectGenerationService();

    await service.generate(request);

    return {
        outputPath,
        answers
    };

}

async function main(): Promise<void> {

    const {
        template,
        wizard
    } =
        await loadTemplateAndWizard();

    /*
     * Enabled scenario:
     *
     * USE_DATABASE = true
     * DATABASE = postgres
     */
    const enabled =
        await generateProject(
            template,
            wizard,
            [
                "Conditional Database Project",
                "Internal Test Client",
                "Tests enabled conditional wizard flow.",
                "TypeScript and PostgreSQL",
                "false",
                "true",
                "postgres"
            ],
            "conditional-wizard-enabled"
        );

    const enabledDatabaseAnswer =
        enabled.answers.find(
            (answer) =>
                answer.key ===
                "DATABASE"
        );

    if (
        enabledDatabaseAnswer?.value !==
        "postgres"
    ) {

        throw new Error(
            "The enabled wizard did not collect the PostgreSQL answer."
        );

    }

    const enabledPostgresFile =
        await pathExists(
            path.join(
                enabled.outputPath,
                "Database",
                "PostgreSQL",
                "README.md"
            )
        );

    if (!enabledPostgresFile) {

        throw new Error(
            "The enabled project did not generate PostgreSQL content."
        );

    }

    /*
     * Disabled scenario:
     *
     * USE_DATABASE = false
     * DATABASE is hidden and produces no answer.
     */
    const disabled =
        await generateProject(
            template,
            wizard,
            [
                "Conditional No Database Project",
                "Internal Test Client",
                "Tests disabled conditional wizard flow.",
                "TypeScript",
                "false",
                "false"
            ],
            "conditional-wizard-disabled"
        );

    const disabledDatabaseAnswer =
        disabled.answers.find(
            (answer) =>
                answer.key ===
                "DATABASE"
        );

    if (disabledDatabaseAnswer) {

        throw new Error(
            "The disabled wizard collected a DATABASE answer even though the field was hidden."
        );

    }

    const disabledPostgresFolder =
        await pathExists(
            path.join(
                disabled.outputPath,
                "Database",
                "PostgreSQL"
            )
        );

    if (disabledPostgresFolder) {

        throw new Error(
            "The disabled project generated PostgreSQL content unexpectedly."
        );

    }

    const disabledReadme =
        await fs.readFile(
            path.join(
                disabled.outputPath,
                "README.md"
            ),
            "utf-8"
        );

    if (
        !disabledReadme.includes(
            "# Conditional No Database Project"
        )
    ) {

        throw new Error(
            "The disabled project README was not rendered correctly."
        );

    }

    console.log(
        "Conditional wizard pipeline test completed successfully."
    );

    console.log(
        `Enabled output: ${enabled.outputPath}`
    );

    console.log(
        `Disabled output: ${disabled.outputPath}`
    );

}

main().catch((error: unknown) => {

    console.error(
        "Conditional wizard pipeline test failed.",
        error
    );

    process.exitCode = 1;

});