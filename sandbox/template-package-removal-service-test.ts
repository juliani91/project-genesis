import {
    promises as fs
} from "fs";

import path from "path";

import {
    InstalledTemplatePackage
} from "../lib/models";

import {
    InstalledTemplatePackageStore,
    TemplatePackageRemovalService
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
                    "Removal Test",

                version,

                description:
                    "Template package removal service test.",

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
            "template-package-removal-service-test"
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

    const versionOnePath =
        removalService.getInstallPath(
            "removal-test",
            "1.0.0"
        );

    const versionTwoPath =
        removalService.getInstallPath(
            "removal-test",
            "2.0.0"
        );

    await createInstalledTemplate(
        versionOnePath,
        "removal-test",
        "1.0.0"
    );

    await createInstalledTemplate(
        versionTwoPath,
        "removal-test",
        "2.0.0"
    );

    const installedPackages:
        InstalledTemplatePackage[] = [
        {
            templateId:
                "removal-test",

            version:
                "1.0.0",

            installPath:
                versionOnePath,

            sha256:
                "a".repeat(
                    64
                ),

            source:
                "https://registry.example.com",

            installedAt:
                new Date(
                    "2026-07-15T15:00:00.000Z"
                )
        },
        {
            templateId:
                "removal-test",

            version:
                "2.0.0",

            installPath:
                versionTwoPath,

            sha256:
                "b".repeat(
                    64
                ),

            source:
                "https://registry.example.com",

            installedAt:
                new Date(
                    "2026-07-15T16:00:00.000Z"
                )
        }
    ];

    for (
        const installedPackage
        of installedPackages
    ) {

        await store.install(
            installedPackage
        );

    }

    /*
     * Remove one installed version.
     */
    const removed =
        await removalService.remove(
            " REMOVAL-TEST ",
            "1.0.0"
        );

    if (!removed) {

        throw new Error(
            "The installed package was not removed."
        );

    }

    if (
        removed.templateId !==
        "removal-test"
    ) {

        throw new Error(
            "The removed template ID was incorrect."
        );

    }

    if (
        removed.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The removed template version was incorrect."
        );

    }

    if (
        await pathExists(
            versionOnePath
        )
    ) {

        throw new Error(
            "The removed template directory still exists."
        );

    }

    if (
        !await pathExists(
            versionTwoPath
        )
    ) {

        throw new Error(
            "Removing one version deleted another installed version."
        );

    }

    const afterFirstRemoval =
        await store.findById(
            "removal-test"
        );

    if (
        afterFirstRemoval.length !==
            1 ||
        afterFirstRemoval[0]
            ?.version !==
            "2.0.0"
    ) {

        throw new Error(
            "The installed-package store retained the wrong version."
        );

    }

    /*
     * Removing a package that is not installed returns
     * undefined and does not modify the remaining package.
     */
    const missing =
        await removalService.remove(
            "removal-test",
            "9.9.9"
        );

    if (
        missing !==
        undefined
    ) {

        throw new Error(
            "Removing a missing package returned an installed record."
        );

    }

    if (
        !await pathExists(
            versionTwoPath
        )
    ) {

        throw new Error(
            "Removing a missing package affected an installed version."
        );

    }

    /*
     * Remove the final version. Its now-empty template
     * parent directory should also be removed.
     */
    const removedFinal =
        await removalService.remove(
            "removal-test",
            "2.0.0"
        );

    if (!removedFinal) {

        throw new Error(
            "The final installed version was not removed."
        );

    }

    if (
        await pathExists(
            versionTwoPath
        )
    ) {

        throw new Error(
            "The final template version directory still exists."
        );

    }

    const templateParentPath =
        path.dirname(
            versionTwoPath
        );

    if (
        await pathExists(
            templateParentPath
        )
    ) {

        throw new Error(
            "The empty template parent directory was not removed."
        );

    }

    const emptyStore =
        await store.findById(
            "removal-test"
        );

    if (
        emptyStore.length !==
        0
    ) {

        throw new Error(
            "Installed-package records remained after both versions were removed."
        );

    }

    /*
     * A mismatched stored path must be rejected before
     * any filesystem deletion occurs.
     */
    const outsidePath =
        path.join(
            root,
            "outside",
            "protected"
        );

    await fs.mkdir(
        outsidePath,
        {
            recursive:
                true
        }
    );

    await fs.writeFile(
        path.join(
            outsidePath,
            "important.txt"
        ),
        "do not delete",
        "utf-8"
    );

    await store.install({
        templateId:
            "unsafe-template",

        version:
            "1.0.0",

        installPath:
            outsidePath,

        sha256:
            "c".repeat(
                64
            ),

        source:
            "https://registry.example.com",

        installedAt:
            new Date(
                "2026-07-15T17:00:00.000Z"
            )
    });

    let unsafePathThrown =
        false;

    try {

        await removalService.remove(
            "unsafe-template",
            "1.0.0"
        );

    } catch (error) {

        unsafePathThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "does not match the configured installation directory"
            )
        ) {

            throw new Error(
                `Unexpected unsafe-path error: ${message}`
            );

        }

    }

    if (!unsafePathThrown) {

        throw new Error(
            "An installed package with an unsafe path was removed."
        );

    }

    if (
        !await pathExists(
            path.join(
                outsidePath,
                "important.txt"
            )
        )
    ) {

        throw new Error(
            "The removal service deleted data outside the installation directory."
        );

    }

    const unsafeRecords =
        await store.findById(
            "unsafe-template"
        );

    if (
        unsafeRecords.length !==
        1
    ) {

        throw new Error(
            "The unsafe installed-package record was removed unexpectedly."
        );

    }

    /*
     * Unsafe input path segments are rejected.
     */
    let unsafeIdThrown =
        false;

    try {

        removalService.getInstallPath(
            "../outside",
            "1.0.0"
        );

    } catch {

        unsafeIdThrown =
            true;

    }

    if (!unsafeIdThrown) {

        throw new Error(
            "An unsafe removal template ID was accepted."
        );

    }

    console.log(
        "Installed directory removal verified."
    );

    console.log(
        "Installed-package record removal verified."
    );

    console.log(
        "Multi-version isolation verified."
    );

    console.log(
        "Missing-package behavior verified."
    );

    console.log(
        "Removal path safety verified."
    );

    console.log(
        "Template package removal service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package removal service test failed.",
            error
        );

        process.exitCode =
            1;

    }
);