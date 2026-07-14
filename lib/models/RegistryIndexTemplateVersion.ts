import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

/**
 * Describes one available template version in a registry index.
 */
export interface RegistryIndexTemplateVersion {

    version: string;

    downloadUrl: string;

    archiveFormat:
        TemplateArchiveFormat;

    sha256?: string;

}