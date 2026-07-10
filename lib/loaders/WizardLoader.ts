import { promises as fs } from "fs";

import { Wizard } from "../models";

export async function loadWizard(
    wizardPath: string
): Promise<Wizard> {

    const contents = await fs.readFile(
        wizardPath,
        "utf-8"
    );

    return JSON.parse(contents);
}