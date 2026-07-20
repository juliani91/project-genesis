import { promises as fs } from "fs";

import {
    PackageInstallDescriptor
} from "../models";

export async function loadPackageInstall(
    packageInstallPath:
        string
): Promise<PackageInstallDescriptor | undefined> {

    let contents:
        string;

    try {

        contents =
            await fs.readFile(
                packageInstallPath,
                "utf-8"
            );

    } catch (error) {

        if (
            error instanceof Error &&
            "code" in error &&
            error.code ===
                "ENOENT"
        ) {

            return undefined;

        }

        throw error;

    }

    return JSON.parse(
        contents
    ) as PackageInstallDescriptor;

}
