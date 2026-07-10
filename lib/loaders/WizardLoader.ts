import { promises as fs } from "fs";

import { Wizard } from "../models/Wizard";

export async function loadWizard(
    wizardPath: string
): Promise<Wizard> {

    const contents = await fs.readFile(
        wizardPath,
        "utf-8"
    );

    return JSON.parse(contents);
}