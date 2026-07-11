import { promises as fs } from "fs";

import { FolderDescriptor } from "../models";

export async function loadFolders(
    foldersPath: string
): Promise<FolderDescriptor[]> {

    const contents = await fs.readFile(
        foldersPath,
        "utf-8"
    );

    return JSON.parse(contents) as FolderDescriptor[];

}