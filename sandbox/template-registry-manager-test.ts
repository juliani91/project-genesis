import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage,
    TemplateRegistryManifest
} from "../lib/models";

import {
    InstalledTemplatePackageStore,
    TemplatePackageSearchService,
    TemplateRegistryIndexService,
    TemplateRegistryManager
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-registry-manager-test"
        );

    await fs.rm(
        root,
        {
            recursive:
                true,

            force:
                true
        }
    );

    const installedStore =
        new InstalledTemplatePackageStore(
            path.join(
                root,
                "installed",
                "packages.json"
            )
        );

    const manager =
        new TemplateRegistryManager(
            new TemplateRegistryIndexService(),
            new TemplatePackageSearchService(),
            installedStore
        );

    const manifests:
        TemplateRegistryManifest[] = [

        {
            registry: {
                id:
                    "official",

                name:
                    "Official Registry",

                type:
                    "remote",

                location:
                    "https://official.example.com"
            },

            templates: [

                {
                    templateId:
                        "nextjs",

                    version:
                        "4.0.0",

                    name:
                        "Next.js",

                    description:
                        "Next.js application template.",

                    downloadUrl:
                        "https://official.example.com/nextjs-4.0.0.zip",

                    archiveFormat:
                        "zip",

                    sha256:
                        "a".repeat(
                            64
                        )
                },

                {
                    templateId:
                        "nextjs",

                    version:
                        "3.5.0",

                    name:
                        "Next.js",

                    description:
                        "Next.js application template.",

                    downloadUrl:
                        "https://official.example.com/nextjs-3.5.0.zip",

                    archiveFormat:
                        "zip",

                    sha256:
                        "b".repeat(
                            64
                        )
                },

                {
                    templateId:
                        "react",

                    version:
                        "3.0.0",

                    name:
                        "React",

                    description:
                        "Frontend application template.",

                    downloadUrl:
                        "https://official.example.com/react-3.0.0.zip",

                    archiveFormat:
                        "zip",

                    sha256:
                        "c".repeat(
                            64
                        )
                }

            ]
        },

        {
            registry: {
                id:
                    "internal",

                name:
                    "Internal Registry",

                type:
                    "remote",

                location:
                    "https://internal.example.com"
            },

            templates: [
                {
                    templateId:
                        "nextjs-enterprise",

                    version:
                        "2.0.0",

                    name:
                        "Enterprise Next.js",

                    description:
                        "Internal enterprise application template.",

                    downloadUrl:
                        "https://internal.example.com/nextjs-enterprise-2.0.0.zip",

                    archiveFormat:
                        "zip",

                    sha256:
                        "d".repeat(
                            64
                        )
                }
            ]
        }

    ];

    /*
     * Build the searchable registry index.
     */
    const index =
        manager.buildIndex(
            manifests
        );

    if (
        index.templates.length !==
        3
    ) {

        throw new Error(
            [
                "The registry manager built the wrong number of indexed templates.",
                "Expected: 3",
                `Actual: ${index.templates.length}`
            ].join(" ")
        );

    }

    const indexedNextjs =
        index.templates.find(
            (entry) =>
                entry.registryId ===
                    "official" &&
                entry.templateId ===
                    "nextjs"
        );

    if (!indexedNextjs) {

        throw new Error(
            "The registry manager did not index the official Next.js template."
        );

    }

    if (
        indexedNextjs.latestVersion !==
        "4.0.0"
    ) {

        throw new Error(
            "The registry manager selected the wrong latest Next.js version."
        );

    }

    /*
     * Search through the manager.
     */
    const searchResults =
        manager.search(
            index,
            "next"
        );

    if (
        searchResults.length !==
        2
    ) {

        throw new Error(
            [
                "The registry manager search returned the wrong number of results.",
                "Expected: 2",
                `Actual: ${searchResults.length}`
            ].join(" ")
        );

    }

    if (
        searchResults[0]
            ?.template
            .templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The strongest registry-manager search result was incorrect."
        );

    }

    if (
        searchResults[1]
            ?.template
            .templateId !==
        "nextjs-enterprise"
    ) {

        throw new Error(
            "The second registry-manager search result was incorrect."
        );

    }

    /*
     * Empty installed store.
     */
    const initiallyInstalled =
        await manager.listInstalled();

    if (
        initiallyInstalled.length !==
        0
    ) {

        throw new Error(
            "The registry manager did not return an empty installed-package list."
        );

    }

    const installedPackages:
        InstalledTemplatePackage[] = [

        {
            templateId:
                "react",

            version:
                "3.0.0",

            installPath:
                path.join(
                    root,
                    "templates",
                    "react",
                    "3.0.0"
                ),

            sha256:
                "c".repeat(
                    64
                ),

            source:
                "https://official.example.com",

            installedAt:
                new Date(
                    "2026-07-15T14:00:00.000Z"
                )
        },

        {
            templateId:
                "nextjs",

            version:
                "4.0.0",

            installPath:
                path.join(
                    root,
                    "templates",
                    "nextjs",
                    "4.0.0"
                ),

            sha256:
                "a".repeat(
                    64
                ),

            source:
                "https://official.example.com",

            installedAt:
                new Date(
                    "2026-07-15T13:00:00.000Z"
                )
        },

        {
            templateId:
                "nextjs",

            version:
                "3.5.0",

            installPath:
                path.join(
                    root,
                    "templates",
                    "nextjs",
                    "3.5.0"
                ),

            sha256:
                "b".repeat(
                    64
                ),

            source:
                "https://official.example.com",

            installedAt:
                new Date(
                    "2026-07-15T12:00:00.000Z"
                )
        }

    ];

    for (
        const installedPackage
        of installedPackages
    ) {

        await installedStore.install(
            installedPackage
        );

    }

    /*
     * List installed packages through the manager.
     */
    const installed =
        await manager.listInstalled();

    if (
        installed.length !==
        3
    ) {

        throw new Error(
            "The registry manager returned the wrong installed-package count."
        );

    }

    if (
        installed[0]
            ?.templateId !==
            "nextjs" ||
        installed[0]
            ?.version !==
            "3.5.0"
    ) {

        throw new Error(
            "The installed-package list was not sorted by ID and version."
        );

    }

    if (
        installed[1]
            ?.templateId !==
            "nextjs" ||
        installed[1]
            ?.version !==
            "4.0.0"
    ) {

        throw new Error(
            "The second installed-package list entry was incorrect."
        );

    }

    if (
        installed[2]
            ?.templateId !==
            "react"
    ) {

        throw new Error(
            "The installed React package was sorted incorrectly."
        );

    }

    /*
     * Find all installed versions of one package.
     * The manager returns newest versions first.
     */
    const installedNextjs =
        await manager.findInstalled(
            " NEXTJS "
        );

    if (
        installedNextjs.length !==
        2
    ) {

        throw new Error(
            "The registry manager returned the wrong number of installed Next.js versions."
        );

    }

    if (
        installedNextjs[0]
            ?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "The newest installed Next.js version was not returned first."
        );

    }

    if (
        installedNextjs[1]
            ?.version !==
        "3.5.0"
    ) {

        throw new Error(
            "The older installed Next.js version was returned incorrectly."
        );

    }

    const missing =
        await manager.findInstalled(
            "missing-template"
        );

    if (
        missing.length !==
        0
    ) {

        throw new Error(
            "The registry manager returned installed versions for a missing template."
        );

    }

    console.log(
        "Registry index coordination verified."
    );

    console.log(
        "Registry search coordination verified."
    );

    console.log(
        "Installed package listing verified."
    );

    console.log(
        "Installed package lookup verified."
    );

    console.log(
        "Template registry manager test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry manager test failed.",
            error
        );

        process.exitCode =
            1;

    }
);