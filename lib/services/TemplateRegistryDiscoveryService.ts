import {
    Dirent,
    promises as fs
} from "fs";

import path from "path";

import {
    TemplateRegistryManifest
} from "../models";

export class TemplateRegistryDiscoveryService {

    public async discover():
        Promise<TemplateRegistryManifest[]> {

        const registriesDirectory =
            path.join(
                process.cwd(),
                "registries"
            );

        let entries:
            Dirent<string>[];

        try {

            entries =
                await fs.readdir(
                    registriesDirectory,
                    {
                        withFileTypes:
                            true,

                        encoding:
                            "utf-8"
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

        const manifests:
            TemplateRegistryManifest[] = [];

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

            const manifestPath =
                path.join(
                    registriesDirectory,
                    entry.name
                );

            try {

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

                manifests.push(
                    manifest
                );

            } catch (error) {

                console.warn(
                    [
                        `Skipping registry "${entry.name}"`,
                        "because its manifest could not be loaded."
                    ].join(" "),
                    error
                );

            }

        }

        return manifests;

    }

}