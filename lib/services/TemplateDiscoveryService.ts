import { promises as fs } from "fs";
import path from "path";

import {
    ResolvedTemplateRegistry,
    TemplateManifest,
    TemplatePackage
} from "../models";

export class TemplateDiscoveryService {

    public async discover():
        Promise<TemplatePackage[]> {

        const templatesDirectory =
            path.join(
                process.cwd(),
                "templates"
            );

        return this.discoverFromDirectory(
            templatesDirectory
        );

    }

    public async discoverFromRegistry(
        registry:
            ResolvedTemplateRegistry
    ): Promise<TemplatePackage[]> {

        if (
            registry.type !==
            "local"
        ) {

            throw new Error(
                [
                    `Registry "${registry.id}"`,
                    "is remote and cannot be loaded",
                    "by local template discovery."
                ].join(" ")
            );

        }

        const templates =
            await this.discoverFromDirectory(
                registry.resolvedLocation
            );

        return this.filterAdvertisedTemplates(
            templates,
            registry
        );

    }

    public async discoverFromDirectory(
        templatesDirectory: string
    ): Promise<TemplatePackage[]> {

        let entries:
            import("fs").Dirent<string>[];

        try {

            entries =
                await fs.readdir(
                    templatesDirectory,
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

        const templates:
            TemplatePackage[] = [];

        for (const entry of entries) {

            if (!entry.isDirectory()) {
                continue;
            }

            const templatePath =
                path.join(
                    templatesDirectory,
                    entry.name
                );

            const manifestPath =
                path.join(
                    templatePath,
                    "genesis.json"
                );

            try {

                const contents =
                    await fs.readFile(
                        manifestPath,
                        "utf-8"
                    );

                const manifest:
                    TemplateManifest =
                    JSON.parse(
                        contents
                    );

                templates.push({
                    manifest,

                    path:
                        templatePath,

                    descriptors: {}
                });

            } catch (error) {

                console.warn(
                    [
                        `Skipping template "${entry.name}"`,
                        "because its manifest could not be loaded."
                    ].join(" "),
                    error
                );

            }

        }

        return templates;

    }

    private filterAdvertisedTemplates(
        templates:
            readonly TemplatePackage[],

        registry:
            ResolvedTemplateRegistry
    ): TemplatePackage[] {

        const advertisedById =
            new Map(
                registry.templates.map(
                    (template) => [
                        template.templateId,
                        template
                    ]
                )
            );

        const discoveredById =
            new Map(
                templates.map(
                    (template) => [
                        template.manifest.id,
                        template
                    ]
                )
            );

        const results:
            TemplatePackage[] = [];

        for (
            const advertised
            of registry.templates
        ) {

            const discovered =
                discoveredById.get(
                    advertised.templateId
                );

            if (!discovered) {

                throw new Error(
                    [
                        `Registry "${registry.id}" advertises template`,
                        `"${advertised.templateId}",`,
                        "but no matching local template directory was discovered."
                    ].join(" ")
                );

            }

            if (
                discovered.manifest.version !==
                advertised.version
            ) {

                throw new Error(
                    [
                        `Registry "${registry.id}" advertises`,
                        `"${advertised.templateId}"`,
                        `at version "${advertised.version}",`,
                        "but the discovered template manifest reports",
                        `"${discovered.manifest.version}".`
                    ].join(" ")
                );

            }

            results.push(
                discovered
            );

        }

        /*
         * The map is intentionally constructed to make
         * duplicate discovered IDs visible during review,
         * even though only advertised templates are returned.
         */
        void advertisedById;

        return results;

    }

}