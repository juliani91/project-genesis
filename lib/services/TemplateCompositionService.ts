import {
    FolderDescriptor,
    PackageInstallDescriptor,
    ResolvedTemplateFile,
    TemplateCompositionPlan,
    TemplatePackage,
    Wizard
} from "../models";

import {
    PackageInstallCompositionService
} from "./PackageInstallCompositionService";

import {
    TemplateInheritanceService
} from "./TemplateInheritanceService";

import {
    TemplateWizardInheritanceService
} from "./TemplateWizardInheritanceService";

export class TemplateCompositionService {

    public async compose(
        plan: TemplateCompositionPlan,
        availableTemplates:
            readonly TemplatePackage[]
    ): Promise<TemplatePackage> {

        const inheritanceService =
            new TemplateInheritanceService();

        const resolvedTemplates:
            TemplatePackage[] = [];

        for (
            const template
            of plan.orderedTemplates
        ) {

            resolvedTemplates.push(
                await inheritanceService.resolve(
                    template,
                    availableTemplates
                )
            );

        }

        const resolvedFiles =
            this.mergeFiles(
                resolvedTemplates
            );

        const folders =
            this.mergeFolders(
                resolvedTemplates
            );

        const wizard =
            this.mergeWizards(
                resolvedTemplates
            );

        const packageInstall =
            this.mergePackageInstall(
                resolvedTemplates
            );

        const baseTemplate =
            resolvedTemplates[0];

        if (!baseTemplate) {

            throw new Error(
                "A composition requires a base template."
            );

        }

        return {
            ...baseTemplate,

            descriptors: {
                ...baseTemplate.descriptors,

                wizard,

                folders,

                files:
                    resolvedFiles.map(
                        (file) =>
                            file.descriptor
                    ),

                resolvedFiles,

                packageInstall
            }
        };

    }

    private mergeFiles(
        templates:
            readonly TemplatePackage[]
    ): ResolvedTemplateFile[] {

        const resolved =
            new Map<
                string,
                ResolvedTemplateFile
            >();

        for (const template of templates) {

            const files =
                template
                    .descriptors
                    .resolvedFiles ??
                (
                    template
                        .descriptors
                        .files ??
                    []
                ).map(
                    (descriptor) => ({
                        descriptor,
                        templatePath:
                            template.path
                    })
                );

            for (const file of files) {

                const destination =
                    file.descriptor
                        .destination;

                if (
                    resolved.has(
                        destination
                    )
                ) {

                    throw new Error(
                        [
                            "Template composition file conflict:",
                            destination,
                            "is produced by more than one selected template."
                        ].join(" ")
                    );

                }

                resolved.set(
                    destination,
                    file
                );

            }

        }

        return [
            ...resolved.values()
        ];

    }

    private mergeFolders(
        templates:
            readonly TemplatePackage[]
    ): FolderDescriptor[] {

        const resolved =
            new Map<
                string,
                FolderDescriptor
            >();

        for (const template of templates) {

            const folders =
                template
                    .descriptors
                    .folders ??
                [];

            for (const folder of folders) {

                if (
                    !resolved.has(
                        folder.path
                    )
                ) {

                    resolved.set(
                        folder.path,
                        folder
                    );

                }

            }

        }

        return [
            ...resolved.values()
        ];

    }

    private mergeWizards(
        templates:
            readonly TemplatePackage[]
    ): Wizard | undefined {

        const service =
            new TemplateWizardInheritanceService();

        let resolved:
            Wizard | undefined;

        for (const template of templates) {

            resolved =
                service.resolve(
                    resolved,
                    template
                        .descriptors
                        .wizard
                );

        }

        return resolved;

    }

    private mergePackageInstall(
        templates:
            readonly TemplatePackage[]
    ): PackageInstallDescriptor | undefined {

        const service =
            new PackageInstallCompositionService();

        return service.compose(
            templates.map(
                (template) =>
                    template.descriptors
                        .packageInstall
            )
        );

    }

}
