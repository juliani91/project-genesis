import { promises as fs } from "fs";
import path from "path";

import {
    TemplateRegistryManifest
} from "../lib/models";

async function main(): Promise<void> {

    const manifestPath =
        path.join(
            process.cwd(),
            "registries",
            "local.json"
        );

    const contents =
        await fs.readFile(
            manifestPath,
            "utf-8"
        );

    const manifest:
        TemplateRegistryManifest =
        JSON.parse(
            contents
        );

    if (
        manifest.registry.id !==
        "local"
    ) {

        throw new Error(
            "The local registry ID was incorrect."
        );

    }

    if (
        manifest.registry.type !==
        "local"
    ) {

        throw new Error(
            "The local registry type was incorrect."
        );

    }

    if (
        manifest.registry.location !==
        "templates"
    ) {

        throw new Error(
            "The local registry location was incorrect."
        );

    }

    if (
        manifest.templates.length !==
        1
    ) {

        throw new Error(
            [
                "The local registry template count was incorrect.",
                `Actual: ${manifest.templates.length}`
            ].join(" ")
        );

    }

    const projectGenesis =
        manifest.templates.find(
            (template) =>
                template.templateId ===
                "project-genesis"
        );

    if (!projectGenesis) {

        throw new Error(
            "The Project Genesis registry entry was not found."
        );

    }

    if (
        projectGenesis.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The Project Genesis registry version was incorrect."
        );

    }

    if (
        projectGenesis.name !==
        "Project Genesis"
    ) {

        throw new Error(
            "The Project Genesis registry name was incorrect."
        );

    }

    console.log(
        "Registry manifest:"
    );

    console.log(
        JSON.stringify(
            manifest,
            null,
            2
        )
    );

    console.log(
        "Template registry manifest test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template registry manifest test failed.",
            error
        );

        process.exitCode = 1;

    }
);