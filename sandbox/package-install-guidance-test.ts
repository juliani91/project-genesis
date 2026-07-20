import { promises as fs } from "fs";
import path from "path";

import {
    loadPackageInstall
} from "../lib/loaders";

import {
    PackageInstallCompositionService,
    ProjectGenerationService,
    TemplateCompositionService,
    TemplateDiscoveryService,
    TemplatePackageService,
    TemplateProfileCompositionService,
    TemplateProfileDiscoveryService
} from "../lib/services";

import {
    TemplatePackage
} from "../lib/models";

const representativeProfiles = [
    {
        id:
            "web-saas-starter",
        expected:
            "pnpm install"
    },
    {
        id:
            "api-service",
        expected:
            "uv run pytest"
    },
    {
        id:
            "mobile-app",
        expected:
            "npx expo start"
    },
    {
        id:
            "unity-game-jam",
        expected:
            "Unity Hub"
    },
    {
        id:
            "godot-indie-game",
        expected:
            "Manage Export Templates"
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
            await service.enrichWithPackageInstall(
                await service.enrichWithFiles(
                    await service.enrichWithFolders(
                        await service.enrichWithWizard(
                            template
                        )
                    )
                )
            )
        );

    }

    return enriched;

}

async function main(): Promise<void> {

    const nextInstall =
        await loadPackageInstall(
            path.join(
                process.cwd(),
                "templates",
                "nextjs-app",
                "packageInstall.json"
            )
        );

    if (
        !nextInstall ||
        nextInstall.installSteps.length ===
            0
    ) {

        throw new Error(
            "Valid packageInstall.json was not loaded."
        );

    }

    const missingInstall =
        await loadPackageInstall(
            path.join(
                process.cwd(),
                "templates",
                "project-genesis",
                "packageInstall.json"
            )
        );

    if (
        missingInstall !==
        undefined
    ) {

        throw new Error(
            "Missing packageInstall.json should remain optional."
        );

    }

    const composed =
        new PackageInstallCompositionService()
            .compose([
                {
                    ...nextInstall,
                    environmentVariables: [
                        {
                            key:
                                "DATABASE_URL",
                            description:
                                "Base definition.",
                            required:
                                true
                        }
                    ]
                },
                {
                    ...nextInstall,
                    title:
                        "Feature",
                    environmentVariables: [
                        {
                            key:
                                "DATABASE_URL",
                            description:
                                "Feature definition.",
                            required:
                                false
                        }
                    ]
                }
            ]);

    if (
        composed?.environmentVariables[0]
            ?.description !==
        "Base definition."
    ) {

        throw new Error(
            "Package install environment variables were not deduplicated with first definition preserved."
        );

    }

    const templates =
        await enrichTemplates(
            await new TemplateDiscoveryService()
                .discover()
        );

    const profiles =
        await new TemplateProfileDiscoveryService()
            .discover();

    const outputRoot =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-install-guidance-test"
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
        const representative
        of representativeProfiles
    ) {

        const profile =
            profiles.find(
                (candidate) =>
                    candidate.id ===
                    representative.id
            );

        if (!profile) {

            throw new Error(
                `Missing profile: ${representative.id}`
            );

        }

        const profileComposition =
            new TemplateProfileCompositionService()
                .build(
                    profile,
                    templates
                );

        const composedTemplate =
            await new TemplateCompositionService()
                .compose(
                    profileComposition.plan,
                    templates
                );

        const outputPath =
            path.join(
                outputRoot,
                representative.id
            );

        await new ProjectGenerationService()
            .generate({
                template:
                    composedTemplate,
                outputPath,
                answers: [
                    {
                        key:
                            "PROJECT_NAME",
                        value:
                            representative.id
                    },
                    {
                        key:
                            "PROJECT_DESCRIPTION",
                        value:
                            "Package install guidance test project."
                    },
                    {
                        key:
                            "PACKAGE_NAME",
                        value:
                            representative.id
                    }
                ]
            });

        const guide =
            await fs.readFile(
                path.join(
                    outputPath,
                    "packageInstall.md"
                ),
                "utf-8"
            );

        if (
            !guide.includes(
                representative.expected
            )
        ) {

            throw new Error(
                [
                    "Generated packageInstall.md did not include expected content for",
                    representative.id
                ].join(" ")
            );

        }

    }

    console.log(
        "Package install guidance test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Package install guidance test failed.",
            error
        );

        process.exitCode =
            1;

    }
);
