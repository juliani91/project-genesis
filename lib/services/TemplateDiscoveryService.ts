import { promises as fs } from "fs";
import path from "path";

import { TemplateManifest } from "../models";
import { TemplatePackage } from "../models";

export class TemplateDiscoveryService {

    async discover(): Promise<TemplatePackage[]> {
        const templatesDirectory = path.join(process.cwd(), "templates");

        const entries = await fs.readdir(templatesDirectory, {
            withFileTypes: true,
        });

        const templates: TemplatePackage[] = [];

        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }

            const manifestPath = path.join(
                templatesDirectory,
                entry.name,
                "genesis.json"
            );

            try {
                const contents = await fs.readFile(manifestPath, "utf-8");

                const manifest: TemplateManifest = JSON.parse(contents);

                templates.push({
                manifest,
                path: path.join(templatesDirectory, entry.name),
                descriptors: {}
            });
            } catch(error) {
                // Ignore folders without a valid genesis.json
                    console.warn(
            `Skipping template "${entry.name}" because its manifest could not be loaded.`,
            error
        );
            }
        }

        return templates;
    }
}