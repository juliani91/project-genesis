import {
    promises as fs
} from "fs";

import path from "path";

import {
    PackageCommandDispatcher,
    PackagePublishCommand
} from "../lib/commands";

import {
    PackageCommandFormatter,
    RegistryPublishManifestStore,
    TemplatePublishingPipeline
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "package-publish-cli-integration-test"
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

    await fs.mkdir(
        root,
        {
            recursive:
                true
        }
    );

    const packageDirectory =
        path.join(
            root,
            "packages"
        );

    await fs.mkdir(
        packageDirectory,
        {
            recursive:
                true
        }
    );

    const packagePath =
        path.join(
            packageDirectory,
            "nextjs-5.0.0.zip"
        );

    await fs.writeFile(
        packagePath,
        Buffer.from(
            "Project Genesis CLI publishing integration test.",
            "utf-8"
        )
    );

    const manifestPath =
        path.join(
            root,
            "registry",
            "publish-manifest.json"
        );

    const output:
        string[] = [];

    const publishCommand =
        new PackagePublishCommand(
            new TemplatePublishingPipeline(),

            (
                registryId,
                requestedManifestPath
            ) =>
                new RegistryPublishManifestStore(
                    registryId,
                    requestedManifestPath
                )
        );

    /*
     * Existing constructor parameter positions are preserved.
     *
     * The publish command is the tenth parameter because the
     * output writer remains in its original ninth position.
     */
    const dispatcher =
        new PackageCommandDispatcher(
            undefined,
            undefined,
            new PackageCommandFormatter(),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            (
                value:
                    string
            ) => {

                output.push(
                    value
                );

            },
            publishCommand
        );

    const handled =
        await dispatcher.execute([
            "publish",
            "nextjs",
            "--version",
            "5.0.0",
            "--package",
            packagePath,
            "--registry",
            "official",
            "--manifest",
            manifestPath
        ]);

    if (!handled) {

        throw new Error(
            "The dispatcher did not recognize the publish command."
        );

    }

    if (
        output.length !==
        1
    ) {

        throw new Error(
            [
                "The publish command produced the wrong number of outputs.",
                `Expected: 1`,
                `Actual: ${output.length}`
            ].join(" ")
        );

    }

    const formattedOutput =
        output[0];

    if (!formattedOutput) {

        throw new Error(
            "The publish command did not produce formatted output."
        );

    }

    if (
        !formattedOutput.includes(
            "Package published successfully."
        )
    ) {

        throw new Error(
            "The formatter did not report a successful publish."
        );

    }

    if (
        !formattedOutput.includes(
            "Template : nextjs"
        )
    ) {

        throw new Error(
            "The formatted output did not include the template ID."
        );

    }

    if (
        !formattedOutput.includes(
            "Version  : 5.0.0"
        )
    ) {

        throw new Error(
            "The formatted output did not include the version."
        );

    }

    if (
        !formattedOutput.includes(
            "Registry : official"
        )
    ) {

        throw new Error(
            "The formatted output did not include the registry ID."
        );

    }

    if (
        !formattedOutput.includes(
            "SHA-256"
        )
    ) {

        throw new Error(
            "The formatted output did not include the package SHA-256."
        );

    }

    await fs.access(
        manifestPath
    );

    const store =
        new RegistryPublishManifestStore(
            "official",
            manifestPath
        );

    const manifest =
        await store.read();

    if (
        manifest.packages.length !==
        1
    ) {

        throw new Error(
            "The CLI publish command did not persist one package."
        );

    }

    const publishedEntry =
        manifest.packages[0];

    if (!publishedEntry) {

        throw new Error(
            "The persisted publish entry could not be found."
        );

    }

    if (
        publishedEntry.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "The CLI persisted the wrong template ID."
        );

    }

    if (
        publishedEntry.version !==
        "5.0.0"
    ) {

        throw new Error(
            "The CLI persisted the wrong package version."
        );

    }

    /*
     * Verify that an unrelated command remains unhandled.
     */
    const unrelatedHandled =
        await dispatcher.execute([
            "generate"
        ]);

    if (unrelatedHandled) {

        throw new Error(
            "The package dispatcher incorrectly handled an unrelated command."
        );

    }

    /*
     * Verify required publish arguments.
     */
    let missingVersionThrown =
        false;

    try {

        await dispatcher.execute([
            "publish",
            "nextjs",
            "--package",
            packagePath,
            "--registry",
            "official"
        ]);

    } catch (error) {

        missingVersionThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Usage:"
            )
        ) {

            throw new Error(
                `Unexpected missing-version error: ${message}`
            );

        }

    }

    if (!missingVersionThrown) {

        throw new Error(
            "The dispatcher accepted a publish command without a version."
        );

    }

    let unknownArgumentThrown =
        false;

    try {

        await dispatcher.execute([
            "publish",
            "nextjs",
            "--version",
            "5.0.0",
            "--package",
            packagePath,
            "--registry",
            "official",
            "--unknown",
            "value"
        ]);

    } catch (error) {

        unknownArgumentThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Unknown publish command argument"
            )
        ) {

            throw new Error(
                `Unexpected unknown-argument error: ${message}`
            );

        }

    }

    if (!unknownArgumentThrown) {

        throw new Error(
            "The dispatcher accepted an unknown publish argument."
        );

    }

    console.log(
        "Publish command dispatcher recognition verified."
    );

    console.log(
        "Publish command argument parsing verified."
    );

    console.log(
        "Publish command formatter integration verified."
    );

    console.log(
        "Publish command manifest persistence verified."
    );

    console.log(
        "Existing dispatcher fallback behavior verified."
    );

    console.log(
        "Package publish CLI integration test completed successfully."
    );

}

main().catch(
    (
        error:
            unknown
    ) => {

        console.error(
            "Package publish CLI integration test failed.",
            error
        );

        process.exitCode =
            1;

    }
);