import { promises as fs } from "fs";
import path from "path";

import { GeneratedFile } from "../models";

export class FileGenerator {

    public async generate(
        files: readonly GeneratedFile[]
    ): Promise<void> {

        for (const file of files) {

            const parentDirectory =
                path.dirname(file.destinationPath);

            await fs.mkdir(parentDirectory, {
                recursive: true
            });

            await fs.writeFile(
                file.destinationPath,
                file.contents,
                "utf-8"
            );

        }

    }

}