import { promises as fs } from "fs";
import path from "path";

import {
    TemplateManifest,
    TemplatePackageBuildRequest
} from "../models";

export interface TemplatePackageValidationResult {

    templatePath: string;

    manifest: TemplateManifest;

}

export class TemplatePackageValidationService {

    public async validate(
        request: TemplatePackageBuildRequest
    ): Promise<TemplatePackageValidationResult> {

        const templatePath =
            path.resolve(
                request.templatePath
            );

        const stat =
            await this.requireDirectory(
                templatePath
            );

        if (
            !stat.isDirectory()
        ) {

            throw new Error(
                `Template path is not a directory: ${templatePath}`
            );

        }

        const requiredFiles = [
            "genesis.json",
            "wizard.json",
            "files.json"
        ];

        for (
            const filename
            of requiredFiles
        ) {

            await this.requireFile(
                path.join(
                    templatePath,
                    filename
                )
            );

        }

        const manifestPath =
            path.join(
                templatePath,
                "genesis.json"
            );

        const manifest =
            await this.readManifest(
                manifestPath
            );

        this.validateManifest(
            manifest,
            manifestPath
        );

        return {

            templatePath,

            manifest

        };

    }

    private async requireDirectory(
        directoryPath: string
    ) {

        try {

            return await fs.stat(
                directoryPath
            );

        } catch {

            throw new Error(
                `Template directory does not exist: ${directoryPath}`
            );

        }

    }

    private async requireFile(
        filePath: string
    ): Promise<void> {

        try {

            const stat =
                await fs.stat(
                    filePath
                );

            if (
                !stat.isFile()
            ) {

                throw new Error();

            }

        } catch {

            throw new Error(
                `Required template file is missing: ${filePath}`
            );

        }

    }

    private async readManifest(
        manifestPath: string
    ): Promise<TemplateManifest> {

        let contents: string;

        try {

            contents =
                await fs.readFile(
                    manifestPath,
                    "utf-8"
                );

        } catch {

            throw new Error(
                `Unable to read template manifest: ${manifestPath}`
            );

        }

        try {

            return JSON.parse(
                contents
            ) as TemplateManifest;

        } catch {

            throw new Error(
                `Template manifest contains invalid JSON: ${manifestPath}`
            );

        }

    }

    private validateManifest(
        manifest: TemplateManifest,
        manifestPath: string
    ): void {

        const requiredFields = [

            "id",
            "name",
            "version",
            "description",
            "author"

        ] as const;

        for (
            const field
            of requiredFields
        ) {

            const value =
                manifest[field];

            if (
                typeof value !==
                    "string" ||
                !value.trim()
            ) {

                throw new Error(
                    [
                        "Template manifest is missing required field",
                        `"${field}"`,
                        `(${manifestPath})`
                    ].join(" ")
                );

            }

        }

    }

}