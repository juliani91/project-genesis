import { TemplateManifest } from "./TemplateManifest";
import { TemplateDescriptors } from "./TemplateDescriptors";

export interface TemplatePackage {
    manifest: TemplateManifest;

    path: string;

    descriptors: TemplateDescriptors;
}