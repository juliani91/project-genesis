import { FileDescriptor } from "./FileDescriptor";
import { FolderDescriptor } from "./FolderDescriptor";
import { ResolvedTemplateFile } from "./ResolvedTemplateFile";
import { PackageInstallDescriptor } from "./PackageInstallDescriptor";
import { Wizard } from "./Wizard";

export interface TemplateDescriptors {

    wizard?: Wizard;

    folders?: FolderDescriptor[];

    files?: FileDescriptor[];

    /**
     * Resolved files with the path of the template
     * that owns each source file.
     *
     * This is populated after inheritance resolution.
     */
    resolvedFiles?: ResolvedTemplateFile[];

    packageInstall?: PackageInstallDescriptor;

}
