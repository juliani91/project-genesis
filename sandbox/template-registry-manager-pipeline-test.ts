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
            "template-registry-manager-pipeline-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const store =
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
            store
        );

    const manifests: TemplateRegistryManifest[] = [
        {
            registry: {
                id: "official",
                name: "Official",
                type: "remote",
                location: "https://official.example.com"
            },
            templates: [
                {
                    templateId: "nextjs",
                    version: "4.0.0",
                    name: "Next.js",
                    downloadUrl: "https://official.example.com/nextjs.zip",
                    archiveFormat: "zip",
                    sha256: "a".repeat(64)
                },
                {
                    templateId: "react",
                    version: "3.0.0",
                    name: "React",
                    downloadUrl: "https://official.example.com/react.zip",
                    archiveFormat: "zip",
                    sha256: "b".repeat(64)
                }
            ]
        },
        {
            registry: {
                id: "internal",
                name: "Internal",
                type: "remote",
                location: "https://internal.example.com"
            },
            templates: [
                {
                    templateId: "nextjs-enterprise",
                    version: "2.0.0",
                    name: "Enterprise Next.js",
                    downloadUrl: "https://internal.example.com/next.zip",
                    archiveFormat: "zip",
                    sha256: "c".repeat(64)
                }
            ]
        }
    ];

    const index =
        manager.buildIndex(
            manifests
        );

    if (
        index.templates.length !==
        3
    ) {

        throw new Error(
            "Registry manager did not build the expected index."
        );

    }

    const search =
        manager.search(
            index,
            "next"
        );

    if (
        search.length !==
        2
    ) {

        throw new Error(
            "Registry manager search returned an unexpected number of results."
        );

    }

    await store.install({
        templateId: "nextjs",
        version: "4.0.0",
        installPath: path.join(root, "templates", "nextjs", "4.0.0"),
        sha256: "a".repeat(64),
        source: "https://official.example.com",
        installedAt: new Date()
    });

    await store.install({
        templateId: "nextjs",
        version: "3.5.0",
        installPath: path.join(root, "templates", "nextjs", "3.5.0"),
        sha256: "d".repeat(64),
        source: "https://official.example.com",
        installedAt: new Date()
    });

    await store.install({
        templateId: "react",
        version: "3.0.0",
        installPath: path.join(root, "templates", "react", "3.0.0"),
        sha256: "b".repeat(64),
        source: "https://official.example.com",
        installedAt: new Date()
    });

    const installed =
        await manager.listInstalled();

    if (
        installed.length !==
        3
    ) {

        throw new Error(
            "Installed package listing failed."
        );

    }

    const nextVersions =
        await manager.findInstalled(
            "nextjs"
        );

    if (
        nextVersions.length !==
        2
    ) {

        throw new Error(
            "Installed version lookup failed."
        );

    }

    if (
        nextVersions[0]?.version !==
        "4.0.0"
    ) {

        throw new Error(
            "Newest installed version was not returned first."
        );

    }

    console.log(
        "Registry manager pipeline verified."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry manager pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);