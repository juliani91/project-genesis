import { promises as fs } from "fs";

import { GeneratedFolder } from "../models";

export class FolderGenerator {

    public async generate(
        folders: readonly GeneratedFolder[]
    ): Promise<void> {

        for (const folder of folders) {

            await fs.mkdir(folder.path, {
                recursive: true
            });

        }

    }

}