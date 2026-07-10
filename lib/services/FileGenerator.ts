import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { GenerationPlan } from "../models";

export class FileGenerator {

    public async generate(
        generationPlan: GenerationPlan
    ): Promise<void> {

        for (const file of generationPlan.files) {

            const filePath = join(
                generationPlan.outputPath,
                file.relativePath
            );

            await mkdir(dirname(filePath), {
                recursive: true
            });

            await writeFile(
                filePath,
                file.contents,
                "utf8"
            );

        }

    }

}