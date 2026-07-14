import {
    InstalledTemplateCollection,
    InstalledTemplatePackage,
    SerializedInstalledTemplateCollection,
    SerializedInstalledTemplatePackage
} from "../lib/models";

function main(): void {

    const installedAt =
        new Date(
            "2026-07-15T09:00:00.000Z"
        );

    const installed:
        InstalledTemplatePackage = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        installPath:
            "C:/Genesis/Templates/nextjs",

        sha256:
            "a".repeat(
                64
            ),

        source:
            "https://registry.example.com",

        installedAt
    };

    if (
        installed.templateId !==
        "nextjs"
    ) {

        throw new Error(
            "Installed template ID was incorrect."
        );

    }

    if (
        !(installed.installedAt instanceof Date)
    ) {

        throw new Error(
            "Installation timestamp was not a Date."
        );

    }

    const serialized:
        SerializedInstalledTemplatePackage = {

        templateId:
            installed.templateId,

        version:
            installed.version,

        installPath:
            installed.installPath,

        sha256:
            installed.sha256,

        source:
            installed.source,

        installedAt:
            installed.installedAt.toISOString()
    };

    if (
        serialized.installedAt !==
        "2026-07-15T09:00:00.000Z"
    ) {

        throw new Error(
            "Serialized installation timestamp was incorrect."
        );

    }

    const collection:
        InstalledTemplateCollection = {

        packages: [
            installed
        ]
    };

    if (
        collection.packages.length !==
        1
    ) {

        throw new Error(
            "Installed template collection size was incorrect."
        );

    }

    const serializedCollection:
        SerializedInstalledTemplateCollection = {

        packages: [
            serialized
        ]
    };

    if (
        serializedCollection.packages.length !==
        1
    ) {

        throw new Error(
            "Serialized installed template collection size was incorrect."
        );

    }

    console.log(
        "Installed template package models test completed successfully."
    );

}

main();