import {
    RegistryTemplate,
    RegistryType,
    TemplateRegistry
} from "../lib/models";

function main(): void {

    const localType:
        RegistryType =
            "local";

    const remoteType:
        RegistryType =
            "remote";

    const registryTypes =
        new Set<RegistryType>([
            localType,
            remoteType
        ]);

    if (
        registryTypes.size !==
        2
    ) {

        throw new Error(
            "Registry types were not distinct."
        );

    }

    const localRegistry:
        TemplateRegistry = {

        id:
            "official-local",

        name:
            "Official Local",

        type:
            "local",

        location:
            "C:/Templates"
    };

    if (
        localRegistry.location !==
        "C:/Templates"
    ) {

        throw new Error(
            "Local registry location was not preserved."
        );

    }

    const remoteRegistry:
        TemplateRegistry = {

        id:
            "official-remote",

        name:
            "Official Remote",

        type:
            "remote",

        location:
            "https://registry.projectgenesis.dev"
    };

    if (
        !remoteRegistry.location.startsWith(
            "https://"
        )
    ) {

        throw new Error(
            "Remote registry location was not preserved."
        );

    }

    const template:
        RegistryTemplate = {

        templateId:
            "nextjs",

        version:
            "3.2.0",

        name:
            "Next.js"
    };

    if (
        template.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "Registry template identifier was incorrect."
        );

    }

    if (
        template.version !==
        "3.2.0"
    ) {

        throw new Error(
            "Registry template version was incorrect."
        );

    }

    console.log(
        "Template registry models test completed successfully."
    );

}

main();
