import {
    FolderDescriptor,
    TemplatePackage
} from "../models";

export class TemplateFolderInheritanceService {

    public resolve(
        parent: TemplatePackage,
        child: TemplatePackage
    ): readonly FolderDescriptor[] {

        const parentFolders =
            parent.descriptors.folders ?? [];

        const childFolders =
            child.descriptors.folders ?? [];

        const resolved =
            new Map<
                string,
                FolderDescriptor
            >();

        for (const descriptor of parentFolders) {

            resolved.set(
                this.getIdentity(
                    descriptor
                ),
                descriptor
            );

        }

        for (const descriptor of childFolders) {

            resolved.set(
                this.getIdentity(
                    descriptor
                ),
                descriptor
            );

        }

        return [
            ...resolved.values()
        ];

    }

    private getIdentity(
        descriptor: FolderDescriptor
    ): string {

        return descriptor.path;

    }

}