import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { GenerationPlan } from "../models";

export class FolderGenerator {

    public async generate(
        generationPlan: GenerationPlan
    ): Promise<void> {

        for (const folder of generationPlan.folders) {

            const folderPath = join(
                generationPlan.outputPath,
                folder.relativePath
            );

            await mkdir(folderPath, {
                recursive: true
            });

        }

    }

}