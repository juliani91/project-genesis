import {
    FileDescriptor,
    ResolvedTemplateFile,
    TemplatePackage
} from "../models";

export class TemplateFileInheritanceService {

    public resolve(
        parent: TemplatePackage,
        child: TemplatePackage
    ): readonly ResolvedTemplateFile[] {

        return this.resolveChain([
            parent,
            child
        ]);

    }

    /**
     * Resolves templates ordered from root parent
     * through the final child.
     *
     * Existing resolvedFiles are preserved so composed
     * templates retain the source owner of each file.
     */
    public resolveChain(
        templates: readonly TemplatePackage[]
    ): readonly ResolvedTemplateFile[] {

        const resolved =
            new Map<
                string,
                ResolvedTemplateFile
            >();

        for (const template of templates) {

            const files =
                this.getTemplateFiles(
                    template
                );

            for (const file of files) {

                resolved.set(
                    this.getIdentity(
                        file.descriptor
                    ),
                    file
                );

            }

        }

        return [
            ...resolved.values()
        ];

    }

    private getTemplateFiles(
        template: TemplatePackage
    ): readonly ResolvedTemplateFile[] {

        const inheritedFiles =
            template
                .descriptors
                .resolvedFiles;

        if (
            inheritedFiles !==
            undefined
        ) {

            return inheritedFiles;

        }

        return (
            template.descriptors.files ??
            []
        ).map(
            (descriptor) => ({
                descriptor,

                templatePath:
                    template.path
            })
        );

    }

    private getIdentity(
        descriptor: FileDescriptor
    ): string {

        return descriptor.destination;

    }

}