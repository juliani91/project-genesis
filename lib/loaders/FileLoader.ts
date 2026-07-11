import { promises as fs } from "fs";

import { FileDescriptor } from "../models";

export async function loadFiles(
    filesPath: string
): Promise<FileDescriptor[]> {

    const contents = await fs.readFile(
        filesPath,
        "utf-8"
    );

    return JSON.parse(contents) as FileDescriptor[];

}