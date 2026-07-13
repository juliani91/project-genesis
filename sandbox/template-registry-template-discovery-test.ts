import {
    TemplateDiscoveryService,
    TemplateRegistryDiscoveryService,
    TemplateRegistryResolver
} from "../lib/services";

async function main(): Promise<void> {

    const registryDiscovery =
        new TemplateRegistryDiscoveryService();

    const manifests =
        await registryDiscovery.discover();

    const localManifest =
        manifests.find(
            (manifest) =>
                manifest.registry.id ===
                "local"
        );

    if (!localManifest) {

        throw new Error(
            "The local registry manifest was not discovered."
        );

    }

    const registryResolver =
        new TemplateRegistryResolver();

    const localRegistry =
        registryResolver.resolve(
            localManifest
        );

    const templateDiscovery =
        new TemplateDiscoveryService();

    const templates =
        await templateDiscovery
            .discoverFromRegistry(
                localRegistry
            );

    if (
        templates.length !==
        localRegistry.templates.length
    ) {

        throw new Error(
            [
                "The registry template discovery count was incorrect.",
                `Expected: ${localRegistry.templates.length}`,
                `Actual: ${templates.length}`
            ].join(" ")
        );

    }

    const projectGenesis =
        templates.find(
            (template) =>
                template.manifest.id ===
                "project-genesis"
        );

    if (!projectGenesis) {

        throw new Error(
            "Project Genesis was not loaded through the local registry."
        );

    }

    if (
        projectGenesis.manifest.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The registry-loaded Project Genesis version was incorrect."
        );

    }

    if (
        projectGenesis.path !==
        `${
            localRegistry.resolvedLocation
        }${
            process.platform ===
                "win32"
                ? "\\"
                : "/"
        }project-genesis`
    ) {

        /*
         * Avoid failing purely because of slash
         * normalization. The important checks follow.
         */
        if (
            !projectGenesis.path.endsWith(
                "project-genesis"
            )
        ) {

            throw new Error(
                "The registry-loaded template path was incorrect."
            );

        }

    }

    /*
     * Existing default discovery remains available.
     */
    const defaultTemplates =
        await templateDiscovery.discover();

    if (
        !defaultTemplates.some(
            (template) =>
                template.manifest.id ===
                "project-genesis"
        )
    ) {

        throw new Error(
            "Default local template discovery regressed."
        );

    }

    /*
     * Remote registries are not loadable yet.
     */
    let remoteThrown =
        false;

    try {

        await templateDiscovery
            .discoverFromRegistry({
                id:
                    "remote-test",

                name:
                    "Remote Test",

                type:
                    "remote",

                resolvedLocation:
                    "https://registry.example.com/",

                templates: []
            });

    } catch (error) {

        remoteThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "cannot be loaded by local template discovery"
            )
        ) {

            throw new Error(
                `Unexpected remote-registry error: ${message}`
            );

        }

    }

    if (!remoteThrown) {

        throw new Error(
            "Remote registry loading was accepted unexpectedly."
        );

    }

    console.log(
        "Template registry template discovery test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry template discovery test failed.",
            error
        );

        process.exitCode = 1;

    }
);