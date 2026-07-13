import { promises as fs } from "fs";
import path from "path";

import {
    TemplateProfileDiscoveryService
} from "../lib/services";

async function main(): Promise<void> {

    const service =
        new TemplateProfileDiscoveryService();

    const profiles =
        await service.discover();

    console.log(
        "Discovered profiles:"
    );

    console.log(
        JSON.stringify(
            profiles,
            null,
            2
        )
    );

    const projectGenesisProfile =
        profiles.find(
            (profile) =>
                profile.id ===
                "project-genesis-default"
        );

    if (!projectGenesisProfile) {

        throw new Error(
            "The Project Genesis default profile was not discovered."
        );

    }

    if (
        projectGenesisProfile
            .baseTemplate !==
        "project-genesis"
    ) {

        throw new Error(
            "The discovered profile base template was incorrect."
        );

    }

    if (
        projectGenesisProfile
            .featureTemplates
            .length !==
        0
    ) {

        throw new Error(
            "The default profile unexpectedly contained feature templates."
        );

    }

    if (
        projectGenesisProfile
            .category !==
        "Project Scaffolding"
    ) {

        throw new Error(
            "The discovered profile category was incorrect."
        );

    }

    const profilePath =
        path.join(
            process.cwd(),
            "profiles",
            "project-genesis-default.json"
        );

    await fs.access(
        profilePath
    );

    console.log(
        "Template profile discovery test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template profile discovery test failed.",
            error
        );

        process.exitCode = 1;

    }
);