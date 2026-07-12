import path from "path";

import {
    GeneratedFile,
    GeneratedFolder,
    GenerationPlan,
    GenerationRule,
    PreparedTemplate,
    ResolvedTemplateFile
} from "../models";

import {
    ConditionEvaluator
} from "./ConditionEvaluator";

import {
    TemplateRenderer
} from "./TemplateRenderer";

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

        return folderDescriptors
            .filter(
                (descriptor) =>
                    this.shouldInclude(
                        descriptor.rules,
                        preparedTemplate
                    )
            )
            .map(
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

        const resolvedFiles =
            this.getResolvedFiles(
                template
            );

        const renderer =
            new TemplateRenderer();

        const files:
            GeneratedFile[] = [];

        for (const resolvedFile of resolvedFiles) {

            const descriptor =
                resolvedFile.descriptor;

            if (
                !this.shouldInclude(
                    descriptor.rules,
                    preparedTemplate
                )
            ) {
                continue;
            }

            const sourcePath =
                path.join(
                    resolvedFile.templatePath,
                    "files",
                    descriptor.source
                );

            const destinationPath =
                path.join(
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

    private getResolvedFiles(
        template: PreparedTemplate["template"]
    ): readonly ResolvedTemplateFile[] {

        const inheritedFiles =
            template
                .descriptors
                .resolvedFiles;

        if (
            inheritedFiles &&
            inheritedFiles.length > 0
        ) {

            return inheritedFiles;

        }

        /*
         * Backward-compatible path for templates that
         * have not gone through inheritance resolution.
         */
        return (
            template.descriptors.files ??
            []
        ).map(
            (descriptor) => {

                return {
                    descriptor,
                    templatePath:
                        template.path
                };

            }
        );

    }

    private shouldInclude(
        rules:
            readonly GenerationRule[] |
            undefined,

        preparedTemplate:
            PreparedTemplate
    ): boolean {

        if (
            !rules ||
            rules.length === 0
        ) {
            return true;
        }

        const evaluator =
            new ConditionEvaluator();

        return rules.every(
            (rule) =>
                evaluator.evaluate(
                    rule,
                    preparedTemplate.variables
                )
        );

    }

}