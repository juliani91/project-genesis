import {
    promises as fs,
    Dirent
} from "fs";

import path from "path";

import {
    TemplateProfile
} from "../models";

export class TemplateProfileDiscoveryService {

    public async discover():
        Promise<TemplateProfile[]> {

        const profilesDirectory =
            path.join(
                process.cwd(),
                "profiles"
            );

        let entries:
            Dirent<string>[];

        try {

            entries =
                await fs.readdir(
                    profilesDirectory,
                    {
                        withFileTypes: true,
                        encoding: "utf-8"
                    }
                );

        } catch (error) {

            if (
                error instanceof Error &&
                "code" in error &&
                error.code ===
                    "ENOENT"
            ) {

                return [];

            }

            throw error;

        }

        const profiles:
            TemplateProfile[] = [];

        for (const entry of entries) {

            if (
                !entry.isFile() ||
                path.extname(
                    entry.name
                ).toLowerCase() !==
                    ".json"
            ) {
                continue;
            }

            const profilePath =
                path.join(
                    profilesDirectory,
                    entry.name
                );

            try {

                const contents =
                    await fs.readFile(
                        profilePath,
                        "utf-8"
                    );

                const profile:
                    TemplateProfile =
                    JSON.parse(
                        contents
                    );

                profiles.push(
                    profile
                );

            } catch (error) {

                console.warn(
                    [
                        `Skipping profile "${entry.name}"`,
                        "because it could not be loaded."
                    ].join(" "),
                    error
                );

            }

        }

        return profiles;

    }

}