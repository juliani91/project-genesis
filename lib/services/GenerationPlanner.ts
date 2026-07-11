import path from "path";

import {
    GeneratedFile,
    GeneratedFolder,
    GenerationPlan,
    PreparedTemplate
} from "../models";

import { TemplateRenderer } from "./TemplateRenderer";

export class GenerationPlanner {

    public async createPlan(
        preparedTemplate: PreparedTemplate,
        outputPath: string
    ): Promise<GenerationPlan> {

        const folders =
            this.createFolders(
                preparedTemplate,
                outputPath
            );

        const files =
            await this.createFiles(
                preparedTemplate,
                outputPath
            );

        return {
            outputPath,
            folders,
            files,
            createdAt: new Date()
        };

    }

    private createFolders(
        preparedTemplate: PreparedTemplate,
        outputPath: string
    ): GeneratedFolder[] {

        const folderDescriptors =
            preparedTemplate
                .template
                .descriptors
                .folders ?? [];

        return folderDescriptors.map(
            (descriptor) => {

                return {
                    path: path.join(
                        outputPath,
                        descriptor.path
                    ),

                    relativePath:
                        descriptor.path
                };

            }
        );

    }

    private async createFiles(
        preparedTemplate: PreparedTemplate,
        outputPath: string
    ): Promise<GeneratedFile[]> {

        const template =
            preparedTemplate.template;

        const fileDescriptors =
            template.descriptors.files ?? [];

        const renderer =
            new TemplateRenderer();

        const files: GeneratedFile[] = [];

        for (const descriptor of fileDescriptors) {

            const sourcePath = path.join(
                template.path,
                "files",
                descriptor.source
            );

            const destinationPath = path.join(
                outputPath,
                descriptor.destination
            );

            const renderedContent =
                await renderer.render(
                    sourcePath,
                    descriptor,
                    preparedTemplate.variables
                );

            files.push({
                sourcePath,
                destinationPath,

                relativePath:
                    descriptor.destination,

                contents:
                    renderedContent.contents
            });

        }

        return files;

    }

}