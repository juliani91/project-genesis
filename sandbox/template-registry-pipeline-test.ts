import { promises as fs } from "fs";
import path from "path";

import {
    ENGINE_VERSION
} from "../lib/constants";

import {
    GenerationRequest
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateCompatibilityValidator,
    TemplateCompositionService,
    TemplateDiscoveryService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService,
    TemplateProfileSelectionService,
    TemplateRegistryDiscoveryService,
    TemplateRegistryResolver,
    TemplateVersionReportService,
    WizardRunner
} from "../lib/services";

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

    const outputPath =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-registry-pipeline-test"
        );

    await fs.rm(
        outputPath,
        {
            recursive: true,
            force: true
        }
    );

    /*
     * Discover the real local registry.
     */
    const registryDiscovery =
        new TemplateRegistryDiscoveryService();

    const registryManifests =
        await registryDiscovery.discover();

    const localManifest =
        registryManifests.find(
            (manifest) =>
                manifest.registry.id ===
                "local"
        );

    if (!localManifest) {

        throw new Error(
            "The local registry manifest was not discovered."
        );

    }

    /*
     * Resolve its configured location.
     */
    const registryResolver =
        new TemplateRegistryResolver();

    const localRegistry =
        registryResolver.resolve(
            localManifest
        );

    if (
        localRegistry.type !==
        "local"
    ) {

        throw new Error(
            "The selected registry was not local."
        );

    }

    /*
     * Discover templates through the registry rather
     * than through the default template directory path.
     */
    const templateDiscovery =
        new TemplateDiscoveryService();

    const templates =
        await templateDiscovery
            .discoverFromRegistry(
                localRegistry
            );

    if (
        templates.length === 0
    ) {

        throw new Error(
            "The local registry did not provide any templates."
        );

    }

    /*
     * Discover and select the real profile.
     */
    const profileDiscovery =
        new TemplateProfileDiscoveryService();

    const profiles =
        await profileDiscovery.discover();

    const profileSelection =
        new TemplateProfileSelectionService();

    const profile =
        profileSelection.findById(
            profiles,
            "project-genesis-default"
        );

    /*
     * Convert the profile into a dependency-aware
     * composition plan.
     */
    const profileComposition =
        new TemplateProfileCompositionService();

    const profileResult =
        profileComposition.build(
            profile,
            templates
        );

    /*
     * Validate capabilities.
     */
    const compatibilityValidator =
        new TemplateCompatibilityValidator();

    const compatibilityReport =
        compatibilityValidator.validate(
            profileResult.plan
        );

    if (
        !compatibilityReport.compatible
    ) {

        throw new Error(
            [
                "Registry-driven capability validation failed:",
                ...compatibilityReport.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    /*
     * Validate engine and template versions.
     */
    const versionReportService =
        new TemplateVersionReportService();

    const versionReport =
        versionReportService.createReport(
            profileResult.plan,
            ENGINE_VERSION
        );

    if (
        !versionReport.compatible
    ) {

        throw new Error(
            [
                "Registry-driven version validation failed:",
                ...versionReport.issues.map(
                    (issue) =>
                        issue.message
                )
            ].join(" ")
        );

    }

    /*
     * Compose the registry-loaded templates.
     */
    const compositionService =
        new TemplateCompositionService();

    const composedTemplate =
        await compositionService.compose(
            profileResult.plan,
            templates
        );

    const wizard =
        composedTemplate
            .descriptors
            .wizard;

    if (!wizard) {

        throw new Error(
            "The registry-driven composition did not contain a wizard."
        );

    }

    /*
     * Supply automated answers to the real wizard.
     *
     * USE_DATABASE is false, so DATABASE remains hidden.
     */
    const promptProvider =
        new TestPromptProvider([
            "Registry Pipeline Project",
            "Registry Test Client",
            "Generated through the local template registry.",
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
        answers.length !==
        6
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
     * Generate from the registry-loaded, composed package.
     */
    const request:
        GenerationRequest = {

        template:
            composedTemplate,

        answers,

        outputPath
    };

    const generationService =
        new ProjectGenerationService();

    const generationPlan =
        await generationService.generate(
            request
        );

    /*
     * Verify output.
     */
    if (
        !await pathExists(
            outputPath
        )
    ) {

        throw new Error(
            "The registry pipeline did not create the output directory."
        );

    }

    const readmePath =
        path.join(
            outputPath,
            "README.md"
        );

    if (
        !await pathExists(
            readmePath
        )
    ) {

        throw new Error(
            "The registry pipeline did not generate README.md."
        );

    }

    const readme =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    const expectedReadmeValues = [
        "# Registry Pipeline Project",
        "Registry Test Client",
        "Generated through the local template registry.",
        "TypeScript",
        "registry-pipeline-project"
    ];

    for (
        const expectedValue
        of expectedReadmeValues
    ) {

        if (
            !readme.includes(
                expectedValue
            )
        ) {

            throw new Error(
                `The generated registry README was missing: ${expectedValue}`
            );

        }

    }

    if (
        readme.includes(
            "{{"
        )
    ) {

        throw new Error(
            "The registry-generated README contained unresolved placeholders."
        );

    }

    console.log(
        "Registry:",
        localRegistry.name
    );

    console.log(
        "Templates loaded:",
        templates.length
    );

    console.log(
        "Generated output:",
        generationPlan.outputPath
    );

    console.log(
        "Files generated:",
        generationPlan.files.length
    );

    console.log(
        "Template registry pipeline test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);