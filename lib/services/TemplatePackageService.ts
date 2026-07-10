import path from "path";

import { loadWizard } from "../loaders/WizardLoader";
import { TemplatePackage } from "../models";

export class TemplatePackageService {

    async enrichWithWizard(
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

}