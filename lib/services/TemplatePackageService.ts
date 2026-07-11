import path from "path";

import {
    loadFiles,
    loadFolders,
    loadWizard
} from "../loaders";

import { TemplatePackage } from "../models";

export class TemplatePackageService {

    public async enrichWithWizard(
        template: TemplatePackage
    ): Promise<TemplatePackage> {

        const wizard = await loadWizard(
            path.join(template.path, "wizard.json")
        );

        return {
            ...template,
            descriptors: {
                ...template.descriptors,
                wizard
            }
        };

    }

    public async enrichWithFolders(
        template: TemplatePackage
    ): Promise<TemplatePackage> {

        const folders = await loadFolders(
            path.join(template.path, "folders.json")
        );

        return {
            ...template,
            descriptors: {
                ...template.descriptors,
                folders
            }
        };

    }

    public async enrichWithFiles(
        template: TemplatePackage
    ): Promise<TemplatePackage> {

        const files = await loadFiles(
            path.join(template.path, "files.json")
        );

        return {
            ...template,
            descriptors: {
                ...template.descriptors,
                files
            }
        };

    }

}