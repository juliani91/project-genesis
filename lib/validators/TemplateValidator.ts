import { TemplatePackage } from "../models/TemplatePackage";

export class TemplateValidator {

    validate(template: TemplatePackage): string[] {

        const errors: string[] = [];

        if (!template.manifest.name) {
            errors.push("Template name is required.");
        }

        if (!template.manifest.version) {
            errors.push("Template version is required.");
        }

        if (!template.descriptors.wizard) {
            errors.push("Wizard descriptor has not been loaded.");
        }
        if (!template.descriptors.folders) {
            errors.push(
                "Folder descriptors have not been loaded."
            );
        }

        if (!template.descriptors.files) {
            errors.push(
                "File descriptors have not been loaded."
            );
        }

        return errors;
    }

}