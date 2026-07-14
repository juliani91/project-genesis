import {
    execFile
} from "child_process";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    TemplatePackageBuildRequest,
    TemplatePackageBuildResult
} from "../models";

import {
    TemplatePackageValidationService
} from "./TemplatePackageValidationService";

import {
    TemplatePackageHashService
} from "./TemplatePackageHashService";

export class TemplatePackageBuilder {

public constructor(
    private readonly validationService:
        TemplatePackageValidationService =
        new TemplatePackageValidationService(),

    private readonly hashService:
        TemplatePackageHashService =
        new TemplatePackageHashService()
) {}

    public async build(
        request:
            TemplatePackageBuildRequest
    ): Promise<TemplatePackageBuildResult> {

        const validation =
            await this.validationService.validate(
                request
            );

        const templatePath =
            validation.templatePath;

        const packagePath =
            path.resolve(
                request.packagePath
            );

        const packageDirectory =
            path.dirname(
                packagePath
            );

        const archiveName =
            path.basename(
                packagePath
            );

        if (
            path.extname(
                archiveName
            ).toLowerCase() !==
            ".zip"
        ) {

            throw new Error(
                [
                    "Template package path must use the .zip extension:",
                    packagePath
                ].join(" ")
            );

        }

        if (
            !request.overwrite &&
            await this.pathExists(
                packagePath
            )
        ) {

            throw new Error(
                [
                    "Template package already exists:",
                    packagePath
                ].join(" ")
            );

        }

        await fs.mkdir(
            packageDirectory,
            {
                recursive: true
            }
        );

        const temporaryPath =
            path.join(
                packageDirectory,
                [
                    path.basename(
                        packagePath,
                        ".zip"
                    ),
                    Date.now(),
                    "tmp.zip"
                ].join(".")
            );

        try {

            await this.createZip(
                templatePath,
                temporaryPath
            );

            const temporaryStat =
                await fs.stat(
                    temporaryPath
                );

            if (
                !temporaryStat.isFile() ||
                temporaryStat.size ===
                    0
            ) {

                throw new Error(
                    "The generated template package was empty."
                );

            }

            if (
                request.overwrite
            ) {

                await fs.rm(
                    packagePath,
                    {
                        force: true
                    }
                );

            }

            await fs.rename(
                temporaryPath,
                packagePath
            );

        } catch (error) {

            await fs.rm(
                temporaryPath,
                {
                    force: true
                }
            );

            throw new Error(
                [
                    `Unable to build template package`,
                    `"${validation.manifest.id}"`,
                    `version "${validation.manifest.version}".`,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        const packageStat =
            await fs.stat(
                packagePath
            );

        return {
            templatePath,

            packagePath,

            metadata: {
                templateId:
                    validation.manifest.id,

                version:
                    validation.manifest.version,

                archiveName:
                    path.basename(
                        packagePath
                    ),

                archiveFormat:
                    "zip",

                sizeBytes:
                    packageStat.size,

                /*
                 * SHA-256 is generated in Step 5.
                 * This temporary value keeps the build-result
                 * contract intact until the hashing service is added.
                 */
                sha256:
                await this.hashService.calculateSha256(
                    packagePath
                ),

                createdAt:
                    new Date()
            }
        };

    }

private async createZip(
    templatePath:
        string,

    archivePath:
        string
): Promise<void> {

    if (
        process.platform !==
        "win32"
    ) {

        throw new Error(
            "The current ZIP package builder supports Windows only."
        );

    }

    const escapedTemplatePath =
        templatePath.replace(
            /'/g,
            "''"
        );

    const escapedArchivePath =
        archivePath.replace(
            /'/g,
            "''"
        );

    /*
     * Get-ChildItem passes the contents of the template
     * directory to Compress-Archive without wrapping them
     * inside an additional parent directory.
     */
    const command = [
        `$items = Get-ChildItem -LiteralPath '${escapedTemplatePath}' -Force`,
        `Compress-Archive -Path $items.FullName -DestinationPath '${escapedArchivePath}' -Force`
    ].join("; ");

    await new Promise<void>(
        (
            resolve,
            reject
        ) => {

            execFile(
                "powershell.exe",
                [
                    "-NoProfile",
                    "-NonInteractive",
                    "-Command",
                    command
                ],
                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (error) {

                        reject(
                            new Error(
                                [
                                    "PowerShell failed to create the ZIP archive.",
                                    stderr.trim() ||
                                        stdout.trim() ||
                                        error.message
                                ].join(" ")
                            )
                        );

                        return;

                    }

                    resolve();

                }
            );

        }
    );

}

    private async pathExists(
        targetPath:
            string
    ): Promise<boolean> {

        try {

            await fs.access(
                targetPath
            );

            return true;

        } catch {

            return false;

        }

    }

}