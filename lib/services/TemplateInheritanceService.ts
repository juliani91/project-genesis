import {
    FolderDescriptor,
    ResolvedTemplateFile,
    TemplatePackage,
    Wizard
} from "../models";

import {
    ParentTemplateResolver
} from "./ParentTemplateResolver";

import {
    TemplateFileInheritanceService
} from "./TemplateFileInheritanceService";

import {
    TemplateFolderInheritanceService
} from "./TemplateFolderInheritanceService";

import {
    TemplatePackageService
} from "./TemplatePackageService";

import {
    TemplateWizardInheritanceService
} from "./TemplateWizardInheritanceService";

export class TemplateInheritanceService {

    public async resolve(
        template: TemplatePackage,
        templates: readonly TemplatePackage[]
    ): Promise<TemplatePackage> {

        const parentResolver =
            new ParentTemplateResolver();

        /*
         * ParentTemplateResolver returns:
         *
         * child → parent → root
         *
         * Descriptor merging needs:
         *
         * root → parent → child
         */
        const chain =
            [
                ...parentResolver.resolveChain(
                    template,
                    templates
                )
            ].reverse();

        const enrichedChain:
            TemplatePackage[] = [];

        for (const chainTemplate of chain) {

            enrichedChain.push(
                await this.enrichTemplate(
                    chainTemplate
                )
            );

        }

        const resolvedFiles =
            this.resolveFiles(
                enrichedChain
            );

        const resolvedFolders =
            this.resolveFolders(
                enrichedChain
            );

        const resolvedWizard =
            this.resolveWizard(
                enrichedChain
            );

        const childTemplate =
            enrichedChain[
                enrichedChain.length - 1
            ];

        return {
            ...childTemplate,

            descriptors: {
                ...childTemplate.descriptors,

                wizard:
                    resolvedWizard,

                folders: [
                    ...resolvedFolders
                ],

                files:
                    resolvedFiles.map(
                        (file) =>
                            file.descriptor
                    ),

                resolvedFiles: [
                    ...resolvedFiles
                ]
            }
        };

    }

private async enrichTemplate(
    template: TemplatePackage
): Promise<TemplatePackage> {

    const descriptors =
        template.descriptors;

    /*
     * Use property-presence checks instead of checking
     * whether the values are undefined.
     *
     * A descriptor property may intentionally exist with
     * an undefined value, such as a feature template that
     * does not define a wizard.
     */
    const hasWizardDescriptor =
        Object.prototype.hasOwnProperty.call(
            descriptors,
            "wizard"
        );

    const hasFolderDescriptors =
        Object.prototype.hasOwnProperty.call(
            descriptors,
            "folders"
        );

    const hasFileDescriptors =
        Object.prototype.hasOwnProperty.call(
            descriptors,
            "files"
        );

    if (
        hasWizardDescriptor &&
        hasFolderDescriptors &&
        hasFileDescriptors
    ) {

        return template;

    }

    const packageService =
        new TemplatePackageService();

    let enriched =
        template;

    if (!hasWizardDescriptor) {

        enriched =
            await packageService
                .enrichWithWizard(
                    enriched
                );

    }

    if (!hasFolderDescriptors) {

        enriched =
            await packageService
                .enrichWithFolders(
                    enriched
                );

    }

    if (!hasFileDescriptors) {

        enriched =
            await packageService
                .enrichWithFiles(
                    enriched
                );

    }

    return enriched;

}

    private resolveFiles(
        chain: readonly TemplatePackage[]
    ): readonly ResolvedTemplateFile[] {

        const service =
            new TemplateFileInheritanceService();

        return service.resolveChain(
            chain
        );

    }

    private resolveFolders(
        chain: readonly TemplatePackage[]
    ): readonly FolderDescriptor[] {

        if (chain.length === 0) {
            return [];
        }

        const service =
            new TemplateFolderInheritanceService();

        let resolved =
            chain[0];

        for (
            let index = 1;
            index < chain.length;
            index += 1
        ) {

            const child =
                chain[index];

            const folders =
                service.resolve(
                    resolved,
                    child
                );

            resolved = {
                ...child,

                descriptors: {
                    ...child.descriptors,

                    folders: [
                        ...folders
                    ]
                }
            };

        }

        return (
            resolved.descriptors.folders ??
            []
        );

    }

    private resolveWizard(
        chain: readonly TemplatePackage[]
    ): Wizard | undefined {

        const service =
            new TemplateWizardInheritanceService();

        let resolved:
            Wizard | undefined;

        for (const template of chain) {

            resolved =
                service.resolve(
                    resolved,
                    template.descriptors.wizard
                );

        }

        return resolved;

    }

}