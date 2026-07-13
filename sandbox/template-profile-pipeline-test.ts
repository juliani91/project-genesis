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
    TemplateCompositionService,
    TemplateDiscoveryService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService,
    TemplateProfileSelectionService,
    WizardRunner
} from "../lib/services";

async function main(): Promise<void> {

    const outputRoot =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-profile-pipeline-test"
        );

    await fs.rm(
        outputRoot,
        {
            recursive: true,
            force: true
        }
    );

    /*
     * Discover templates.
     */
    const templateDiscovery =
        new TemplateDiscoveryService();

    const templates =
        await templateDiscovery.discover();

    if (
        templates.length === 0
    ) {

        throw new Error(
            "No templates were discovered."
        );

    }

    /*
     * Discover and select the real profile.
     */
    const profileDiscovery =
        new TemplateProfileDiscoveryService();

    const profiles =
        await profileDiscovery.discover();

    const selectionService =
        new TemplateProfileSelectionService();

    const profile =
        selectionService.findById(
            profiles,
            "project-genesis-default"
        );

    /*
     * Resolve the profile into a dependency-aware
     * and compatibility-validated composition plan.
     */
    const profileCompositionService =
        new TemplateProfileCompositionService();

    const profileComposition =
        profileCompositionService.build(
            profile,
            templates
        );

    if (
        !profileComposition
            .compatibility
            .compatible
    ) {

        throw new Error(
            [
                "The Project Genesis profile was incompatible:",
                ...profileComposition
                    .compatibility
                    .issues
                    .map(
                        (issue) =>
                            issue.message
                    )
            ].join(" ")
        );

    }

    /*
     * Compose the templates before running the wizard.
     *
     * This keeps the test compatible with future profiles
     * that contain feature templates.
     */
    const compositionService =
        new TemplateCompositionService();

    const composedTemplate =
        await compositionService.compose(
            profileComposition.plan,
            templates
        );

    const wizard =
        composedTemplate
            .descriptors
            .wizard;

    if (!wizard) {

        throw new Error(
            "The profile composition did not contain a wizard."
        );

    }

    /*
     * Supply automated answers to the real Project Genesis
     * wizard instead of passing an empty answer collection.
     *
     * USE_DATABASE is false, so DATABASE remains hidden.
     */
    const promptProvider =
        new TestPromptProvider([
            "Profile Pipeline Project",
            "Internal Test Client",
            "Generated through the Project Genesis default profile.",
            "TypeScript",
            "false",
            "false"
        ]);

    const wizardRunner =
        new WizardRunner();

    const answers =
        await wizardRunner.run(
            wizard,
            promptProvider
        );

    if (
        answers.length !== 6
    ) {

        throw new Error(
            `Expected 6 wizard answers but received ${answers.length}.`
        );

    }

    if (
        answers.some(
            (answer) =>
                answer.key ===
                "DATABASE"
        )
    ) {

        throw new Error(
            "The hidden DATABASE field was collected unexpectedly."
        );

    }

    /*
     * Generate from the fully composed template.
     */
    const generationRequest:
        GenerationRequest = {

        template:
            composedTemplate,

        answers,

        outputPath:
            outputRoot
    };

    const generationService =
        new ProjectGenerationService();

    const generationPlan =
        await generationService.generate(
            generationRequest
        );

    console.log("");

    console.log(
        `Generated ${generationPlan.files.length} files`
    );

    console.log(
        `Generated ${generationPlan.folders.length} folders`
    );

    /*
     * Verify output.
     */
    const readmePath =
        path.join(
            outputRoot,
            "README.md"
        );

    await fs.access(
        readmePath
    );

    const readmeContents =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    if (
        !readmeContents.includes(
            "# Profile Pipeline Project"
        )
    ) {

        throw new Error(
            "Generated README.md did not contain the project name."
        );

    }

    if (
        !readmeContents.includes(
            "profile-pipeline-project"
        )
    ) {

        throw new Error(
            "Generated README.md did not contain the computed project slug."
        );

    }

    if (
        !readmeContents.includes(
            "Generated through the Project Genesis default profile."
        )
    ) {

        throw new Error(
            "Generated README.md did not contain the project description."
        );

    }

    if (
        readmeContents.includes(
            "{{"
        )
    ) {

        throw new Error(
            "Generated README.md contained unresolved placeholders."
        );

    }

    console.log(
        "Template profile pipeline test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template profile pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);