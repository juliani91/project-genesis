import path from "path";

import {
    TemplatePackagePublishOutcome,
    TemplatePackagePublishRequest,
    TemplatePackagePublishResult
} from "../models";

import {
    TemplatePackageBuilder
} from "./TemplatePackageBuilder";

export class TemplatePackagePublisher {

    public constructor(
        private readonly builder:
            TemplatePackageBuilder =
                new TemplatePackageBuilder()
    ) {}

    public async publish(
        request:
            TemplatePackagePublishRequest
    ): Promise<TemplatePackagePublishOutcome> {

        const templatePath =
            path.resolve(
                request.templatePath
            );

        const packageName =
            await this.getPackageName(
                templatePath
            );

        const packagePath =
            path.join(
                request.outputDirectory,
                packageName
            );

        const existed =
            await this.pathExists(
                packagePath
            );

        const build =
            await this.builder.build({

                templatePath,

                packagePath,

                overwrite:
                    request.overwrite ??
                    false

            });

        const result:
            TemplatePackagePublishResult = {

            templateId:
                build.metadata.templateId,

            version:
                build.metadata.version,

            packagePath:
                build.packagePath,

            packageSizeBytes:
                build.metadata.sizeBytes,

            sha256:
                build.metadata.sha256,

            publishedAt:
                build.metadata.createdAt

        };

        return {

            status:
                existed
                    ? "existing"
                    : "published",

            result

        };

    }

    private async getPackageName(
        templatePath:
            string
    ): Promise<string> {

        const {
            promises: fs
        } =
            await import(
                "fs"
            );

        const manifestPath =
            path.join(
                templatePath,
                "genesis.json"
            );

        const manifest =
            JSON.parse(
                await fs.readFile(
                    manifestPath,
                    "utf-8"
                )
            ) as {

                id:
                    string;

                version:
                    string;

            };

        return `${manifest.id}-${manifest.version}.zip`;

    }

    private async pathExists(
        targetPath:
            string
    ): Promise<boolean> {

        try {

            const {
                promises: fs
            } =
                await import(
                    "fs"
                );

            await fs.access(
                targetPath
            );

            return true;

        } catch {

            return false;

        }

    }

}