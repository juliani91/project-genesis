import { promises as fs } from "fs";
import path from "path";

import {
    TemplatePackage,
    TemplateProfile
} from "../lib/models";

import {
    ProjectGenerationService,
    TemplateCatalogService,
    TemplateCompatibilityValidator,
    TemplateCompositionService,
    TemplateDiscoveryService,
    TemplatePackageService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService
} from "../lib/services";

const expectedTemplates = [
    "nextjs-app",
    "react-spa",
    "fastapi-service",
    "node-cli",
    "react-native-app",
    "unity-game",
    "godot-game",
    "feature-docker",
    "feature-github-actions",
    "feature-postgresql",
    "feature-sqlite",
    "feature-playwright",
    "feature-pytest",
    "feature-auth",
    "feature-tailwind",
    "feature-mobile-navigation",
    "feature-game-design-docs",
    "feature-ai-workspace"
];

const expectedProfiles = [
    "web-saas-starter",
    "api-service",
    "mobile-app",
    "unity-game-jam"
];

const generationExpectations = [
    {
        profileId:
            "web-saas-starter",
        expectedFile:
            "app/page.tsx"
    },
    {
        profileId:
            "api-service",
        expectedFile:
            "app/main.py"
    },
    {
        profileId:
            "mobile-app",
        expectedFile:
            "App.tsx"
    },
    {
        profileId:
            "unity-game-jam",
        expectedFile:
            "Assets/Scripts/GameManager.cs"
    }
];

async function enrichTemplates(
    templates:
        readonly TemplatePackage[]
): Promise<TemplatePackage[]> {

    const service =
        new TemplatePackageService();

    const enriched:
        TemplatePackage[] = [];

    for (
        const template
        of templates
    ) {

        enriched.push(
            await service.enrichWithFiles(
                await service.enrichWithFolders(
                    await service.enrichWithWizard(
                        template
                    )
                )
            )
        );

    }

    return enriched;

}

function findProfile(
    profiles:
        readonly TemplateProfile[],

    profileId:
        string
): TemplateProfile {

    const profile =
        profiles.find(
            (candidate) =>
                candidate.id ===
                profileId
        );

    if (!profile) {

        throw new Error(
            `Missing expected profile: ${profileId}`
        );

    }

    return profile;

}

async function main(): Promise<void> {

    const discoveryService =
        new TemplateDiscoveryService();

    const discoveredTemplates =
        await discoveryService.discover();

    const templates =
        await enrichTemplates(
            discoveredTemplates
        );

    const templateIds =
        new Set(
            templates.map(
                (template) =>
                    template.manifest.id
            )
        );

    for (
        const templateId
        of expectedTemplates
    ) {

        if (
            !templateIds.has(
                templateId
            )
        ) {

            throw new Error(
                `Template was not discovered: ${templateId}`
            );

        }

    }

    const catalog =
        new TemplateCatalogService()
            .createCatalog(
                templates
            );

    for (
        const templateId
        of expectedTemplates
    ) {

        if (
            !catalog.some(
                (entry) =>
                    entry.id ===
                    templateId
            )
        ) {

            throw new Error(
                `Template was not included in the catalog: ${templateId}`
            );

        }

    }

    const profiles =
        await new TemplateProfileDiscoveryService()
            .discover();

    const profileComposition =
        new TemplateProfileCompositionService();

    for (
        const profileId
        of expectedProfiles
    ) {

        const result =
            profileComposition.build(
                findProfile(
                    profiles,
                    profileId
                ),
                templates
            );

        if (
            result.plan.baseTemplate.manifest.role !==
            "base"
        ) {

            throw new Error(
                `Profile did not resolve one base template: ${profileId}`
            );

        }

        if (
            !result.compatibility.compatible
        ) {

            throw new Error(
                `Profile was not compatible: ${profileId}`
            );

        }

    }

    const webBase =
        templates.find(
            (template) =>
                template.manifest.id ===
                "nextjs-app"
        );

    const sqlite =
        templates.find(
            (template) =>
                template.manifest.id ===
                "feature-sqlite"
        );

    const postgres =
        templates.find(
            (template) =>
                template.manifest.id ===
                "feature-postgresql"
        );

    if (
        !webBase ||
        !sqlite ||
        !postgres
    ) {

        throw new Error(
            "Missing templates required for conflict validation."
        );

    }

    const conflictPlan =
        await new TemplateCompositionService()
            .compose(
                {
                    baseTemplate:
                        webBase,
                    featureTemplates: [
                        postgres,
                        sqlite
                    ],
                    orderedTemplates: [
                        webBase,
                        postgres,
                        sqlite
                    ]
                },
                templates
            );

    const conflictReport =
        new TemplateCompatibilityValidator()
            .validate({
                baseTemplate:
                    webBase,
                featureTemplates: [
                    postgres,
                    sqlite
                ],
                orderedTemplates: [
                    webBase,
                    postgres,
                    sqlite
                ]
            });

    void conflictPlan;

    if (
        conflictReport.compatible
    ) {

        throw new Error(
            "PostgreSQL and SQLite conflict was not detected."
        );

    }

    const outputRoot =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-library-expansion-test"
        );

    await fs.rm(
        outputRoot,
        {
            recursive:
                true,
            force:
                true
        }
    );

    for (
        const expectation
        of generationExpectations
    ) {

        const profile =
            findProfile(
                profiles,
                expectation.profileId
            );

        const result =
            profileComposition.build(
                profile,
                templates
            );

        const composedTemplate =
            await new TemplateCompositionService()
                .compose(
                    result.plan,
                    templates
                );

        const outputPath =
            path.join(
                outputRoot,
                expectation.profileId
            );

        await new ProjectGenerationService()
            .generate({
                template:
                    composedTemplate,
                answers: [
                    {
                        key:
                            "PROJECT_NAME",
                        value:
                            expectation.profileId
                    },
                    {
                        key:
                            "PROJECT_DESCRIPTION",
                        value:
                            "Generated by the template library expansion test."
                    },
                    {
                        key:
                            "PACKAGE_NAME",
                        value:
                            expectation.profileId
                    }
                ],
                outputPath
            });

        await fs.access(
            path.join(
                outputPath,
                expectation.expectedFile
            )
        );

    }

    console.log(
        "Template library expansion test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template library expansion test failed.",
            error
        );

        process.exitCode =
            1;

    }
);
