import {
    TemplateRegistryDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const service =
        new TemplateRegistryDiscoveryService();

    const manifests =
        await service.discover();

    console.log(
        "Discovered registries:"
    );

    console.log(
        JSON.stringify(
            manifests,
            null,
            2
        )
    );

    if (
        manifests.length === 0
    ) {

        throw new Error(
            "No registry manifests were discovered."
        );

    }

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

    if (
        localManifest.registry.type !==
        "local"
    ) {

        throw new Error(
            "The discovered local registry type was incorrect."
        );

    }

    if (
        localManifest.registry.location !==
        "templates"
    ) {

        throw new Error(
            "The discovered local registry location was incorrect."
        );

    }

    const projectGenesis =
        localManifest.templates.find(
            (template) =>
                template.templateId ===
                "project-genesis"
        );

    if (!projectGenesis) {

        throw new Error(
            "The Project Genesis registry entry was not discovered."
        );

    }

    if (
        projectGenesis.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The discovered Project Genesis registry version was incorrect."
        );

    }

    console.log(
        "Template registry discovery test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry discovery test failed.",
            error
        );

        process.exitCode = 1;

    }
);