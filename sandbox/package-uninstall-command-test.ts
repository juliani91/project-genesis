import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage
} from "../lib/models";

import {
    PackageUninstallCommand
} from "../lib/commands";

import {
    InstalledTemplatePackageStore,
    PackageCommandFormatter,
    TemplatePackageInstallationService,
    TemplatePackageRemovalService,
    TemplatePackageSearchService,
    TemplateRegistryIndexService,
    TemplateRegistryManager
} from "../lib/services";

async function pathExists(
    targetPath:
        string
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

async function createInstalledTemplate(
    installPath:
        string,

    templateId:
        string,

    version:
        string
): Promise<void> {

    await fs.mkdir(
        path.join(
            installPath,
            "files"
        ),
        {
            recursive:
                true
        }
    );

    await fs.writeFile(
        path.join(
            installPath,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id:
                    templateId,

                name:
                    "Uninstall Command Test",

                version,

                description:
                    "Package uninstall command test.",

                author:
                    "Project Genesis"
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            installPath,
            "files",
            "README.md"
        ),
        `# ${templateId} ${version}`,
        "utf-8"
    );

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-uninstall-command-test"
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

    const installationDirectory =
        path.join(
            root,
            "installed-templates"
        );

    const store =
        new InstalledTemplatePackageStore(
            path.join(
                root,
                "installed-store",
                "packages.json"
            )
        );

    const removalService =
        new TemplatePackageRemovalService(
            installationDirectory,
            store
        );

    /*
     * The installation service is not used by this focused test,
     * but TemplateRegistryManager currently accepts it before the
     * removal service in its constructor.
     */
    const installationService =
        new TemplatePackageInstallationService();

    const manager =
        new TemplateRegistryManager(
            new TemplateRegistryIndexService(),
            new TemplatePackageSearchService(),
            store,
            installationService,
            removalService
        );

    const command =
        new PackageUninstallCommand(
            manager
        );

    const formatter =
        new PackageCommandFormatter();

    const installPath =
        removalService.getInstallPath(
            "uninstall-command-test",
            "1.0.0"
        );

    await createInstalledTemplate(
        installPath,
        "uninstall-command-test",
        "1.0.0"
    );

    const installedPackage:
        InstalledTemplatePackage = {

        templateId:
            "uninstall-command-test",

        version:
            "1.0.0",

        installPath,

        sha256:
            "a".repeat(
                64
            ),

        source:
            "https://official.example.com",

        installedAt:
            new Date(
                "2026-07-16T09:00:00.000Z"
            )

    };

    await store.install(
        installedPackage
    );

    /*
     * Successful uninstall.
     */
    const removed =
        await command.execute(
            " UNINSTALL-COMMAND-TEST ",
            " 1.0.0 "
        );

    if (
        !removed.success
    ) {

        throw new Error(
            "The package uninstall command reported failure."
        );

    }

    if (
        removed.message !==
        'Package "uninstall-command-test" version "1.0.0" was removed successfully.'
    ) {

        throw new Error(
            [
                "The package uninstall command message was incorrect.",
                `Actual: ${removed.message}`
            ].join(" ")
        );

    }

    if (
        !removed.removed
    ) {

        throw new Error(
            "The package uninstall command did not return removed package metadata."
        );

    }

    if (
        removed.removed.templateId !==
        "uninstall-command-test"
    ) {

        throw new Error(
            "The removed package template ID was incorrect."
        );

    }

    if (
        removed.removed.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The removed package version was incorrect."
        );

    }

    if (
        removed.removed.installPath !==
        installPath
    ) {

        throw new Error(
            "The removed package installation path was incorrect."
        );

    }

    if (
        await pathExists(
            installPath
        )
    ) {

        throw new Error(
            "The package uninstall command did not remove the installation directory."
        );

    }

    const persistedAfterRemoval =
        await store.findById(
            "uninstall-command-test"
        );

    if (
        persistedAfterRemoval.length !==
        0
    ) {

        throw new Error(
            "The package uninstall command did not remove the installed-package record."
        );

    }

    const formattedRemoval =
        formatter.formatRemoval(
            removed
        );

    const expectedRemovalValues = [
        'Package "uninstall-command-test" version "1.0.0" was removed successfully.',
        "Removed Package",
        "Template : uninstall-command-test",
        "Version  : 1.0.0",
        `Path     : ${installPath}`
    ];

    for (
        const expected
        of expectedRemovalValues
    ) {

        if (
            !formattedRemoval.includes(
                expected
            )
        ) {

            throw new Error(
                `The uninstall-command output was missing: ${expected}`
            );

        }

    }

    console.log(
        "Package uninstall command removal verified."
    );

    console.log(
        "Package uninstall command formatting verified."
    );

    /*
     * Missing package.
     */
    const missing =
        await command.execute(
            "missing-package",
            "1.0.0"
        );

    if (
        missing.success
    ) {

        throw new Error(
            "The missing package uninstall command reported success."
        );

    }

    if (
        missing.removed !==
        undefined
    ) {

        throw new Error(
            "The missing package uninstall command returned removed metadata."
        );

    }

    if (
        missing.message !==
        'Package "missing-package" version "1.0.0" is not installed.'
    ) {

        throw new Error(
            [
                "The missing package uninstall message was incorrect.",
                `Actual: ${missing.message}`
            ].join(" ")
        );

    }

    const formattedMissing =
        formatter.formatRemoval(
            missing
        );

    if (
        formattedMissing !==
        'Package "missing-package" version "1.0.0" is not installed.'
    ) {

        throw new Error(
            "The missing package uninstall output was formatted incorrectly."
        );

    }

    /*
     * Empty template ID.
     */
    let emptyIdThrown =
        false;

    try {

        await command.execute(
            "   ",
            "1.0.0"
        );

    } catch (error) {

        emptyIdThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            message !==
            "Package template ID is required."
        ) {

            throw new Error(
                `Unexpected empty package-ID error: ${message}`
            );

        }

    }

    if (!emptyIdThrown) {

        throw new Error(
            "An empty package uninstall template ID was accepted."
        );

    }

    /*
     * Empty version.
     */
    let emptyVersionThrown =
        false;

    try {

        await command.execute(
            "uninstall-command-test",
            "   "
        );

    } catch (error) {

        emptyVersionThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            message !==
            "Package version is required."
        ) {

            throw new Error(
                `Unexpected empty package-version error: ${message}`
            );

        }

    }

    if (!emptyVersionThrown) {

        throw new Error(
            "An empty package uninstall version was accepted."
        );

    }

    console.log(
        "Package uninstall command validation verified."
    );

    console.log(
        "Package uninstall command test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Package uninstall command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);