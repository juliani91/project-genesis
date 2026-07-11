import { promises as fs } from "fs";

import {
    FileDescriptor,
    RenderedContent,
    VariableCollection
} from "../models";

export class TemplateRenderer {

    public async render(
        sourcePath: string,
        descriptor: FileDescriptor,
        variables: VariableCollection
    ): Promise<RenderedContent> {

        if (descriptor.mode === "render") {

            const sourceContents =
                await fs.readFile(
                    sourcePath,
                    "utf-8"
                );

            const contents =
                variables.resolve(
                    sourceContents
                );

            const unresolvedVariables =
                this.findUnresolvedVariables(
                    contents
                );

            if (unresolvedVariables.length > 0) {

                throw new Error(
                    [
                        `Unresolved template variables in "${descriptor.source}":`,
                        unresolvedVariables.join(", ")
                    ].join(" ")
                );

            }

            return {
                contents,
                unresolvedVariables
            };

        }

        if (descriptor.mode === "copy") {

            const contents =
                await fs.readFile(sourcePath);

            return {
                contents,
                unresolvedVariables: []
            };

        }

        throw new Error(
            `Unsupported file rendering mode: ${String(descriptor.mode)}`
        );

    }

    private findUnresolvedVariables(
        contents: string
    ): string[] {

        const matches =
            contents.matchAll(
                /\{\{([A-Z0-9_]+)\}\}/g
            );

        const variables =
            Array.from(
                matches,
                (match) => match[1]
            );

        return Array.from(
            new Set(variables)
        );

    }

}