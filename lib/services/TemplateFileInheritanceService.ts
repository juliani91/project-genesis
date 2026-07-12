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
     * Resolves a template chain ordered from:
     *
     * root parent → final child
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
                template.descriptors.files ?? [];

            for (const descriptor of files) {

                resolved.set(
                    this.getIdentity(
                        descriptor
                    ),
                    {
                        descriptor,
                        templatePath:
                            template.path
                    }
                );

            }

        }

        return [
            ...resolved.values()
        ];

    }

    private getIdentity(
        descriptor: FileDescriptor
    ): string {

        return descriptor.destination;

    }

}